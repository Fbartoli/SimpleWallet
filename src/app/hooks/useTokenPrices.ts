import { useState, useEffect } from 'react'
import { TokenSymbol } from '@/app/stores/useTokenStore'

interface TokenPrice {
    symbol: TokenSymbol
    price: string
    estimatedGas: string
    decimals: number
}

interface UseTokenPricesReturn {
    prices: Record<TokenSymbol, { price: string; estimatedGas: string; decimals: number }> | null
    isLoading: boolean
    isError: boolean
    refresh: () => Promise<void>
}

export function useTokenPrices(): UseTokenPricesReturn {
    const [prices, setPrices] = useState<Record<TokenSymbol, { price: string; estimatedGas: string; decimals: number }> | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isError, setIsError] = useState(false)

    const fetchPrices = async () => {
        try {
            setIsError(false)
            const response = await fetch('/api/prices')

            if (!response.ok) {
                throw new Error('Failed to fetch prices')
            }

            const data = await response.json()

            // Transform array to record
            const pricesRecord = data.prices.reduce((acc: Record<TokenSymbol, { price: string; estimatedGas: string; decimals: number }>, item: TokenPrice) => {
                acc[item.symbol] = {
                    price: item.price,
                    estimatedGas: item.estimatedGas,
                    decimals: item.decimals
                }
                return acc
            }, {})

            setPrices(pricesRecord)
        } catch (error) {
            console.error('Error fetching token prices:', error)
            setIsError(true)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchPrices()

        // Set up polling every 30 seconds
        const interval = setInterval(fetchPrices, 30000)

        // Cleanup interval on unmount
        return () => clearInterval(interval)
    }, [])

    return {
        prices,
        isLoading,
        isError,
        refresh: fetchPrices,
    }
} 