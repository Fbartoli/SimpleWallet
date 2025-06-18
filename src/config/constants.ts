import { Address } from 'viem'

// Token configuration - Single source of truth
export interface TokenConfig {
  address: Address
  decimals: number
  symbol: string
  displaySymbol: string
  name: string
  chainId: number
  isStablecoin: boolean
  category: 'stablecoin' | 'crypto' | 'yield'
}

export const SUPPORTED_TOKENS: Record<string, TokenConfig> = {
  USDC: {
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    decimals: 6,
    symbol: 'USDC',
    displaySymbol: 'USD',
    name: 'USD Coin',
    chainId: 8453, // Base
    isStablecoin: true,
    category: 'stablecoin'
  },
  EURC: {
    address: '0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42',
    decimals: 6,
    symbol: 'EURC',
    displaySymbol: 'EUR',
    name: 'Euro Coin',
    chainId: 8453, // Base
    isStablecoin: true,
    category: 'stablecoin'
  },
  WETH: {
    address: '0x4200000000000000000000000000000000000006',
    decimals: 18,
    symbol: 'WETH',
    displaySymbol: 'ETH',
    name: 'Wrapped Ethereum',
    chainId: 8453, // Base
    isStablecoin: false,
    category: 'crypto'
  },
  CBBTC: {
    address: '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf',
    decimals: 8,
    symbol: 'CBBTC',
    displaySymbol: 'BTC',
    name: 'Coinbase Wrapped BTC',
    chainId: 8453, // Base
    isStablecoin: false,
    category: 'crypto'
  }
} as const

export type TokenSymbol = keyof typeof SUPPORTED_TOKENS

// Helper functions
export const getTokenByAddress = (address: string): TokenConfig | undefined => {
  return Object.values(SUPPORTED_TOKENS).find(
    token => token.address.toLowerCase() === address.toLowerCase()
  )
}

export const getTokenBySymbol = (symbol: string): TokenConfig | undefined => {
  return SUPPORTED_TOKENS[symbol as TokenSymbol]
}

export const getWhitelistedAddresses = (): string[] => {
  return Object.values(SUPPORTED_TOKENS).map(token => token.address.toLowerCase())
}

// API Configuration
if (!process.env.NEXT_PUBLIC_FEE_RECIPIENT) {
  throw new Error("NEXT_PUBLIC_FEE_RECIPIENT is not set");
}

export const MAX_ALLOWANCE = "0xffffffffffffffffffffffffffffffffffffffff";
export const FEE_RECIPIENT = process.env.NEXT_PUBLIC_FEE_RECIPIENT

// Query configuration
export const BALANCE_REFETCH_INTERVAL = 10_000 // 10 seconds
export const PRICE_REFETCH_INTERVAL = 30_000 // 30 seconds
export const BALANCE_STALE_TIME = 5_000 // 5 seconds
export const PRICE_STALE_TIME = 15_000 // 15 seconds