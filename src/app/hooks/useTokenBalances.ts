'use client'

import { useQuery } from '@tanstack/react-query'
import { DuneBalance } from '@/types/dune'
import { base } from 'viem/chains'

const REFETCH_INTERVAL = 10_000 // 10 seconds

async function fetchBalances(address: string): Promise<DuneBalance[]> {
  if (!address) return []

  const response = await fetch(`/api/balance?address=${address}&chain_ids=${base.id}`)
  if (!response.ok) {
    throw new Error('Failed to fetch balances')
  }

  const data = await response.json()
  return data.balances
}

export function useTokenBalances(address: string) {
  const query = useQuery({
    queryKey: ['balances', address],
    queryFn: () => fetchBalances(address),
    enabled: Boolean(address),
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
    balances: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refresh: query.refetch
  }
} 