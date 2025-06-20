"use client"

import { useQuery } from "@tanstack/react-query"
import { TokenSymbol } from "@/stores/useTokenStore"
import { fetchSwapQuote, queryKeys } from "@/app/api/queries"

interface UseSwapQuoteParams {
  sellToken: TokenSymbol
  buyToken: TokenSymbol
  sellAmount: string
  taker: string
  enabled?: boolean
  shouldFetch?: boolean
}

export function useSwapQuote({
  sellToken,
  buyToken,
  sellAmount,
  taker,
  enabled = true,
  shouldFetch = false,
}: UseSwapQuoteParams) {
  return useQuery({
    queryKey: queryKeys.swapQuote({ sellToken, buyToken, sellAmount, taker }),
    queryFn: () => fetchSwapQuote({ sellToken, buyToken, sellAmount, taker }),
    enabled: enabled && shouldFetch && Boolean(sellToken && buyToken && sellAmount && Number(sellAmount) > 0 && sellToken !== buyToken),
    staleTime: 10000, // Quote is stale after 10 seconds
    gcTime: 20000, // Remove from cache after 20 seconds
    retry: 1, // Only retry once on failure
  })
} 