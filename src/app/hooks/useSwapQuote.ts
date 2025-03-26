'use client'

import { useQuery } from '@tanstack/react-query'
import { TokenSymbol } from '@/app/stores/useTokenStore'
import { fetchSwapQuote, queryKeys } from '@/app/api/queries'

interface UseSwapQuoteParams {
  sellToken: TokenSymbol
  buyToken: TokenSymbol
  sellAmount: string
  userAddress: string
  feeBps: string
  enabled?: boolean
  shouldFetch?: boolean
}

export function useSwapQuote({
  sellToken,
  buyToken,
  sellAmount,
  userAddress,
  feeBps,
  enabled = true,
  shouldFetch = false,
}: UseSwapQuoteParams) {
  return useQuery({
    queryKey: queryKeys.swapQuote({ sellToken, buyToken, sellAmount, userAddress }),
    queryFn: () => fetchSwapQuote({ sellToken, buyToken, sellAmount, userAddress, feeBps }),
    enabled: enabled && shouldFetch && Boolean(sellToken && buyToken && sellAmount && Number(sellAmount) > 0 && sellToken !== buyToken),
    staleTime: 10000, // Quote is stale after 10 seconds
    gcTime: 20000, // Remove from cache after 20 seconds
    retry: 1, // Only retry once on failure
  })
} 