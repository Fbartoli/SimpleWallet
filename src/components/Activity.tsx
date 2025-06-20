"use client"

import { useEffect, useMemo } from "react"
import { usePrivy } from "@privy-io/react-auth"
import { useActivity } from "@/hooks/useActivity"
import { useActivityRefresh } from "@/contexts/ActivityContext"
import { DuneActivity } from "@/types/dune"
import { SUPPORTED_TOKENS } from "@/config/constants"
import { Button } from "@/components/ui/button"
import {
    Activity as ActivityIcon,
    AlertCircle,
    ArrowDownLeft,
    ArrowRightLeft,
    ArrowUpRight,
    Clock,
    ExternalLink,
    RefreshCw,
    Zap,
} from "lucide-react"

// Format timestamp to readable date
function formatTimestamp(timestamp: string): string {
    return new Date(timestamp).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    })
}

// Format value with proper decimals
function formatValue(value: string, decimals: number): string {
    const num = Number(value) / Math.pow(10, decimals)
    if (num === 0) return "0"
    if (num < 0.001) return "< 0.001"
    return num.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 6,
    })
}

// Get token symbol from address
function getTokenSymbol(address?: string, token_metadata?: { symbol?: string }): string {
    if (token_metadata?.symbol) return token_metadata.symbol
    if (!address) return "ETH"

    const token = Object.values(SUPPORTED_TOKENS).find(
        t => t.address.toLowerCase() === address.toLowerCase()
    )
    return token?.displaySymbol || "UNKNOWN"
}

// Get activity icon based on type and direction
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

// Get activity color based on type and direction
function getActivityColor(activity: DuneActivity): string {
    switch (activity.type) {
        case "receive":
            return "text-green-600"
        case "send":
            return "text-red-600"
        case "swap":
            return "text-blue-600"
        case "mint":
            return "text-purple-600"
        case "burn":
            return "text-orange-600"
        case "approve":
            return "text-yellow-600"
        case "call":
            return "text-blue-600"
        default:
            return "text-gray-600"
    }
}

// Get activity description
function getActivityDescription(activity: DuneActivity): string {
    const symbol = getTokenSymbol(activity.token_address, activity.token_metadata)

    switch (activity.type) {
        case "receive":
            return `Received ${symbol}`
        case "send":
            return `Sent ${symbol}`
        case "swap":
            return `Swapped ${symbol}`
        case "mint":
            return `Minted ${symbol}`
        case "burn":
            return `Burned ${symbol}`
        case "approve":
            return `Approved ${symbol}`
        case "call":
            return "Contract interaction"
        default:
            return "Unknown activity"
    }
}

interface ActivityItemProps {
    activity: DuneActivity
}

function ActivityItem({ activity }: ActivityItemProps) {
    const symbol = getTokenSymbol(activity.token_address, activity.token_metadata)
    const decimals = activity.token_metadata?.decimals || 18
    const formattedValue = formatValue(activity.value, decimals)
    const description = getActivityDescription(activity)
    const icon = getActivityIcon(activity)
    const colorClass = getActivityColor(activity)

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
                {(activity.type === "receive" || activity.type === "send") && activity.asset_type !== "erc721" && (
                    <div className="text-right">
                        <p className={`font-medium ${colorClass}`}>
                            {activity.type === "receive" ? "+" : "-"}{formattedValue} {symbol}
                        </p>
                        {activity.value_usd && (
                            <p className="text-xs text-gray-500">
                                ${activity.value_usd.toFixed(2)}
                            </p>
                        )}
                    </div>
                )}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleViewTransaction}
                    className="h-8 w-8 p-0"
                >
                    <ExternalLink className="h-3 w-3" />
                </Button>
            </div>
        </div>
    )
}

interface ErrorDisplayProps {
    error: string
    onRetry: () => void
}

function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
    return (
        <div className="p-6 bg-red-50 text-red-800 rounded-lg border border-red-100">
            <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-5 w-5" />
                <h3 className="font-medium">Failed to load activity</h3>
            </div>
            <p className="text-sm mb-4">{error}</p>
            <Button onClick={onRetry} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
            </Button>
        </div>
    )
}

export function Activity() {
    const { user } = usePrivy()
    const walletAddress = user?.smartWallet?.address
    const { registerRefreshFunction } = useActivityRefresh()

    const { data, isLoading, error, refetch } = useActivity(walletAddress || "", {
        chain_ids: "8453", // Base chain
    })

    // Register the refetch function with the activity context
    useEffect(() => {
        const cleanup = registerRefreshFunction(refetch)
        return cleanup
    }, [registerRefreshFunction, refetch])

    // Filter, sort activities by timestamp (newest first) and take the last 10 (most recent)
    const activities = useMemo(() => {
        if (!data || !Array.isArray(data)) {
            return []
        }

        // Get whitelisted token addresses
        const whitelistedAddresses = Object.values(SUPPORTED_TOKENS).map(token =>
            token.address.toLowerCase()
        )

        // Filter activities to only include whitelisted tokens and native ETH
        const filteredActivities = data.filter(activity => {
            // Include native ETH transactions
            if (activity.asset_type === "native") {
                return true
            }

            // Include transactions involving whitelisted tokens
            if (activity.token_address) {
                return whitelistedAddresses.includes(activity.token_address.toLowerCase())
            }

            return false
        })


        // Sort by block_time (newest first) to ensure we get the most recent activities
        const sortedActivities = filteredActivities.sort((a, b) => {
            const timeA = new Date(a.block_time).getTime()
            const timeB = new Date(b.block_time).getTime()
            return timeB - timeA // Newest first
        })


        // Take the first 10 activities (which are now the most recent)
        return sortedActivities.slice(0, 10)
    }, [data])

    if (!walletAddress) {
        return (
            <div className="p-6 bg-amber-50 text-amber-800 rounded-lg border border-amber-100">
                <p>Please connect your wallet to view activity.</p>
            </div>
        )
    }

    if (error) {
        return (
            <ErrorDisplay
                error={error.message}
                onRetry={() => refetch()}
            />
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-blue-500/10 text-blue-600 rounded-full flex items-center justify-center">
                        <ActivityIcon className="h-4 w-4" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Recent Activity (Last 10)</h2>
                </div>
            </div>

            {isLoading && activities.length === 0 ? (
                <div className="space-y-3">
                    {Array.from({ length: 5 }, () => (
                        <div key={`skeleton-${Math.random().toString(36).substring(2, 15)}`} className="animate-pulse">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-gray-200 rounded-full" />
                                    <div className="space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-32" />
                                        <div className="h-3 bg-gray-200 rounded w-24" />
                                    </div>
                                </div>
                                <div className="h-4 bg-gray-200 rounded w-20" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : activities.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 rounded-lg">
                    <ActivityIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No activity yet</h3>
                    <p className="text-gray-500">Your wallet activity will show up here</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {activities.map((activity) => (
                        <ActivityItem
                            key={`${activity.tx_hash}-${activity.block_time}`}
                            activity={activity}
                        />
                    ))}
                </div>
            )}
        </div>
    )
} 