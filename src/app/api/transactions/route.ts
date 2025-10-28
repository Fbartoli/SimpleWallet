import { DuneClient } from "@/lib/DuneClient"
import { NextRequest, NextResponse } from "next/server"
import { base } from "viem/chains"
import { logger } from "@/lib/logger"
import { duneRateLimiter } from "@/lib/rate-limiter"

// In-memory cache for transaction data
interface TransactionCache {
    data: unknown
    timestamp: number
}

const transactionCache = new Map<string, TransactionCache>()
const CACHE_DURATION = 10_000 // 10 seconds

export async function GET(request: NextRequest) {
    try {
        // Get address from query params
        const { searchParams } = new URL(request.url)
        const address = searchParams.get("address")
        const limit = searchParams.get("limit")

        if (!address) {
            return NextResponse.json(
                { error: "Address is required" },
                { status: 400 }
            )
        }

        // Generate cache key
        const cacheKey = `transactions:${address}:${limit || "10"}`
        
        // Check cache first
        const cached = transactionCache.get(cacheKey)
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            const headers = new Headers()
            headers.set("Cache-Control", "public, s-maxage=10, stale-while-revalidate=60")
            headers.set("X-Cache-Status", "HIT")
            return NextResponse.json(cached.data, { headers })
        }

        // Initialize Dune client with server-side API key
        const client = new DuneClient({
            apiKey: process.env.DUNE_API_KEY!,
        })

        // Fetch with rate limiting
        const response = await duneRateLimiter.execute(async () => {
            return client.getTransactions(address, {
                chain_ids: base.id.toString(),
                limit: limit ? parseInt(limit) : 10,
                decode: true,
                log_address: address,
            })
        }, "dune-transactions")

        // Cache the response
        transactionCache.set(cacheKey, {
            data: response,
            timestamp: Date.now(),
        })

        // Clean up old cache entries
        if (transactionCache.size > 50) {
            const entries = Array.from(transactionCache.entries())
            const oldestEntry = entries
                .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0]
            if (oldestEntry) {
                transactionCache.delete(oldestEntry[0])
            }
        }

        const headers = new Headers()
        headers.set("Cache-Control", "public, s-maxage=10, stale-while-revalidate=60")
        headers.set("X-Cache-Status", "MISS")
        
        return NextResponse.json(response, { headers })
    } catch (error) {
        logger.error("Error fetching transactions", {
            component: "transactions-api",
            metadata: {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
            },
        })

        // Handle rate limit errors
        if (error instanceof Error && error.message.includes("HTTP error! status: 429")) {
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

        return NextResponse.json(
            { error: "Failed to fetch transactions" },
            { status: 500, headers: { "Cache-Control": "no-cache" } }
        )
    }
} 