import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { formatUnits } from 'viem'
import { SUPPORTED_TOKENS, type TokenSymbol, type TokenConfig } from '@/config/constants'
import { DuneBalance } from '@/types/dune'

export { SUPPORTED_TOKENS as TOKENS, type TokenSymbol, type TokenConfig as Token }

interface TokenBalance {
  symbol: TokenSymbol
  value: bigint
  formatted: string
  decimals: number
  loading: boolean
  error: boolean
  usdValue: number
  lastUpdated: number
}

interface TokenPrice {
  price: number
  estimatedGas: string
  lastUpdated: number
}

interface TokenStore {
  // Balance state
  balances: Record<TokenSymbol, TokenBalance>
  balanceLoadingState: {
    isLoading: boolean
    error: string | null
    lastFetch: number
  }

  // Price state
  prices: Record<TokenSymbol, TokenPrice>
  priceLoadingState: {
    isLoading: boolean
    error: string | null
    lastFetch: number
  }

  // Optimistic update state
  optimisticUpdate: {
    isActive: boolean
    originalBalances: Record<TokenSymbol, TokenBalance> | null
    txHash: string | null
  }

  // Actions
  updateBalances: (balances: DuneBalance[]) => void
  updatePrices: (prices: Record<TokenSymbol, { price: string; estimatedGas: string; decimals: number }>) => void
  setBalanceLoading: (loading: boolean) => void
  setBalanceError: (error: string | null) => void
  setPriceLoading: (loading: boolean) => void
  setPriceError: (error: string | null) => void
  clearErrors: () => void

  // Optimistic updates
  applyOptimisticSwap: (sellToken: TokenSymbol, buyToken: TokenSymbol, sellAmount: bigint, buyAmount: bigint) => void
  revertOptimisticSwap: () => void
  confirmOptimisticSwap: () => void

  // Computed getters
  getTotalUSDValue: () => number
  getBalanceBySymbol: (symbol: TokenSymbol) => TokenBalance | null
  getTokensWithBalance: () => TokenBalance[]
  getStablecoinBalance: () => number
}

// Initial state factory
const createInitialBalances = (): Record<TokenSymbol, TokenBalance> => {
  return Object.entries(SUPPORTED_TOKENS).reduce((acc, [symbol, token]) => ({
    ...acc,
    [symbol]: {
      symbol: symbol as TokenSymbol,
      value: 0n,
      formatted: '0.00',
      decimals: token.decimals,
      loading: false,
      error: false,
      usdValue: 0,
      lastUpdated: 0
    }
  }), {} as Record<TokenSymbol, TokenBalance>)
}

const createInitialPrices = (): Record<TokenSymbol, TokenPrice> => {
  return Object.keys(SUPPORTED_TOKENS).reduce((acc, symbol) => ({
    ...acc,
    [symbol]: {
      price: 0,
      estimatedGas: '0',
      lastUpdated: 0
    }
  }), {} as Record<TokenSymbol, TokenPrice>)
}

