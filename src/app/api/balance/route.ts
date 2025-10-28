import { NextRequest, NextResponse } from "next/server"
import { DuneClient } from "@/lib/DuneClient"
import { getWhitelistedAddresses } from "@/config/constants"
import { logger } from "@/lib/logger"
import { duneRateLimiter } from "@/lib/rate-limiter"

if (!process.env.DUNE_API_KEY) {
    throw new Error("DUNE_API_KEY environment variable is not set")
}

const duneClient = new DuneClient({
    apiKey: process.env.DUNE_API_KEY,
})

// In-memory cache for balance data (with proper TypeScript types)
interface BalanceData {
    balances: Array<{
        address: string
        amount: string
        decimals: number
        symbol: string
        chain_id: number
    }>
    filtered: boolean
    whitelisted_count: number
    total_count: number
}

interface CacheEntry {
    data: BalanceData
    timestamp: number
    etag: string
}

const cache = new Map<string, CacheEntry>()
const CACHE_DURATION = 10_000 // 10 seconds
const STALE_WHILE_REVALIDATE = 30_000 // 30 seconds

// Request deduplication map
const pendingRequests = new Map<string, Promise<BalanceData>>()

function generateCacheKey(address: string, chainIds?: string, limit?: string): string {
    return `balance:${address}:${chainIds || "all"}:${limit || "default"}`
}

function generateETag(data: BalanceData): string {
    return Buffer.from(JSON.stringify(data)).toString("base64").slice(0, 16)
}

function getCachedData(cacheKey: string): CacheEntry | null {
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < STALE_WHILE_REVALIDATE) {
        return cached
    }
    return null
}

function setCachedData(cacheKey: string, data: BalanceData): void {
    const etag = generateETag(data)
    cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        etag,
    })

    // Clean up old cache entries (simple LRU cleanup)
    if (cache.size > 100) {
        const entries = Array.from(cache.entries())
        const oldestEntry = entries
            .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0]
        if (oldestEntry) {
            cache.delete(oldestEntry[0])
        }
    }
}

async function fetchBalanceData(address: string, chainIds?: string, limit?: number) {
    // Fetch with rate limiting
    const response = await duneRateLimiter.execute(async () => {
        return duneClient.getTokenBalances(address, {
            chain_ids: chainIds || undefined,
            limit: limit || undefined,
        })
    }, "dune-balance")

    if (!response.balances) {
        throw new Error("No balance data received")
    }

    // Filter to only include whitelisted tokens
    const whitelistedAddresses = getWhitelistedAddresses()
    const filteredBalances = response.balances.filter(balance =>
        whitelistedAddresses.includes(balance.address.toLowerCase())
    )

    // Sort by USD value (descending) if available, otherwise by symbol
    const sortedBalances = filteredBalances.sort((a, b) => {
        // First sort by amount (descending)
        const amountA = Number(a.amount) / Math.pow(10, a.decimals)
        const amountB = Number(b.amount) / Math.pow(10, b.decimals)

        if (amountA !== amountB) {
            return amountB - amountA
        }

        // If amounts are equal, sort by symbol alphabetically
        return a.symbol.localeCompare(b.symbol)
    })

    return {
        ...response,
        balances: sortedBalances,
        filtered: true,
        whitelisted_count: sortedBalances.length,
        total_count: response.balances.length,
    }
}

export async function GET(request: NextRequest) {
    try {
        // Get query parameters
        const searchParams = request.nextUrl.searchParams
        const address = searchParams.get("address")
        const chainIds = searchParams.get("chain_ids")
        const limit = searchParams.get("limit")

        if (!address) {
            return NextResponse.json(
                { error: "Wallet address is required" },
                { status: 400, headers: { "Cache-Control": "no-cache" } }
            )
        }

        // Validate address format
        if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
            return NextResponse.json(
                { error: "Invalid wallet address format" },
                { status: 400, headers: { "Cache-Control": "no-cache" } }
            )
        }

        const cacheKey = generateCacheKey(address, chainIds || undefined, limit || undefined)

        // Check client-side cache headers
        const ifNoneMatch = request.headers.get("if-none-match")
        const cached = getCachedData(cacheKey)

        // Return 304 if client has fresh data
        if (cached && ifNoneMatch === cached.etag) {
            return new NextResponse(null, {
                status: 304,
                headers: {
                    "Cache-Control": "public, max-age=5, stale-while-revalidate=30",
                    "ETag": cached.etag,
                },
            })
        }

        // Return cached data if still fresh
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            const headers = new Headers()
            headers.set("Cache-Control", "public, max-age=5, stale-while-revalidate=30")
            headers.set("CDN-Cache-Control", "public, s-maxage=5")
            headers.set("Vercel-CDN-Cache-Control", "public, s-maxage=5")
            headers.set("ETag", cached.etag)
            headers.set("X-Cache-Status", "HIT")

            return NextResponse.json(cached.data, { headers })
        }

        // Check for pending request (deduplication)
        if (pendingRequests.has(cacheKey)) {
            const result = await pendingRequests.get(cacheKey)!
            const headers = new Headers()
            headers.set("Cache-Control", "public, max-age=5, stale-while-revalidate=30")
            headers.set("X-Cache-Status", "DEDUP")

            return NextResponse.json(result, { headers })
        }

        // Create new request promise
        const requestPromise = fetchBalanceData(address, chainIds || undefined, limit ? parseInt(limit) : undefined)
        pendingRequests.set(cacheKey, requestPromise)

        try {
            const result = await requestPromise

            // Cache the result
            setCachedData(cacheKey, result)

            // Cleanup pending request
            pendingRequests.delete(cacheKey)

            // Add optimized cache headers
            const headers = new Headers()
            headers.set("Cache-Control", "public, max-age=5, stale-while-revalidate=30")
            headers.set("CDN-Cache-Control", "public, s-maxage=5")
            headers.set("Vercel-CDN-Cache-Control", "public, s-maxage=5")
            headers.set("ETag", generateETag(result))
            headers.set("X-Cache-Status", "MISS")

            return NextResponse.json(result, { headers })

        } catch (fetchError) {
            // Cleanup pending request on error
            pendingRequests.delete(cacheKey)
            throw fetchError
        }

    } catch (error) {
        logger.error("Error fetching balances", {
            component: "balance-api",
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
                    {
                        status: 401,
                        headers: { "Cache-Control": "no-cache" },
                    }
                )
            }
            if (error.message.includes("HTTP error! status: 429")) {
                return NextResponse.json(
                    { error: "Rate limit exceeded. Please try again later." },
                    {
                        status: 429,
                        headers: {
                            "Cache-Control": "no-cache",
                            "Retry-After": "60",
                        },
                    }
                )
            }
        }

        return NextResponse.json(
            { error: "Failed to fetch balances" },
            {
                status: 500,
                headers: { "Cache-Control": "no-cache" },
            }
        )
    }
} 