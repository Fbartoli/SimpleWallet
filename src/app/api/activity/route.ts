import { NextRequest, NextResponse } from "next/server"
import { DuneClient } from "@/lib/DuneClient"
import { logger } from "@/lib/logger"
import { duneRateLimiter } from "@/lib/rate-limiter"

if (!process.env.DUNE_API_KEY) {
    throw new Error("DUNE_API_KEY environment variable is not set")
}

const duneClient = new DuneClient({
    apiKey: process.env.DUNE_API_KEY,
})

// In-memory cache for activity data
interface ActivityCache {
    data: unknown
    timestamp: number
}

const activityCache = new Map<string, ActivityCache>()
const CACHE_DURATION = 30_000 // 30 seconds

export async function GET(request: NextRequest) {
    try {
        // Get query parameters
        const searchParams = request.nextUrl.searchParams
        const address = searchParams.get("address")
        const limit = searchParams.get("limit")
        const offset = searchParams.get("offset")
        const chainIds = searchParams.get("chain_ids")
        const fetchAll = searchParams.get("fetch_all")

        if (!address) {
            return NextResponse.json(
                { error: "Wallet address is required" },
                { status: 400 }
            )
        }

        // Validate address format
        if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
            return NextResponse.json(
                { error: "Invalid wallet address format" },
                { status: 400 }
            )
        }

        // Generate cache key
        const cacheKey = `activity:${address}:${chainIds || "all"}:${limit || "default"}:${offset || "0"}:${fetchAll || "false"}`
        
        // Check cache first
        const cached = activityCache.get(cacheKey)
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            const headers = new Headers()
            headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=120")
            headers.set("X-Cache-Status", "HIT")
            return NextResponse.json(cached.data, { headers })
        }

        // Fetch activity from Dune with rate limiting
        let response
        
        if (fetchAll === "true") {
            // Fetch all activities using pagination with rate limiting
            response = await duneRateLimiter.execute(async () => {
                const allActivities = await duneClient.getAllActivity(address, {
                    chain_ids: chainIds || undefined,
                })

                return {
                    activity: allActivities,
                    next_offset: null,
                }
            }, "dune-activity")
        } else {
            // Fetch single page of activities with rate limiting
            response = await duneRateLimiter.execute(async () => {
                return duneClient.getActivity(address, {
                    limit: limit ? parseInt(limit) : undefined,
                    offset: offset || undefined,
                    chain_ids: chainIds || undefined,
                })
            }, "dune-activity")

            if (!response.activity) {
                return NextResponse.json(
                    { error: "No activity data received" },
                    { status: 500 }
                )
            }
        }

        // Cache the response
        activityCache.set(cacheKey, {
            data: response,
            timestamp: Date.now(),
        })

        // Clean up old cache entries (simple LRU cleanup)
        if (activityCache.size > 50) {
            const entries = Array.from(activityCache.entries())
            const oldestEntry = entries
                .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0]
            if (oldestEntry) {
                activityCache.delete(oldestEntry[0])
            }
        }

        // Add cache headers for better performance
        const headers = new Headers()
        headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=120")
        headers.set("CDN-Cache-Control", "public, s-maxage=30")
        headers.set("Vercel-CDN-Cache-Control", "public, s-maxage=30")
        headers.set("X-Cache-Status", "MISS")

        return NextResponse.json(response, { headers })

    } catch (error) {
        logger.error("Error fetching activity", {
            component: "activity-api",
            metadata: {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
            },
        })

        // Return more specific error messages
        if (error instanceof Error) {
            if (error.message.includes("HTTP error! status: 401")) {
                return NextResponse.json(
                    { error: "Invalid API key" },
                    { status: 401 }
                )
            }
            if (error.message.includes("HTTP error! status: 429")) {
                return NextResponse.json(
                    { error: "Rate limit exceeded. Please try again later." },
                    { status: 429 }
                )
            }
        }

        return NextResponse.json(
            { error: "Failed to fetch activity" },
            { status: 500 }
        )
    }
} 