import { NextResponse } from 'next/server'
import { TOKENS, type TokenSymbol } from '@/stores/useTokenStore'

interface PriceData {
    prices: Array<{
        symbol: TokenSymbol;
        price: string;
        estimatedGas: string;
        decimals: number;
    }>;
}

// In-memory cache for prices
let pricesCache: {
    data: PriceData;
    timestamp: number;
} | null = null;

const CACHE_DURATION = 30 * 1000; // 30 seconds cache duration

// Helper function to create price query URL
const createPriceQueryUrl = (sellToken: string, buyToken: string, sellAmount: string) => {
    const baseUrl = 'https://api.0x.org/swap/allowance-holder/price'
    const params = new URLSearchParams({
        sellToken,
        buyToken,
        sellAmount,
        chainId: '8453', // Base chain ID
    })
    return `${baseUrl}?${params.toString()}`
}

// Helper function to check if cache is valid
const isCacheValid = () => {
    return Boolean(pricesCache && (Date.now() - pricesCache.timestamp) < CACHE_DURATION);
}

export async function GET() {
    try {
        // Check cache first
        if (isCacheValid() && pricesCache) {
            return NextResponse.json(pricesCache.data, {
                headers: {
                    'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=59',
                }
            });
        }

        // Get prices for all token pairs against USDC
        const pricePromises = Object.entries(TOKENS)
            .filter(([symbol]) => symbol !== 'USDC') // Skip USDC/USDC pair
            .map(async ([symbol, token]) => {
                const url = createPriceQueryUrl(
                    token.address,
                    TOKENS.USDC.address,
                    (1 * 10 ** token.decimals).toString() // 1 unit of token in base units
                )
                console.log('url', url)
                const response = await fetch(
                    url,
                    {
                        headers: {
                            '0x-api-key': process.env.OX_API_KEY || '',
                            '0x-version': 'v2',
                        },
                    }
                )

                if (!response.ok) {
                    throw new Error(`Failed to fetch price for ${symbol}: ${response.statusText}`)
                }

                const data = await response.json()

                // Calculate price accounting for decimals and hardcode USDC to $1
                const price = Number(data.buyAmount) / (10 ** TOKENS.USDC.decimals) * 1 // Multiply by 1 to represent $1 USDC price

                return {
                    symbol: symbol as TokenSymbol,
                    price: price.toString(),
                    estimatedGas: data.estimatedGas,
                    decimals: token.decimals
                }
            })

        // Add USDC price
        const prices = await Promise.all(pricePromises)
        prices.push({
            symbol: 'USDC' as TokenSymbol,
            price: '1',
            estimatedGas: '0',
            decimals: TOKENS.USDC.decimals
        })

        // Update cache
        const responseData: PriceData = { prices }
        pricesCache = {
            data: responseData,
            timestamp: Date.now()
        }

        // Return response with cache headers
        return NextResponse.json(responseData, {
            headers: {
                'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=59',
            }
        })
    } catch (error) {
        console.error('Error fetching prices:', error)

        // If there's an error but we have cached data, return it
        if (pricesCache) {
            return NextResponse.json(pricesCache.data, {
                headers: {
                    'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=59',
                }
            });
        }

        return NextResponse.json(
            { error: 'Failed to fetch prices' },
            { status: 500 }
        )
    }
}