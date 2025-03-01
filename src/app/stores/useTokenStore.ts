import { create } from 'zustand'
import { formatUnits } from 'viem'
import { Address } from 'viem'

export interface Token {
  address: Address
  decimals: number
  symbol: string
  displaySymbol: string
}

type TokenList = {
  readonly [K in 'USDC' | 'EURC' | 'WETH' | 'WBTC']: Token
}

export const WETH_ABI = [{ "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "src", "type": "address" }, { "indexed": true, "internalType": "address", "name": "guy", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "wad", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "dst", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "wad", "type": "uint256" }], "name": "Deposit", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "src", "type": "address" }, { "indexed": true, "internalType": "address", "name": "dst", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "wad", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "src", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "wad", "type": "uint256" }], "name": "Withdrawal", "type": "event" }, { "payable": true, "stateMutability": "payable", "type": "fallback" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "address", "name": "", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "guy", "type": "address" }, { "internalType": "uint256", "name": "wad", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "deposit", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": true, "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "dst", "type": "address" }, { "internalType": "uint256", "name": "wad", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "src", "type": "address" }, { "internalType": "address", "name": "dst", "type": "address" }, { "internalType": "uint256", "name": "wad", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "uint256", "name": "wad", "type": "uint256" }], "name": "withdraw", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }] as const

export const TOKENS: TokenList = {
  USDC: {
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    decimals: 6,
    symbol: 'USDC',
    displaySymbol: 'USD'
  },
  EURC: {
    address: '0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42',
    decimals: 6,
    symbol: 'EURC',
    displaySymbol: 'EUR'
  },
  WETH: {
    address: '0x4200000000000000000000000000000000000006',
    decimals: 18,
    symbol: 'WETH',
    displaySymbol: 'ETH'
  },
  WBTC: {
    address: '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c',
    decimals: 8,
    symbol: 'WBTC',
    displaySymbol: 'BTC'
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