'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchPrices, queryKeys, type TokenPricesRecord } from '@/app/api/queries'

const REFETCH_INTERVAL = 30000 // 30 seconds

interface UseTokenPricesReturn {
    prices: TokenPricesRecord | null
    isLoading: boolean
    isError: boolean
    refresh: () => void
}

export function useTokenPrices(): UseTokenPricesReturn {
    const query = useQuery({
        queryKey: queryKeys.prices,
        queryFn: fetchPrices,
        refetchInterval: REFETCH_INTERVAL,
        staleTime: REFETCH_INTERVAL,
    })

    return {
        prices: query.data ?? null,
        isLoading: query.isLoading,
        isError: query.isError,
        refresh: () => { query.refetch() }
    }
} 