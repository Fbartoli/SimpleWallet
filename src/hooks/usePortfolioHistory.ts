"use client"

import { useMemo } from "react"
import { eachDayOfInterval, endOfDay, format, startOfDay, subDays } from "date-fns"
import { useTokenBalances } from "./useTokenBalances"
import { useTokenActivity } from "./useTokenActivity"
import { useTokenPrices } from "./useTokenPrices"
import { TokenSymbol } from "@/stores/useTokenStore"
import { SUPPORTED_TOKENS } from "@/config/constants"

interface PortfolioPoint {
    date: string
    value: number
}

type TimeFrame = "1d" | "7d" | "14d" | "30d" | "90d"

const TIMEFRAME_DAYS: Record<TimeFrame, number> = {
    "1d": 1,
    "7d": 7,
    "14d": 14,
    "30d": 30,
    "90d": 90,
}

export function usePortfolioHistory(address: string, timeframe: TimeFrame = "14d") {
    // Get current balances as our starting point
    const { storeBalances, isLoading: balancesLoading } = useTokenBalances(address)

    // Get all activity data to reconstruct historical balances
    const { data: activities, isLoading: activityLoading } = useTokenActivity(address, {
        chain_ids: "8453",
    })

    // Get current prices (we'll use these for all historical calculations for simplicity)
    const { storePrices, isLoading: pricesLoading } = useTokenPrices()

    const portfolioHistory = useMemo(() => {
        if (!activities?.length || !storeBalances || !storePrices) return []

        // Get date range based on timeframe
        const endDate = new Date()
        const daysBack = TIMEFRAME_DAYS[timeframe]
        const startDate = subDays(endDate, daysBack)
        const days = eachDayOfInterval({ start: startDate, end: endDate })

        // Sort activities by date (newest first for backwards reconstruction)
        const sortedActivities = [...activities].sort((a, b) =>
            new Date(b.block_time).getTime() - new Date(a.block_time).getTime()
        )

        const history: PortfolioPoint[] = []

        // Start with current balances
        const currentBalances: Record<TokenSymbol, bigint> = {}
        Object.entries(storeBalances).forEach(([symbol, balance]) => {
            currentBalances[symbol as TokenSymbol] = balance?.value || 0n
        })

        // Work backwards through each day
        for (let i = days.length - 1; i >= 0; i--) {
            const day = days[i]
            if (!day) continue

            // For the current day, use current balances
            if (i === days.length - 1) {
                const totalValue = Object.entries(currentBalances).reduce((total, [symbol, balance]) => {
                    const token = SUPPORTED_TOKENS[symbol as TokenSymbol]
                    if (!token) return total
                    const price = storePrices[symbol as TokenSymbol]?.price || 0
                    const balanceDecimal = Number(balance) / (10 ** token.decimals)
                    return total + (balanceDecimal * price)
                }, 0)

                history.unshift({
                    date: format(day, "yyyy-MM-dd"),
                    value: totalValue,
                })
                continue
            }

            // For previous days, subtract activities that happened after this day
            const nextDay = days[i + 1]
            if (!nextDay) continue

            const nextDayStart = startOfDay(nextDay).getTime()
            const nextDayEnd = endOfDay(nextDay).getTime()

            // Find activities that happened on the next day
            const nextDayActivities = sortedActivities.filter(activity => {
                const activityTime = new Date(activity.block_time).getTime()
                return activityTime >= nextDayStart && activityTime <= nextDayEnd
            })

            // Reverse the effects of next day's activities to get this day's balances
            const balancesForDay = { ...currentBalances }

            for (const activity of nextDayActivities) {
                const symbol = activity.token_metadata?.symbol as TokenSymbol
                if (!symbol || !(symbol in SUPPORTED_TOKENS)) continue

                const value = BigInt(activity.value)

                // Reverse the activity effect
                switch (activity.type) {
                    case "receive":
                    case "mint":
                        // If we received it later, we didn't have it this day
                        balancesForDay[symbol] = (balancesForDay[symbol] || 0n) - value
                        break
                    case "send":
                    case "burn":
                        // If we sent it later, we had it this day
                        balancesForDay[symbol] = (balancesForDay[symbol] || 0n) + value
                        break
                    // Note: Swaps are more complex and would need special handling
                }
            }

            // Calculate total USD value for this day
            const totalValue = Object.entries(balancesForDay).reduce((total, [symbol, balance]) => {
                const token = SUPPORTED_TOKENS[symbol as TokenSymbol]
                if (!token) return total
                const price = storePrices[symbol as TokenSymbol]?.price || 0
                const balanceDecimal = Number(balance) / (10 ** token.decimals)
                return total + Math.max(0, balanceDecimal * price) // Prevent negative balances
            }, 0)

            history.unshift({
                date: format(day, "yyyy-MM-dd"),
                value: totalValue,
            })

            // Update current balances for next iteration
            Object.assign(currentBalances, balancesForDay)
        }

        return history
    }, [activities, storeBalances, storePrices, timeframe])

    return {
        data: portfolioHistory,
        isLoading: balancesLoading || activityLoading || pricesLoading,
        error: null, // We'll rely on the underlying hooks for error handling
    }
} 