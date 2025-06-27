import { NextRequest, NextResponse } from "next/server"
import { DuneClient } from "@/lib/DuneClient"
import { logger } from "@/lib/logger"

if (!process.env.DUNE_API_KEY) {
    throw new Error("DUNE_API_KEY environment variable is not set")
}

const duneClient = new DuneClient({
    apiKey: process.env.DUNE_API_KEY,
})

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

        // Fetch token info from Dune - use "all" for chain_ids if not specified
        const response = await duneClient.getTokenInfo(contractAddress, {
            chain_ids: chainIds || "all",
            limit: limit ? parseInt(limit) : undefined,
            offset: offset || undefined,
        })

        const duration = Date.now() - startTime

        // Log successful response
        console.log("response", response)
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
                    { status: 429 }
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