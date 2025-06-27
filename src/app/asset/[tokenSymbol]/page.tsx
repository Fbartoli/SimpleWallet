"use client"

import { usePrivy } from "@privy-io/react-auth"
import { useParams, useRouter } from "next/navigation"
import NextImage from "next/image"
import { useMemo } from "react"
import { Activity as ActivityIcon, ArrowDownLeft, ArrowLeft, ArrowRightLeft, ArrowUpRight, Clock, ExternalLink, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTokenInfo } from "@/hooks/useTokenInfo"
import { useTokenActivity } from "@/hooks/useTokenActivity"
import { type TokenSymbol, getTokenBySymbol, getTokenLogoPath } from "@/config/constants"
import { DuneActivity } from "@/types/dune"
import Header from "@/components/Header"
import { useTranslations } from "@/hooks/useTranslations"
import { TOKEN_STYLES } from "@/components/token-balances/TokenCard"

// Activity formatting utilities
function formatTimestamp(timestamp: string): string {
    return new Date(timestamp).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    })
}

function formatValue(value: string, decimals: number = 18): string {
    const num = Number(value) / Math.pow(10, decimals)
    if (num === 0) return "0.00"
    if (num < 0.001) return "<0.001"
    if (num < 1) return num.toFixed(6)
    return num.toFixed(4)
}

function getActivityIcon(activity: DuneActivity) {
    switch (activity.type) {
        case "receive":
            return <ArrowDownLeft className="h-4 w-4 text-green-600" />
        case "send":
            return <ArrowUpRight className="h-4 w-4 text-red-600" />
        case "swap":
            return <ArrowRightLeft className="h-4 w-4 text-blue-600" />
        case "mint":
            return <Zap className="h-4 w-4 text-purple-600" />
        case "burn":
            return <Zap className="h-4 w-4 text-orange-600" />
        case "approve":
            return <ActivityIcon className="h-4 w-4 text-yellow-600" />
        case "call":
            return <ActivityIcon className="h-4 w-4 text-blue-600" />
        default:
            return <ActivityIcon className="h-4 w-4 text-gray-600" />
    }
}

function getActivityDescription(activity: DuneActivity, tokenSymbol: string): string {
    switch (activity.type) {
        case "receive":
            return `Received ${tokenSymbol}`
        case "send":
            return `Sent ${tokenSymbol}`
        case "swap":
            return `Swapped ${tokenSymbol}`
        case "mint":
            return `Minted ${tokenSymbol}`
        case "burn":
            return `Burned ${tokenSymbol}`
        case "approve":
            return `Approved ${tokenSymbol}`
        case "call":
            return "Contract interaction"
        default:
            return "Unknown activity"
    }
}

interface ActivityItemProps {
    activity: DuneActivity
    tokenSymbol: string
}

function ActivityItem({ activity, tokenSymbol }: ActivityItemProps) {
    const decimals = activity.token_metadata?.decimals || 18
    const formattedValue = formatValue(activity.value, decimals)
    const description = getActivityDescription(activity, tokenSymbol)
    const icon = getActivityIcon(activity)

    const handleViewTransaction = () => {
        window.open(`https://basescan.org/tx/${activity.tx_hash}`, "_blank")
    }

    return (
        <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gray-50 rounded-full flex items-center justify-center">
                    {icon}
                </div>
                <div>
                    <p className="font-medium text-gray-900">{description}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimestamp(activity.block_time)}</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="text-right">
                    <p className="font-mono text-sm text-gray-900">
                        {formattedValue} {tokenSymbol}
                    </p>
                    {activity.value_usd && (
                        <p className="text-sm text-gray-500">
                            ${activity.value_usd.toFixed(2)}
                        </p>
                    )}
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleViewTransaction}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                >
                    <ExternalLink className="h-3 w-3" />
                </Button>
            </div>
        </div>
    )
}

