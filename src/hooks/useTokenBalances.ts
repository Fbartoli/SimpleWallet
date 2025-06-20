"use client"

import { useCallback, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { fetchBalances, queryKeys } from "@/app/api/queries"
import { useTokenStore } from "@/stores/useTokenStore"
import { BALANCE_REFETCH_INTERVAL, BALANCE_STALE_TIME } from "@/config/constants"

export function useTokenBalances(address: string) {
  const {
    balances,
    balanceLoadingState,
    optimisticUpdate,
    updateBalances,
    setBalanceLoading,
    setBalanceError,
    clearErrors,
    getTotalUSDValue,
    getTokensWithBalance,
    applyOptimisticSwap,
    revertOptimisticSwap,
    confirmOptimisticSwap,
  } = useTokenStore()

  // React Query for data fetching
  const query = useQuery({
    queryKey: queryKeys.balances(address),
    queryFn: () => fetchBalances(address),
    enabled: Boolean(address),
    refetchInterval: BALANCE_REFETCH_INTERVAL,
    staleTime: BALANCE_STALE_TIME,
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
    setBalanceLoading(query.isLoading)
  }, [query.isLoading, setBalanceLoading])

  useEffect(() => {
    if (query.error) {
      setBalanceError(query.error.message)
    } else {
      clearErrors()
    }
  }, [query.error, setBalanceError, clearErrors])

  useEffect(() => {
    if (query.data) {
      updateBalances(query.data)
    }
  }, [query.data, updateBalances])

  const refresh = useCallback(() => {
    clearErrors()
    return query.refetch()
  }, [query, clearErrors])

  // Convert store balances to the expected format for backward compatibility
  const legacyBalances = Object.values(balances)
    .filter(balance => balance.value > 0n)
    .map(balance => ({
      address: Object.values(useTokenStore.getState().balances).find(b => b.symbol === balance.symbol)?.symbol || "",
      amount: balance.value.toString(),
      decimals: balance.decimals,
      symbol: balance.symbol,
      chain_id: 8453, // Base chain
    }))

  return {
    // Store data
    balances: legacyBalances,
    storeBalances: balances,

    // Loading states
    isLoading: balanceLoadingState.isLoading,
    error: balanceLoadingState.error ? new Error(balanceLoadingState.error) : null,

    // Computed values
    totalUSDValue: getTotalUSDValue(),
    tokensWithBalance: getTokensWithBalance(),

    // Optimistic updates
    optimisticUpdate,
    applyOptimisticSwap,
    revertOptimisticSwap,
    confirmOptimisticSwap,

    // Actions
    refresh,

    // Query metadata
    isFetching: query.isFetching,
    isStale: query.isStale,
    lastFetch: balanceLoadingState.lastFetch,
    dataUpdatedAt: query.dataUpdatedAt,
  }
} 