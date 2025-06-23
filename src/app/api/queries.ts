"use client"

import { DuneActivity, DuneActivityResponse, DuneBalance } from "@/types/dune"
import { TokenSymbol } from "@/config/constants"
import { base } from "viem/chains"
import { ZeroXQuote } from "@/app/types/quote"

// Types
export interface TokenPrice {
    symbol: TokenSymbol
    price: string
    estimatedGas: string
    decimals: number
}

export type TokenPricesRecord = Record<TokenSymbol, {
    price: string
    estimatedGas: string
    decimals: number
}>

// Enhanced balance response from optimized API
interface BalanceApiResponse {
    balances: DuneBalance[]
    filtered: boolean
    whitelisted_count: number
    total_count: number
    next_offset?: string
}

// API Functions
export async function fetchBalances(address: string): Promise<DuneBalance[]> {
    if (!address) return []

    const response = await fetch(`/api/balance?address=${address}&chain_ids=${base.id}`)
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    const data: BalanceApiResponse = await response.json()

    // Return the filtered balances from the optimized API
    return data.balances || []
}

export async function fetchPrices(): Promise<TokenPricesRecord> {
    const response = await fetch("/api/prices")
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    const data = await response.json()

    if (!data.prices || !Array.isArray(data.prices)) {
        throw new Error("Invalid prices response format")
    }

    return data.prices.reduce((acc: TokenPricesRecord, item: TokenPrice) => {
        acc[item.symbol] = {
            price: item.price,
            estimatedGas: item.estimatedGas,
            decimals: item.decimals,
        }
        return acc
    }, {})
}

export async function fetchSwapQuote(params: {
    sellToken: TokenSymbol
    buyToken: TokenSymbol
    sellAmount: string
    taker: string
}): Promise<ZeroXQuote> {
    const searchParams = new URLSearchParams({
        sellToken: params.sellToken,
        buyToken: params.buyToken,
        sellAmount: params.sellAmount,
        taker: params.taker,
    })

    const response = await fetch(`/api/swap/quote?${searchParams}`)
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to get swap quote" }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    return response.json()
}

export async function fetchActivity(address: string, params?: {
    limit?: number
    offset?: string
    chain_ids?: string
}): Promise<DuneActivityResponse> {
    if (!address) {
        return { activity: [], next_offset: null }
    }

    const searchParams = new URLSearchParams({ address })

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                searchParams.append(key, value.toString())
            }
        })
    }

    const response = await fetch(`/api/activity?${searchParams}`)
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    return response.json()
}

export async function fetchAllActivity(address: string, params?: {
    chain_ids?: string
}): Promise<DuneActivity[]> {
    if (!address) {
        return []
    }

    const searchParams = new URLSearchParams({
        address,
        fetch_all: "true", // Special flag to indicate we want all activities
    })

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                searchParams.append(key, value.toString())
            }
        })
    }

    const response = await fetch(`/api/activity?${searchParams}`)
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    const data = await response.json()
    return data.activity || []
}

export async function fetchTokenInfo(contractAddress: string, params?: {
    chain_ids?: string
    limit?: number
    offset?: string
}): Promise<any> {
    if (!contractAddress) {
        throw new Error("Contract address is required")
    }

    const searchParams = new URLSearchParams({
        contract_address: contractAddress,
    })

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                searchParams.append(key, value.toString())
            }
        })
    }

    const response = await fetch(`/api/token-info?${searchParams}`)
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    return response.json()
}

// Query Keys for React Query
export const queryKeys = {
    balances: (address: string) => ["balances", address] as const,
    prices: ["prices"] as const,
    activity: (address: string, params?: {
        limit?: number
        offset?: string
        chain_ids?: string
    }) => ["activity", address, params] as const,
    allActivity: (address: string, params?: {
        chain_ids?: string
    }) => ["allActivity", address, params] as const,
    tokenInfo: (contractAddress: string, params?: {
        chain_ids?: string
        limit?: number
        offset?: string
    }) => ["tokenInfo", contractAddress, params] as const,
    swapQuote: (params: {
        sellToken: TokenSymbol
        buyToken: TokenSymbol
        sellAmount: string
        taker: string
        feeBps?: string
    }) => ["swap-quote", params] as const,
} as const 