export default function AssetPage() {
    const { user, ready } = usePrivy()
    const router = useRouter()
    const params = useParams()
    const { common } = useTranslations()

    const tokenSymbol = params?.tokenSymbol as string
    const token = getTokenBySymbol(tokenSymbol)

    const walletAddress = user?.smartWallet?.address as `0x${string}`


    // const tokenAddress = token?.address === "0x4200000000000000000000000000000000000006" ? "native" : token?.address
    // Fetch token info
    const {
        data: tokenInfo,
        isLoading: tokenInfoLoading,
        error: tokenInfoError,
    } = useTokenInfo(
        token?.address || "native",
        "8453" // Filter by Base chain ID
    )

    // Fetch filtered activity
    const {
        data: activities,
        isLoading: activitiesLoading,
        error: activitiesError,
        refetch: refetchActivities,
    } = useTokenActivity(walletAddress || "", {
        tokenAddress: token?.address,
        tokenSymbol: token?.symbol,
        chain_ids: "8453",
        // No longer filtering by specific chain - will use "all" by default
    })

    // Get token info for display
    const displayInfo = useMemo(() => {
        if (tokenInfo?.tokens && tokenInfo.tokens.length > 0) {
            return tokenInfo.tokens[0]
        }
        return null
    }, [tokenInfo])

    // Calculate fully diluted value (price * total supply)
    const fullyDilutedValue = useMemo(() => {
        if (displayInfo?.price_usd && displayInfo?.total_supply) {
            const totalSupply = parseFloat(displayInfo.total_supply)
            if (!isNaN(totalSupply)) {
                return displayInfo.price_usd * totalSupply
            }
        }
        return null
    }, [displayInfo])

    // Redirect to home if not authenticated
    if (ready && !user) {
        router.push("/")
        return null
    }

    // Handle invalid token
    if (!token) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="hidden md:block">
                    <Header />
                </div>
                <div className="container mx-auto px-4 py-8 max-w-6xl">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Token Not Found</h1>
                        <p className="text-gray-600 mb-6">The requested token is not supported.</p>
                        <Button onClick={() => router.push("/dashboard")}>
                            Return to Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    const logoPath = getTokenLogoPath(tokenSymbol as TokenSymbol)
    const tokenStyle = TOKEN_STYLES[tokenSymbol as TokenSymbol]

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="hidden md:block">
                <Header />
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Back Navigation */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {common("back")}
                    </Button>
                </div>

                {/* Token Header */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm mb-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className={`h-16 w-16 rounded-2xl overflow-hidden relative ${tokenStyle?.split(" ").slice(0, 2).join(" ") || "bg-gray-100"}`}>
                            <NextImage
                                src={logoPath}
                                alt={`${token.name} logo`}
                                width={64}
                                height={64}
                                className="object-cover rounded-2xl"
                                priority // Load immediately for asset page header
                                sizes="64px"
                            />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {token.name}
                            </h1>
                            <p className="text-xl text-gray-600">
                                {token.displaySymbol} • {token.symbol}
                            </p>
                        </div>
                    </div>

                    {/* Token Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">Current Price</p>
                            <div className="text-2xl font-bold text-gray-900">
                                {tokenInfoLoading ? (
                                    <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
                                ) : tokenInfoError ? (
                                    <span className="text-red-600 text-sm">Error loading</span>
                                ) : displayInfo?.price_usd ? (
                                    `$${displayInfo.price_usd.toFixed(2)}`
                                ) : (
                                    "N/A"
                                )}
                            </div>
                            {tokenInfoError && (
                                <div className="text-xs text-red-500 mt-1">
                                    {tokenInfoError.message}
                                </div>
                            )}
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">Fully Diluted Value</p>
                            <div className="text-2xl font-bold text-gray-900">
                                {tokenInfoLoading ? (
                                    <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
                                ) : tokenInfoError ? (
                                    <span className="text-red-600 text-sm">Error loading</span>
                                ) : fullyDilutedValue ? (
                                    fullyDilutedValue >= 1e9 ?
                                        `$${(fullyDilutedValue / 1e9).toFixed(2)}B` :
                                        fullyDilutedValue >= 1e6 ?
                                            `$${(fullyDilutedValue / 1e6).toFixed(2)}M` :
                                            `$${fullyDilutedValue.toLocaleString()}`
                                ) : displayInfo?.market_cap ? (
                                    // Fallback to regular market cap if FDV calculation fails
                                    displayInfo.market_cap >= 1e9 ?
                                        `$${(displayInfo.market_cap / 1e9).toFixed(2)}B` :
                                        displayInfo.market_cap >= 1e6 ?
                                            `$${(displayInfo.market_cap / 1e6).toFixed(2)}M` :
                                            `$${displayInfo.market_cap.toLocaleString()}`
                                ) : (
                                    "N/A"
                                )}
                            </div>
                            {fullyDilutedValue && displayInfo?.market_cap && fullyDilutedValue !== displayInfo.market_cap && (
                                <div className="text-xs text-gray-500 mt-1">
                                    Market Cap: ${displayInfo.market_cap >= 1e9 ?
                                        `${(displayInfo.market_cap / 1e9).toFixed(2)}B` :
                                        displayInfo.market_cap >= 1e6 ?
                                            `${(displayInfo.market_cap / 1e6).toFixed(2)}M` :
                                            displayInfo.market_cap.toLocaleString()
                                    }
                                </div>
                            )}
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">Chain</p>
                            <div className="text-2xl font-bold text-gray-900">Base</div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">Contract</p>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-mono text-gray-900">
                                    {`${token.address.slice(0, 6)}...${token.address.slice(-4)}`}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(`https://basescan.org/address/${token.address}`, "_blank")}
                                    className="p-1 h-auto"
                                >
                                    <ExternalLink className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transaction History */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                <ActivityIcon className="h-4 w-4" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">
                                Transaction History
                            </h2>
                        </div>
                    </div>

                    <div className="p-6">
                        {activitiesLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg animate-pulse">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-gray-200 rounded-full" />
                                            <div>
                                                <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                                                <div className="h-3 w-16 bg-gray-200 rounded" />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <div className="h-4 w-16 bg-gray-200 rounded mb-2" />
                                                <div className="h-3 w-12 bg-gray-200 rounded" />
                                            </div>
                                            <div className="h-6 w-6 bg-gray-200 rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : activitiesError ? (
                            <div className="text-center py-8">
                                <p className="text-red-600 mb-4">Failed to load transaction history</p>
                                <Button onClick={() => refetchActivities()} variant="outline">
                                    Try Again
                                </Button>
                            </div>
                        ) : activities.length === 0 ? (
                            <div className="text-center py-12">
                                <ActivityIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600">No transactions found for this token</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {activities.map((activity) => (
                                    <ActivityItem
                                        key={`${activity.tx_hash}-${activity.type}-${activity.block_number}`}
                                        activity={activity}
                                        tokenSymbol={token.displaySymbol}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
} 