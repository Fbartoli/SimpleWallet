"use client"

import { useCallback, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { fetchPrices, queryKeys } from "@/app/api/queries"
import { useTokenStore } from "@/stores/useTokenStore"
import { PRICE_REFETCH_INTERVAL, PRICE_STALE_TIME } from "@/config/constants"

export function useTokenPrices() {
    const {
        prices,
        priceLoadingState,
        updatePrices,
        setPriceLoading,
        setPriceError,
        clearErrors,
    } = useTokenStore()

    // React Query for data fetching
    const query = useQuery({
        queryKey: queryKeys.prices,
        queryFn: fetchPrices,
        refetchInterval: PRICE_REFETCH_INTERVAL,
        staleTime: PRICE_STALE_TIME,
        retry: (failureCount, error) => {
            // Don't retry on client errors (4xx), but retry on server errors
            if (error instanceof Error && error.message.includes("status: 4")) {
                return false
            }
            return failureCount < 3
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    })

    // Sync query state with store
    useEffect(() => {
        setPriceLoading(query.isLoading)
    }, [query.isLoading, setPriceLoading])

    useEffect(() => {
        if (query.error) {
            setPriceError(query.error.message)
        } else {
            clearErrors()
        }
    }, [query.error, setPriceError, clearErrors])

    useEffect(() => {
        if (query.data) {
            updatePrices(query.data)
        }
    }, [query.data, updatePrices])

    const refresh = useCallback(() => {
        clearErrors()
        return query.refetch()
    }, [query, clearErrors])

    // Convert store prices to legacy format for backward compatibility
    const legacyPrices = Object.entries(prices).reduce((acc, [symbol, priceData]) => ({
        ...acc,
        [symbol]: {
            price: priceData.price.toString(),
            estimatedGas: priceData.estimatedGas,
            decimals: 2, // Default for price display
        },
    }), {})

    return {
        // Store data
        prices: legacyPrices,
        storePrices: prices,

        // Loading states
        isLoading: priceLoadingState.isLoading,
        isError: Boolean(priceLoadingState.error),
        error: priceLoadingState.error,

        // Actions
        refresh,

        // Query metadata
        isFetching: query.isFetching,
        isStale: query.isStale,
        lastFetch: priceLoadingState.lastFetch,
        dataUpdatedAt: query.dataUpdatedAt,
    }
} 