export const useTokenStore = create<TokenStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    balances: createInitialBalances(),
    balanceLoadingState: {
      isLoading: false,
      error: null,
      lastFetch: 0
    },
    prices: createInitialPrices(),
    priceLoadingState: {
      isLoading: false,
      error: null,
      lastFetch: 0
    },
    optimisticUpdate: {
      isActive: false,
      originalBalances: null,
      txHash: null
    },

    // Balance actions
    updateBalances: (duneBalances: DuneBalance[]) => {
      const timestamp = Date.now()

      set((state) => {
        const updatedBalances = { ...state.balances }

        // Reset all balances to 0 first
        Object.keys(updatedBalances).forEach(symbol => {
          const tokenSymbol = symbol as TokenSymbol
          const existingBalance = updatedBalances[tokenSymbol]
          if (existingBalance) {
            updatedBalances[tokenSymbol] = {
              symbol: tokenSymbol,
              decimals: existingBalance.decimals,
              loading: existingBalance.loading,
              value: 0n,
              formatted: '0.00',
              usdValue: 0,
              lastUpdated: timestamp,
              error: false
            }
          }
        })

        // Update with actual balances
        duneBalances.forEach(balance => {
          const token = Object.values(SUPPORTED_TOKENS).find(
            t => t.address.toLowerCase() === balance.address.toLowerCase()
          )

          if (token) {
            const symbol = Object.keys(SUPPORTED_TOKENS).find(
              k => SUPPORTED_TOKENS[k as TokenSymbol]?.address.toLowerCase() === balance.address.toLowerCase()
            ) as TokenSymbol

            if (symbol && updatedBalances[symbol]) {
              const value = BigInt(balance.amount)
              const formatted = Number(formatUnits(value, token.decimals)).toFixed(6)
              const price = state.prices[symbol]?.price || 0
              const usdValue = price * Number(formatted)
              const existingBalance = updatedBalances[symbol]!

              updatedBalances[symbol] = {
                ...existingBalance,
                value,
                formatted,
                usdValue,
                lastUpdated: timestamp,
                error: false
              }
            }
          }
        })

        return {
          ...state,
          balances: updatedBalances,
          balanceLoadingState: {
            isLoading: false,
            error: null,
            lastFetch: timestamp
          }
        }
      })
    },

    updatePrices: (priceData) => {
      const timestamp = Date.now()

      set((state) => {
        const updatedPrices = { ...state.prices }
        const updatedBalances = { ...state.balances }

        Object.entries(priceData).forEach(([symbol, data]) => {
          const tokenSymbol = symbol as TokenSymbol
          const price = Number(data.price)

          // Update price
          updatedPrices[tokenSymbol] = {
            price,
            estimatedGas: data.estimatedGas,
            lastUpdated: timestamp
          }

          // Recalculate USD value for balance
          const existingBalance = updatedBalances[tokenSymbol]
          if (existingBalance) {
            updatedBalances[tokenSymbol] = {
              ...existingBalance,
              usdValue: price * Number(existingBalance.formatted)
            }
          }
        })

        return {
          ...state,
          prices: updatedPrices,
          balances: updatedBalances,
          priceLoadingState: {
            isLoading: false,
            error: null,
            lastFetch: timestamp
          }
        }
      })
    },

    setBalanceLoading: (loading) =>
      set((state) => ({
        ...state,
        balanceLoadingState: { ...state.balanceLoadingState, isLoading: loading }
      })),

    setBalanceError: (error) =>
      set((state) => ({
        ...state,
        balanceLoadingState: { ...state.balanceLoadingState, error, isLoading: false }
      })),

    setPriceLoading: (loading) =>
      set((state) => ({
        ...state,
        priceLoadingState: { ...state.priceLoadingState, isLoading: loading }
      })),

    setPriceError: (error) =>
      set((state) => ({
        ...state,
        priceLoadingState: { ...state.priceLoadingState, error, isLoading: false }
      })),

    clearErrors: () =>
      set((state) => ({
        ...state,
        balanceLoadingState: { ...state.balanceLoadingState, error: null },
        priceLoadingState: { ...state.priceLoadingState, error: null }
      })),

    // Computed getters
    getTotalUSDValue: () => {
      const { balances } = get()
      return Object.values(balances).reduce((total, balance) => total + balance.usdValue, 0)
    },

    getBalanceBySymbol: (symbol: TokenSymbol) => {
      const { balances } = get()
      return balances[symbol] || null
    },

    getTokensWithBalance: () => {
      const { balances } = get()
      return Object.values(balances).filter(balance => balance.value > 0n)
    },

    getStablecoinBalance: () => {
      const { balances } = get()
      return Object.entries(balances)
        .filter(([symbol]) => SUPPORTED_TOKENS[symbol as TokenSymbol]?.isStablecoin)
        .reduce((total, [, balance]) => total + balance.usdValue, 0)
    },

    // Optimistic update methods
    applyOptimisticSwap: (sellToken: TokenSymbol, buyToken: TokenSymbol, sellAmount: bigint, buyAmount: bigint) => {
      set((state) => {
        // Store original balances for potential rollback
        const originalBalances = { ...state.balances }

        const updatedBalances = { ...state.balances }
        const sellTokenConfig = SUPPORTED_TOKENS[sellToken]
        const buyTokenConfig = SUPPORTED_TOKENS[buyToken]

        if (sellTokenConfig && buyTokenConfig) {
          // Update sell token balance (subtract)
          const currentSellBalance = updatedBalances[sellToken]
          if (currentSellBalance) {
            const newSellValue = currentSellBalance.value - sellAmount
            const newSellFormatted = Number(formatUnits(newSellValue, sellTokenConfig.decimals)).toFixed(6)
            const sellPrice = state.prices[sellToken]?.price || 0

            updatedBalances[sellToken] = {
              ...currentSellBalance,
              value: newSellValue,
              formatted: newSellFormatted,
              usdValue: sellPrice * Number(newSellFormatted),
              lastUpdated: Date.now()
            }
          }

          // Update buy token balance (add)
          const currentBuyBalance = updatedBalances[buyToken]
          if (currentBuyBalance) {
            const newBuyValue = currentBuyBalance.value + buyAmount
            const newBuyFormatted = Number(formatUnits(newBuyValue, buyTokenConfig.decimals)).toFixed(6)
            const buyPrice = state.prices[buyToken]?.price || 0

            updatedBalances[buyToken] = {
              ...currentBuyBalance,
              value: newBuyValue,
              formatted: newBuyFormatted,
              usdValue: buyPrice * Number(newBuyFormatted),
              lastUpdated: Date.now()
            }
          }
        }

        return {
          ...state,
          balances: updatedBalances,
          optimisticUpdate: {
            isActive: true,
            originalBalances,
            txHash: null
          }
        }
      })
    },

    revertOptimisticSwap: () => {
      set((state) => {
        if (state.optimisticUpdate.originalBalances) {
          return {
            ...state,
            balances: state.optimisticUpdate.originalBalances,
            optimisticUpdate: {
              isActive: false,
              originalBalances: null,
              txHash: null
            }
          }
        }
        return state
      })
    },

    confirmOptimisticSwap: () => {
      set((state) => ({
        ...state,
        optimisticUpdate: {
          isActive: false,
          originalBalances: null,
          txHash: null
        }
      }))
    }
  }))
) 