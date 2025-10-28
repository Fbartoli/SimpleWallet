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

// In-memory cache for token info
interface TokenInfoCache {
    data: unknown
    timestamp: number
}

const tokenInfoCache = new Map<string, TokenInfoCache>()
const CACHE_DURATION = 300_000 // 5 minutes (token info doesn't change often)

export async function GET(request: NextRequest) {
    const startTime = Date.now()

    try {
        // Get query parameters
        const searchParams = request.nextUrl.searchParams
        const contractAddress = searchParams.get("contract_address")
        const chainIds = searchParams.get("chain_ids")
        const limit = searchParams.get("limit")
        const offset = searchParams.get("offset")

        // Log incoming request
        logger.info("Token info API request", {
            component: "token-info-api",
            metadata: {
                contractAddress,
                chainIds,
                limit,
                offset,
                userAgent: request.headers.get("user-agent"),
                ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
            },
        })

        if (!contractAddress) {
            logger.warn("Token info API: Missing contract address", {
                component: "token-info-api",
                metadata: { searchParams: Object.fromEntries(searchParams.entries()) },
            })
            return NextResponse.json(
                { error: "Contract address is required" },
                { status: 400 }
            )
        }

        // Validate contract address format (allow 'native' for native tokens)
        if (contractAddress !== "native" && !/^0x[a-fA-F0-9]{40}$/.test(contractAddress)) {
            logger.warn("Token info API: Invalid contract address format", {
                component: "token-info-api",
                metadata: { contractAddress },
            })
            return NextResponse.json(
                { error: "Invalid contract address format" },
                { status: 400 }
            )
        }

        // Generate cache key
        const cacheKey = `token-info:${contractAddress}:${chainIds || "all"}:${limit || "default"}:${offset || "0"}`
        
        // Check cache first
        const cached = tokenInfoCache.get(cacheKey)
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            const headers = new Headers()
            headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600")
            headers.set("X-Cache-Status", "HIT")
            
            logger.info("Token info API cache hit", {
                component: "token-info-api",
                metadata: { contractAddress, chainIds: chainIds || "all" },
            })
            
            return NextResponse.json(cached.data, { headers })
        }

        // Fetch token info from Dune with rate limiting - use "all" for chain_ids if not specified
        const response = await duneRateLimiter.execute(async () => {
            return duneClient.getTokenInfo(contractAddress, {
                chain_ids: chainIds || "all",
                limit: limit ? parseInt(limit) : undefined,
                offset: offset || undefined,
            })
        }, "dune-token-info")

        // Cache the response
        tokenInfoCache.set(cacheKey, {
            data: response,
            timestamp: Date.now(),
        })

        // Clean up old cache entries
        if (tokenInfoCache.size > 100) {
            const entries = Array.from(tokenInfoCache.entries())
            const oldestEntry = entries
                .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0]
            if (oldestEntry) {
                tokenInfoCache.delete(oldestEntry[0])
            }
        }

        const duration = Date.now() - startTime

        // Log successful response
        logger.info("Token info API success", {
            component: "token-info-api",
            metadata: {
                contractAddress,
                chainIds: chainIds || "all",
                tokensCount: response?.tokens?.length || 0,
                duration: `${duration}ms`,
                hasNextOffset: !!response?.next_offset,
            },
        })

        // Add cache headers for better performance
        const headers = new Headers()
        headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600") // 5 min cache, 10 min stale
        headers.set("CDN-Cache-Control", "public, s-maxage=300")
        headers.set("Vercel-CDN-Cache-Control", "public, s-maxage=300")
        headers.set("X-Cache-Status", "MISS")

        return NextResponse.json(response, { headers })

    } catch (error) {
        const duration = Date.now() - startTime

        logger.error("Error fetching token info", {
            component: "token-info-api",
            metadata: {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                duration: `${duration}ms`,
                contractAddress: request.nextUrl.searchParams.get("contract_address"),
                chainIds: request.nextUrl.searchParams.get("chain_ids"),
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
                    {
                        status: 429,
                        headers: {
                            "Cache-Control": "no-cache",
                            "Retry-After": "60",
                        },
                    }
                )
            }
            if (error.message.includes("HTTP error! status: 404")) {
                return NextResponse.json(
                    { error: "Token not found" },
                    { status: 404 }
                )
            }
        }

        return NextResponse.json(
            { error: "Failed to fetch token info" },
            { status: 500 }
        )
    }
} 