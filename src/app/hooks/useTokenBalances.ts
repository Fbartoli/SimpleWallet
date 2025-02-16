import { useCallback, useEffect, useRef } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useBalance } from 'wagmi'
import { TOKENS, useTokenStore, type TokenSymbol } from '@/app/stores/useTokenStore'

interface TokenBalance {
  symbol: TokenSymbol
  value: bigint
  formatted: string
  decimals: number
  loading: boolean
  error: boolean
}

const REFETCH_INTERVAL = 10_000 // 10 seconds
const STALE_TIME = 5_000 // 5 seconds

interface useBalanceResponse {
  decimals: number;
  formatted: string;
  symbol: string;
  value: bigint;
}

export function useTokenBalances() {
  const { user } = usePrivy()
  const { balances, updateBalance, setLoading, setError } = useTokenStore()
  const refetchFunctionsRef = useRef(new Map<TokenSymbol, () => void>())

  const updateTokenBalance = useCallback((
    symbol: TokenSymbol, 
    data: useBalanceResponse | undefined, 
    isLoading: boolean, 
    isError: boolean
  ) => {
    setLoading(symbol, isLoading)
    setError(symbol, isError)
    console.log('data', data)
    if (data?.value || data?.value === 0n) {
      updateBalance(symbol, data.value, data?.decimals)
    }
  }, [setLoading, setError, updateBalance])

  // Set up balance watchers for each token
  Object.entries(TOKENS).forEach(([symbol, token]) => {
    const { data, isLoading, isError, refetch } = useBalance({
      address: user?.smartWallet?.address as `0x${string}`,
      token: token.address as `0x${string}`,
      query: {
        enabled: !!user?.smartWallet?.address,
        refetchInterval: REFETCH_INTERVAL,
        staleTime: STALE_TIME,
        refetchOnWindowFocus: true,
      }
    })

    // Store refetch function
    useEffect(() => {
      refetchFunctionsRef.current.set(symbol as TokenSymbol, refetch)
    }, [symbol, refetch])

    useEffect(() => {
      console.log('data', data)
      updateTokenBalance(symbol as TokenSymbol, data, isLoading, isError)
    }, [data, isLoading, isError, symbol, updateTokenBalance])
  })

  const refreshAllBalances = useCallback(() => {
    refetchFunctionsRef.current.forEach(refetch => refetch())
  }, [])

  return {
    balances,
    isLoading: Object.values(balances).some((b: TokenBalance) => b.loading),
    isError: Object.values(balances).some((b: TokenBalance) => b.error),
    refresh: refreshAllBalances,
    refreshToken: (symbol: TokenSymbol) => refetchFunctionsRef.current.get(symbol)?.()
  }
} 