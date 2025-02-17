import { useQuery } from '@tanstack/react-query'
import { type ZeroXQuote } from '@/app/types/quote'
import { FEE_RECIPIENT } from '../config/constants'
import { base } from 'viem/chains'
import { Address } from 'viem'
import { TokenSymbol } from '../stores/useTokenStore'

interface UseSwapQuoteParams {
  sellToken: TokenSymbol
  buyToken: TokenSymbol
  sellAmount: string
  userAddress: string
  feeBps: string
  enabled?: boolean
  shouldFetch?: boolean
}

async function fetchQuote({
  sellToken,
  buyToken,
  sellAmount,
  userAddress,
  feeBps,
}: Omit<UseSwapQuoteParams, 'enabled' | 'shouldFetch'>): Promise<ZeroXQuote> {
  const params = new URLSearchParams({
    sellToken,
    sellAmount,
    buyToken,
    taker: userAddress,
    swapFeeBps: feeBps,
    swapFeeToken: sellToken,
  })

  const response = await fetch(`/api/swap/quote?${params.toString()}`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch quote')
  }

  return response.json()
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
    queryKey: ['swap-quote', sellToken, buyToken, sellAmount, userAddress],
    queryFn: () => fetchQuote({ sellToken, buyToken, sellAmount, userAddress, feeBps }),
    enabled: enabled && shouldFetch && Boolean(sellToken && buyToken && sellAmount && Number(sellAmount) > 0 && sellToken !== buyToken),
    staleTime: 10000, // Quote is stale after 10 seconds
    gcTime: 20000, // Remove from cache after 20 seconds
    retry: 1, // Only retry once on failure
  })
} 