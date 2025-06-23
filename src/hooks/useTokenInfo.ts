"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchTokenInfo, queryKeys } from "@/app/api/queries"

export function useTokenInfo(contractAddress: string, chainIds?: string) {
    return useQuery({
        queryKey: queryKeys.tokenInfo(contractAddress, { chain_ids: chainIds }),
        queryFn: () => fetchTokenInfo(contractAddress, { chain_ids: chainIds }),
        enabled: Boolean(contractAddress),
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: (failureCount, error) => {
            // Don't retry on client errors (4xx), but retry on server errors
            if (error instanceof Error && error.message.includes("status: 4")) {
                return false
            }
            return failureCount < 3
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    })
} 