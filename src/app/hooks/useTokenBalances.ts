'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchBalances, queryKeys } from '@/app/api/queries'

const REFETCH_INTERVAL = 10_000 // 10 seconds

export function useTokenBalances(address: string) {
  const query = useQuery({
    queryKey: queryKeys.balances(address),
    queryFn: () => fetchBalances(address),
    enabled: Boolean(address),
    refetchInterval: REFETCH_INTERVAL,
    staleTime: REFETCH_INTERVAL,
  })

  return {
    balances: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refresh: query.refetch
  }
} 