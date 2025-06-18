'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchAllActivity, queryKeys } from '@/app/api/queries'

interface UseActivityParams {
    chain_ids?: string
}

export function useActivity(address: string, params?: UseActivityParams) {
    return useQuery({
        queryKey: queryKeys.allActivity(address, params),
        queryFn: () => fetchAllActivity(address, params),
        enabled: Boolean(address),
        refetchInterval: 30000, // Refetch every 30 seconds
        staleTime: 15000, // Consider data stale after 15 seconds
        retry: (failureCount, error) => {
            // Don't retry on client errors (4xx), but retry on server errors
            if (error instanceof Error && error.message.includes('status: 4')) {
                return false
            }
            return failureCount < 3
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    })
} 