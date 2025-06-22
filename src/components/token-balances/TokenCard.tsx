import { memo, useMemo } from "react"
import { SUPPORTED_TOKENS, type TokenSymbol } from "@/config/constants"
import { Bitcoin, Coins, DollarSign, Euro } from "lucide-react"

// Token icon mapping (constant to prevent re-creation)
const TOKEN_ICONS: Record<TokenSymbol, React.ReactNode> = {
    "USDC": <DollarSign className="h-5 w-5 text-green-600" />,
    "EURC": <Euro className="h-5 w-5 text-blue-600" />,
    "WETH": <Coins className="h-5 w-5 text-purple-600" />,
    "CBBTC": <Bitcoin className="h-5 w-5 text-orange-600" />,
}

// Token styling (constant to prevent re-creation)
const TOKEN_STYLES: Record<TokenSymbol, string> = {
    "USDC": "bg-green-50 text-green-800 border-green-100 hover:bg-green-100",
    "EURC": "bg-blue-50 text-blue-800 border-blue-100 hover:bg-blue-100",
    "WETH": "bg-purple-50 text-purple-800 border-purple-100 hover:bg-purple-100",
    "CBBTC": "bg-orange-50 text-orange-800 border-orange-100 hover:bg-orange-100",
}

interface TokenCardProps {
    symbol: TokenSymbol
    balance: string
    usdValue: number
    price: number
    isLoading: boolean
}

export const TokenCard = memo(({
    symbol,
    balance,
    usdValue,
    price,
    isLoading,
}: TokenCardProps) => {
    const token = SUPPORTED_TOKENS[symbol]
    const icon = TOKEN_ICONS[symbol]
    const style = TOKEN_STYLES[symbol] || "bg-gray-50 text-gray-800 border-gray-100"

    const formattedBalance = useMemo(() => {
        const num = Number(balance)
        if (num === 0) return "0.00"
        if (num < 0.001) return "<0.001"
        if (num < 1) return num.toFixed(6)
        return num.toFixed(4)
    }, [balance])

    const formattedUsdValue = useMemo(() =>
        usdValue < 0.01 ? "<$0.01" : `$${usdValue.toFixed(2)}`,
        [usdValue]
    )

    const formattedPrice = useMemo(() =>
        price < 0.01 ? "<$0.01" : `$${price.toFixed(2)}`,
        [price]
    )

    if (!token) {
        return null
    }

    if (isLoading) {
        return (
            <div className={`flex justify-between items-center p-3 rounded-lg border ${style} animate-pulse`}>
                <div className="flex items-center gap-2">
                    <div className="h-5 w-5 bg-current opacity-20 rounded" />
                    <div className="flex flex-col gap-1">
                        <div className="h-4 w-12 bg-current opacity-20 rounded" />
                        <div className="h-3 w-16 bg-current opacity-20 rounded" />
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <div className="h-4 w-16 bg-current opacity-20 rounded" />
                    <div className="h-3 w-12 bg-current opacity-20 rounded" />
                </div>
            </div>
        )
    }

    return (
        <div className={`flex justify-between items-center p-3 rounded-lg border transition-colors ${style}`}>
            <div className="flex items-center gap-2">
                {icon}
                <div className="flex flex-col">
                    <span className="font-medium">{token.displaySymbol}</span>
                    <span className="text-sm text-gray-500">
                        {formattedPrice} USD
                    </span>
                </div>
            </div>
            <div className="flex flex-col items-end">
                <span className="font-mono font-medium">
                    {formattedBalance}
                </span>
                <span className="text-sm text-gray-500">
                    {formattedUsdValue}
                </span>
            </div>
        </div>
    )
})

TokenCard.displayName = "TokenCard" 