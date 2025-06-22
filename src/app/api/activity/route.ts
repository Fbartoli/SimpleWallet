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

        // Fetch activity from Dune
        if (fetchAll === "true") {
            // Fetch all activities using pagination
            const allActivities = await duneClient.getAllActivity(address, {
                chain_ids: chainIds || undefined,
            })

            const response = {
                activity: allActivities,
                next_offset: null,
            }

            // Add cache headers for better performance
            const headers = new Headers()
            headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=120")
            headers.set("CDN-Cache-Control", "public, s-maxage=30")
            headers.set("Vercel-CDN-Cache-Control", "public, s-maxage=30")

            return NextResponse.json(response, { headers })
        } else {
            // Fetch single page of activities
            const response = await duneClient.getActivity(address, {
                limit: limit ? parseInt(limit) : undefined,
                offset: offset || undefined,
                chain_ids: chainIds || undefined,
            })

            if (!response.activity) {
                return NextResponse.json(
                    { error: "No activity data received" },
                    { status: 500 }
                )
            }

            // Add cache headers for better performance
            const headers = new Headers()
            headers.set("Cache-Control", "public, s-maxage=10, stale-while-revalidate=60")
            headers.set("CDN-Cache-Control", "public, s-maxage=10")
            headers.set("Vercel-CDN-Cache-Control", "public, s-maxage=10")

            return NextResponse.json(response, { headers })
        }

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