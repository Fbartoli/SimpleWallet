'use client'

import { DuneBalance } from '@/types/dune'
import { TokenSymbol } from '@/app/stores/useTokenStore'
import { base } from 'viem/chains'
import { ZeroXQuote } from '@/types/quote'

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

// API Functions
export async function fetchBalances(address: string): Promise<DuneBalance[]> {
    if (!address) return []

    const response = await fetch(`/api/balance?address=${address}&chain_ids=${base.id}`)
    if (!response.ok) {
        throw new Error('Failed to fetch balances')
    }

    const data = await response.json()
    return data.balances
}

export async function fetchPrices(): Promise<TokenPricesRecord> {
    const response = await fetch('/api/prices')
    if (!response.ok) {
        throw new Error('Failed to fetch prices')
    }

    const data = await response.json()
    return data.prices.reduce((acc: TokenPricesRecord, item: TokenPrice) => {
        acc[item.symbol] = {
            price: item.price,
            estimatedGas: item.estimatedGas,
            decimals: item.decimals
        }
        return acc
    }, {})
}

export async function fetchSwapQuote({
    sellToken,
    buyToken,
    sellAmount,
    userAddress,
    feeBps,
}: {
    sellToken: TokenSymbol
    buyToken: TokenSymbol
    sellAmount: string
    userAddress: string
    feeBps: string
}): Promise<ZeroXQuote> {
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

// Query Keys
export const queryKeys = {
    balances: (address: string) => ['balances', address] as const,
    prices: ['prices'] as const,
    swapQuote: (params: { sellToken: TokenSymbol; buyToken: TokenSymbol; sellAmount: string; userAddress: string }) =>
        ['swap-quote', params.sellToken, params.buyToken, params.sellAmount, params.userAddress] as const,
} as const 