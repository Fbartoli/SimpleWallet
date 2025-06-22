import { memo, useMemo } from "react"
import { SUPPORTED_TOKENS, type TokenSymbol } from "@/config/constants"
import { TokenCard } from "./TokenCard"

interface TokenBalance {
    formatted: string
    usdValue: number
    value: bigint
}

interface TokenPrice {
    price: number
}

interface TokenGridProps {
    storeBalances: Record<TokenSymbol, TokenBalance>
    storePrices: Record<TokenSymbol, TokenPrice>
    isLoading: boolean
}

export const TokenGrid = memo(({
    storeBalances,
    storePrices,
    isLoading,
}: TokenGridProps) => {
    const tokenList = useMemo(() => {
        return Object.entries(SUPPORTED_TOKENS).map(([symbol]) => {
            const tokenSymbol = symbol as TokenSymbol
            const balance = storeBalances[tokenSymbol]
            const price = storePrices[tokenSymbol]

            return {
                symbol: tokenSymbol,
                balance: balance?.formatted || "0.00",
                usdValue: balance?.usdValue || 0,
                price: price?.price || 0,
                hasBalance: balance && balance.value > 0n,
            }
        })
    }, [storeBalances, storePrices])

    // Always show at least 4 token slots to prevent layout shifts
    const minTokenSlots = 4
    const sortedTokens = useMemo(() => {
        const filtered = tokenList
            .filter(token => token.usdValue >= 1 || token.hasBalance)
            .sort((a, b) => {
                // First, sort by whether they have balance
                if (a.hasBalance && !b.hasBalance) return -1
                if (!a.hasBalance && b.hasBalance) return 1

                // Then by USD value (descending)
                if (a.usdValue !== b.usdValue) return b.usdValue - a.usdValue

                // Finally by symbol alphabetically
                return a.symbol.localeCompare(b.symbol)
            })

        // Ensure we show at least minTokenSlots by adding zero-balance tokens if needed
        if (filtered.length < minTokenSlots) {
            const remainingTokens = tokenList
                .filter(token => !filtered.some(f => f.symbol === token.symbol))
                .sort((a, b) => a.symbol.localeCompare(b.symbol))
                .slice(0, minTokenSlots - filtered.length)

            return [...filtered, ...remainingTokens]
        }

        return filtered
    }, [tokenList, minTokenSlots])

    return (
        <div className="grid gap-3" style={{ minHeight: `${minTokenSlots * 60}px` }}>
            {sortedTokens.map((token) => (
                <TokenCard
                    key={token.symbol}
                    symbol={token.symbol}
                    balance={token.balance}
                    usdValue={token.usdValue}
                    price={token.price}
                    isLoading={isLoading}
                />
            ))}
        </div>
    )
})

TokenGrid.displayName = "TokenGrid" 