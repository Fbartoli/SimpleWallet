'use client'

import { useCallback, useEffect, useMemo } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useBalance } from 'wagmi'
import { TOKENS, useTokenStore, type TokenSymbol } from '@/app/stores/useTokenStore'

const REFETCH_INTERVAL = 10_000 // 10 seconds
const STALE_TIME = 5_000 // 5 seconds

export function useTokenBalances() {
  const { user } = usePrivy()
  const { balances, updateBalance, setLoading, setError } = useTokenStore()
  const walletAddress = user?.smartWallet?.address as `0x${string}`

  // USDC Balance
  const {
    data: usdcData,
    isLoading: isUsdcLoading,
    isError: isUsdcError,
    refetch: refetchUsdc
  } = useBalance({
    address: walletAddress,
    token: TOKENS.USDC.address as `0x${string}`,
    query: {
      enabled: Boolean(walletAddress),
      refetchInterval: REFETCH_INTERVAL,
      staleTime: STALE_TIME,
      refetchOnWindowFocus: true,
    }
  })

  // EURC Balance
  const {
    data: eurcData,
    isLoading: isEurcLoading,
    isError: isEurcError,
    refetch: refetchEurc
  } = useBalance({
    address: walletAddress,
    token: TOKENS.EURC.address as `0x${string}`,
    query: {
      enabled: Boolean(walletAddress),
      refetchInterval: REFETCH_INTERVAL,
      staleTime: STALE_TIME,
      refetchOnWindowFocus: true,
    }
  })

  // WETH Balance
  const {
    data: wethData,
    isLoading: isWethLoading,
    isError: isWethError,
    refetch: refetchWeth
  } = useBalance({
    address: walletAddress,
    token: TOKENS.WETH.address as `0x${string}`,
    query: {
      enabled: Boolean(walletAddress),
      refetchInterval: REFETCH_INTERVAL,
      staleTime: STALE_TIME,
      refetchOnWindowFocus: true,
    }
  })

  // WBTC Balance
  const {
    data: wbtcData,
    isLoading: isWbtcLoading,
    isError: isWbtcError,
    refetch: refetchWbtc
  } = useBalance({
    address: walletAddress,
    token: TOKENS.WBTC.address as `0x${string}`,
    query: {
      enabled: Boolean(walletAddress),
      refetchInterval: REFETCH_INTERVAL,
      staleTime: STALE_TIME,
      refetchOnWindowFocus: true,
    }
  })

  // Update balances in store
  useEffect(() => {
    // USDC
    setLoading('USDC', isUsdcLoading)
    setError('USDC', isUsdcError)
    if (usdcData?.value !== undefined) {
      updateBalance('USDC', usdcData.value, usdcData.decimals)
    }

    // EURC
    setLoading('EURC', isEurcLoading)
    setError('EURC', isEurcError)
    if (eurcData?.value !== undefined) {
      updateBalance('EURC', eurcData.value, eurcData.decimals)
    }

    // WETH
    setLoading('WETH', isWethLoading)
    setError('WETH', isWethError)
    if (wethData?.value !== undefined) {
      updateBalance('WETH', wethData.value, wethData.decimals)
    }

    // WBTC
    setLoading('WBTC', isWbtcLoading)
    setError('WBTC', isWbtcError)
    if (wbtcData?.value !== undefined) {
      updateBalance('WBTC', wbtcData.value, wbtcData.decimals)
    }
  }, [
    usdcData, isUsdcLoading, isUsdcError,
    eurcData, isEurcLoading, isEurcError,
    wethData, isWethLoading, isWethError,
    wbtcData, isWbtcLoading, isWbtcError,
    updateBalance, setLoading, setError
  ])

  const refreshToken = useCallback((symbol: TokenSymbol) => {
    switch (symbol) {
      case 'USDC':
        return refetchUsdc()
      case 'EURC':
        return refetchEurc()
      case 'WETH':
        return refetchWeth()
      case 'WBTC':
        return refetchWbtc()
    }
  }, [refetchUsdc, refetchEurc, refetchWeth, refetchWbtc])

  const refreshAllBalances = useCallback(() => {
    refetchUsdc()
    refetchEurc()
    refetchWeth()
    refetchWbtc()
  }, [refetchUsdc, refetchEurc, refetchWeth, refetchWbtc])

  const isLoading = useMemo(() => (
    isUsdcLoading || isEurcLoading || isWethLoading || isWbtcLoading
  ), [isUsdcLoading, isEurcLoading, isWethLoading, isWbtcLoading])

  const isError = useMemo(() => (
    isUsdcError || isEurcError || isWethError || isWbtcError
  ), [isUsdcError, isEurcError, isWethError, isWbtcError])

  return {
    balances,
    isLoading,
    isError,
    refresh: refreshAllBalances,
    refreshToken,
  }
} 