import { Address } from "viem"

// Token configuration - Single source of truth
export interface TokenConfig {
  address: Address
  decimals: number
  symbol: string
  displaySymbol: string
  name: string
  chainId: number
  isStablecoin: boolean
  category: "stablecoin" | "crypto" | "yield"
}

export const SUPPORTED_TOKENS: Record<string, TokenConfig> = {
  USDC: {
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    decimals: 6,
    symbol: "USDC",
    displaySymbol: "USD",
    name: "USD Coin",
    chainId: 8453, // Base
    isStablecoin: true,
    category: "stablecoin",
  },
  EURC: {
    address: "0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42",
    decimals: 6,
    symbol: "EURC",
    displaySymbol: "EUR",
    name: "Euro Coin",
    chainId: 8453, // Base
    isStablecoin: true,
    category: "stablecoin",
  },
  WETH: {
    address: "0x4200000000000000000000000000000000000006",
    decimals: 18,
    symbol: "WETH",
    displaySymbol: "ETH",
    name: "Wrapped Ethereum",
    chainId: 8453, // Base
    isStablecoin: false,
    category: "crypto",
  },
  CBBTC: {
    address: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf",
    decimals: 8,
    symbol: "CBBTC",
    displaySymbol: "BTC",
    name: "Coinbase Wrapped BTC",
    chainId: 8453, // Base
    isStablecoin: false,
    category: "crypto",
  },
} as const

export type TokenSymbol = keyof typeof SUPPORTED_TOKENS

// Pre-computed lookups for better performance
const tokensByAddress = new Map<string, TokenConfig>()
const whitelistedAddresses = new Set<string>()
const stablecoinSymbols = new Set<TokenSymbol>()

// Initialize lookup tables
for (const [symbol, token] of Object.entries(SUPPORTED_TOKENS)) {
  const lowerAddress = token.address.toLowerCase()
  tokensByAddress.set(lowerAddress, token)
  whitelistedAddresses.add(lowerAddress)

  if (token.isStablecoin) {
    stablecoinSymbols.add(symbol as TokenSymbol)
  }
}

// Optimized helper functions
export const getTokenByAddress = (address: string): TokenConfig | undefined => {
  return tokensByAddress.get(address.toLowerCase())
}

export const getTokenBySymbol = (symbol: string): TokenConfig | undefined => {
  return SUPPORTED_TOKENS[symbol as TokenSymbol]
}

export const getWhitelistedAddresses = (): string[] => {
  return Array.from(whitelistedAddresses)
}

export const isWhitelistedAddress = (address: string): boolean => {
  return whitelistedAddresses.has(address.toLowerCase())
}

export const isStablecoinSymbol = (symbol: TokenSymbol): boolean => {
  return stablecoinSymbols.has(symbol)
}

export const getStablecoinSymbols = (): TokenSymbol[] => {
  return Array.from(stablecoinSymbols)
}

export const getSupportedTokensList = (): TokenConfig[] => {
  return Object.values(SUPPORTED_TOKENS)
}

// Local logo paths for optimized loading
export const getTokenLogoPath = (symbol: TokenSymbol): string => {
  const token = SUPPORTED_TOKENS[symbol]
  if (!token) return "/file.svg" // fallback

  // Special case for CBBTC which uses .webp
  if (symbol === "CBBTC") {
    return "/cbbtc.webp"
  }

  if (symbol === "WETH") {
    return "/native.png"
  }

  // Use lowercase address for other tokens
  return `/${token.address.toLowerCase()}.png`
}

// API Configuration
if (!process.env.NEXT_PUBLIC_FEE_RECIPIENT) {
  throw new Error("NEXT_PUBLIC_FEE_RECIPIENT is not set")
}

export const MAX_ALLOWANCE = "0xffffffffffffffffffffffffffffffffffffffff"
export const FEE_RECIPIENT = process.env.NEXT_PUBLIC_FEE_RECIPIENT

// Query configuration - Optimized for performance
export const BALANCE_REFETCH_INTERVAL = 10_000 // 10 seconds
export const PRICE_REFETCH_INTERVAL = 30_000 // 30 seconds
export const BALANCE_STALE_TIME = 5_000 // 5 seconds
export const PRICE_STALE_TIME = 15_000 // 15 seconds

// Performance constants
export const DEFAULT_DEBOUNCE_MS = 300
export const HEAVY_COMPONENT_LOAD_DELAY = 100
export const MAX_RETRIES = 3