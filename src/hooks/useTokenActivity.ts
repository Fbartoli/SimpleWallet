"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchAllActivity, queryKeys } from "@/app/api/queries"
import { DuneActivity } from "@/types/dune"
import { useMemo } from "react"

interface UseTokenActivityParams {
    tokenAddress?: string
    tokenSymbol?: string
    chain_ids?: string
}

export function useTokenActivity(address: string, params?: UseTokenActivityParams) {
    const { data: allActivity, isLoading, error, refetch } = useQuery({
        queryKey: queryKeys.allActivity(address, { chain_ids: params?.chain_ids }),
        queryFn: () => fetchAllActivity(address, { chain_ids: params?.chain_ids }),
        enabled: Boolean(address),
        refetchInterval: 30000, // Refetch every 30 seconds
        staleTime: 15000, // Consider data stale after 15 seconds
        retry: (failureCount, error) => {
            // Don't retry on client errors (4xx), but retry on server errors
            if (error instanceof Error && error.message.includes("status: 4")) {
                return false
            }
            return failureCount < 3
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    })

    // Filter activities based on token address or symbol
    const filteredActivity = useMemo(() => {
        if (!allActivity || !Array.isArray(allActivity)) {
            return []
        }

        if (!params?.tokenAddress && !params?.tokenSymbol) {
            return allActivity
        }

        return allActivity.filter((activity: DuneActivity) => {
            // Filter by token address
            if (params.tokenAddress) {
                if (activity.asset_type === "native" && params.tokenAddress.toLowerCase() === "native") {
                    return true
                }
                if (activity.token_address &&
                    activity.token_address.toLowerCase() === params.tokenAddress.toLowerCase()) {
                    return true
                }
            }

            // Filter by token symbol
            if (params.tokenSymbol) {
                if (activity.token_metadata?.symbol?.toLowerCase() === params.tokenSymbol.toLowerCase()) {
                    return true
                }
            }

            return false
        })
    }, [allActivity, params?.tokenAddress, params?.tokenSymbol])

    // Sort by timestamp (newest first)
    const sortedActivity = useMemo(() => {
        return [...filteredActivity].sort((a, b) => {
            const timeA = new Date(a.block_time).getTime()
            const timeB = new Date(b.block_time).getTime()
            return timeB - timeA // Newest first
        })
    }, [filteredActivity])

    return {
        data: sortedActivity,
        isLoading,
        error,
        refetch,
    }
} 