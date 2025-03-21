'use client'

import { useQuery } from '@tanstack/react-query'
import { TokenSymbol } from '@/app/stores/useTokenStore'

interface TokenPrice {
    symbol: TokenSymbol
    price: string
    estimatedGas: string
    decimals: number
}

type TokenPricesRecord = Record<TokenSymbol, { price: string; estimatedGas: string; decimals: number }>

interface UseTokenPricesReturn {
    prices: TokenPricesRecord | null
    isLoading: boolean
    isError: boolean
    refresh: () => void
}

async function fetchPrices(): Promise<TokenPricesRecord> {
    const response = await fetch('/api/prices')

    if (!response.ok) {
        throw new Error('Failed to fetch prices')
    }

    const data = await response.json()

    // Transform array to record
    return data.prices.reduce((acc: TokenPricesRecord, item: TokenPrice) => {
        acc[item.symbol] = {
            price: item.price,
            estimatedGas: item.estimatedGas,
            decimals: item.decimals
        }
        return acc
    }, {})
}

const REFETCH_INTERVAL = 30000 // 30 seconds

export function useTokenPrices(): UseTokenPricesReturn {
    const query = useQuery({
        queryKey: ['prices'],
        queryFn: fetchPrices,
        refetchInterval: REFETCH_INTERVAL,
        staleTime: REFETCH_INTERVAL, // Match staleTime with refetchInterval
        gcTime: REFETCH_INTERVAL * 2, // Keep unused data in cache longer
        refetchOnWindowFocus: false,
        select: (data) => {
            // Only return new data if it's different from previous
            return data
        },
    })

    return {
        prices: query.data ?? null,
        isLoading: query.isLoading,
        isError: query.isError,
        refresh: () => { query.refetch() }
    }
} 