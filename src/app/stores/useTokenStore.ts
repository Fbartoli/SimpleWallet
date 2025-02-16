import { create } from 'zustand'
import { formatUnits } from 'viem'

export const TOKENS = {
  USDC: {
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    decimals: 6,
    symbol: 'USDC'
  },
  EURC: {
    address: '0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42',
    decimals: 6,
    symbol: 'EURC'
  },
  WETH: {
    address: '0x4200000000000000000000000000000000000006',
    decimals: 18,
    symbol: 'WETH'
  },
  WBTC: {
    address: '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c',
    decimals: 8,
    symbol: 'WBTC'
  }
} as const

export type TokenSymbol = keyof typeof TOKENS

interface TokenBalance {
  symbol: TokenSymbol
  value: bigint
  formatted: string
  decimals: number
  loading: boolean
  error: boolean
}

type TokenStore = {
  balances: Record<TokenSymbol, TokenBalance>
  updateBalance: (symbol: TokenSymbol, value: bigint, decimals: number) => void
  setLoading: (symbol: TokenSymbol, loading: boolean) => void
  setError: (symbol: TokenSymbol, error: boolean) => void
  refresh: () => void
}

const initialBalances = Object.entries(TOKENS).reduce((acc, [symbol, token]) => ({
  ...acc,
  [symbol]: {
    symbol: symbol as TokenSymbol,
    value: 0n,
    formatted: '0.00',
    decimals: token.decimals,
    loading: false,
    error: false
  }
}), {} as Record<TokenSymbol, TokenBalance>)

export const useTokenStore = create<TokenStore>((set) => ({
  balances: initialBalances,
  updateBalance: (symbol: TokenSymbol, value: bigint, decimals: number) => {
    console.log('value', value, symbol)
    set((state) => ({
      ...state,
      balances: {
        ...state.balances,
        [symbol]: {
          ...state.balances[symbol],
          value,
          formatted: Number(formatUnits(value, TOKENS[symbol].decimals)).toFixed(decimals)
        }
      }
    }))
  },
  setLoading: (symbol: TokenSymbol, loading: boolean) =>
    set((state) => ({
      ...state,
      balances: {
        ...state.balances,
        [symbol]: {
          ...state.balances[symbol],
          loading
        }
      }
    })),
  setError: (symbol: TokenSymbol, error: boolean) =>
    set((state) => ({
      ...state,
      balances: {
        ...state.balances,
        [symbol]: {
          ...state.balances[symbol],
          error
        }
      }
    })),
  refresh: () => set((state) => ({
    ...state,
    balances: initialBalances
  }))
})) 