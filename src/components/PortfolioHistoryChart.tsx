"use client"

import { useMemo, useState } from "react"
import { usePortfolioHistory } from "@/hooks/usePortfolioHistory"
import { usePrivy } from "@privy-io/react-auth"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Area, 
  AreaChart, 
  CartesianGrid, 
  Line, 
  LineChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis,
  YAxis, 
} from "recharts"
import { useTranslations } from "@/hooks/useTranslations"
import { AlertCircle, Minus, TrendingDown, TrendingUp } from "lucide-react"

type TimeFrame = "1d" | "7d" | "14d" | "30d" | "90d"
type ChartType = "line" | "area"

const TIMEFRAME_LABELS: Record<TimeFrame, string> = {
  "1d": "1D",
  "7d": "7D", 
  "14d": "14D",
  "30d": "30D",
  "90d": "90D",
}

interface PortfolioHistoryChartProps {
  address: string
}

function PortfolioHistoryChart({ address }: PortfolioHistoryChartProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeFrame>("14d")
  const [chartType, setChartType] = useState<ChartType>("area")
  const { data, isLoading, error } = usePortfolioHistory(address, selectedTimeframe)

  // Calculate performance metrics
  const performanceMetrics = useMemo(() => {
    if (!data || data.length < 2) return null
    
    const firstItem = data[0]
    const lastItem = data[data.length - 1]
    if (!firstItem || !lastItem) return null
    
    const firstValue = firstItem.value
    const lastValue = lastItem.value
    const change = lastValue - firstValue
    const changePercent = ((change / firstValue) * 100)
    
    return {
      change,
      changePercent,
      isPositive: change >= 0,
      isNeutral: Math.abs(changePercent) < 0.01,
    }
  }, [data])

  // Calculate Y-axis domain with better scaling
  const yAxisDomain = useMemo(() => {
    if (!data || data.length === 0) return [0, 1000]
    
    const values = data.map(d => d.value)
    const minValue = Math.min(...values)
    const maxValue = Math.max(...values)
    const range = maxValue - minValue
    
    // Dynamic buffer based on data range
    const bufferPercent = range > 0 ? 0.1 : 0.3
    const bufferMax = maxValue + (range * bufferPercent)
    const bufferMin = Math.max(0, minValue - (range * bufferPercent))
    
    return [bufferMin, bufferMax]
  }, [data])

  // Smart Y-axis tick formatter
  const formatYTick = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}k`
    } else {
      return `$${value.toFixed(0)}`
    }
  }

  // Format value for display
  const formatValue = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`
  }

  // Custom tooltip with enhanced styling
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload[0]) {
      return (
        <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-100 min-w-[200px]">
          <p className="text-sm text-gray-600 mb-2">{label}</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatValue(payload[0].value)}
          </p>
          {performanceMetrics && (
            <div className="mt-2 flex items-center gap-2 text-sm">
              {performanceMetrics.isNeutral ? (
                <Minus className="h-4 w-4 text-gray-500" />
              ) : performanceMetrics.isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className={`font-medium ${
                performanceMetrics.isNeutral 
                  ? "text-gray-600" 
                  : performanceMetrics.isPositive 
                    ? "text-green-600" 
                    : "text-red-600"
              }`}>
                {formatPercentage(performanceMetrics.changePercent)}
              </span>
            </div>
          )}
        </div>
      )
    }
    return null
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
        <div className="flex gap-2 justify-center">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-12 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-center p-8 bg-red-50 rounded-xl border border-red-100">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <p className="text-red-700 font-semibold text-lg mb-2">Failed to load portfolio history</p>
        <p className="text-red-600">
          Please try again later or check your connection
        </p>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-center p-8 bg-gray-50 rounded-xl border border-gray-100">
        <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
          <TrendingUp className="h-8 w-8 text-gray-400" />
        </div>
        <p className="text-gray-700 font-semibold text-lg mb-2">No portfolio history available</p>
        <p className="text-gray-600">
          Start making transactions to see your portfolio value over time
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Performance Metrics */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
          {performanceMetrics && (
            <div className="flex items-center gap-3">
              <span className={`text-2xl font-bold ${
                performanceMetrics.isNeutral 
                  ? "text-gray-600" 
                  : performanceMetrics.isPositive 
                    ? "text-green-600" 
                    : "text-red-600"
              }`}>
                {formatValue(performanceMetrics.change)}
              </span>
              <div className="flex items-center gap-1">
                {performanceMetrics.isNeutral ? (
                  <Minus className="h-4 w-4 text-gray-500" />
                ) : performanceMetrics.isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ${
                  performanceMetrics.isNeutral 
                    ? "text-gray-600" 
                    : performanceMetrics.isPositive 
                      ? "text-green-600" 
                      : "text-red-600"
                }`}>
                  {formatPercentage(performanceMetrics.changePercent)}
                </span>
              </div>
            </div>
          )}
        </div>
        
        {/* Chart Type Toggle */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setChartType("area")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              chartType === "area"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Area
          </button>
          <button
            onClick={() => setChartType("line")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              chartType === "line"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Line
          </button>
        </div>
      </div>

      {/* Enhanced Chart Container */}
      <div className="relative bg-gradient-to-br from-green-50/50 to-teal-50/50 rounded-2xl p-6 border border-green-100/50 shadow-sm">
        <div className="h-[400px] w-full">
          <ResponsiveContainer>
            {chartType === "area" ? (
              <AreaChart 
                data={data}
                margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
              >
                <defs>
                  <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#e5e7eb" 
                  strokeOpacity={0.6}
                  vertical={false}
                />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#6b7280" }}
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    return date.toLocaleDateString("en-US", { 
                      month: "short", 
                      day: "numeric", 
                    })
                  }}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#6b7280" }}
                  domain={yAxisDomain}
                  tickFormatter={formatYTick}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fill="url(#portfolioGradient)"
                  dot={false}
                  activeDot={{ 
                    r: 6, 
                    fill: "#10b981",
                    stroke: "#ffffff",
                    strokeWidth: 2,
                    style: { filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" },
                  }}
                />
              </AreaChart>
            ) : (
              <LineChart 
                data={data}
                margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#e5e7eb" 
                  strokeOpacity={0.6}
                  vertical={false}
                />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#6b7280" }}
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    return date.toLocaleDateString("en-US", { 
                      month: "short", 
                      day: "numeric", 
                    })
                  }}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#6b7280" }}
                  domain={yAxisDomain}
                  tickFormatter={formatYTick}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ 
                    r: 6, 
                    fill: "#10b981",
                    stroke: "#ffffff",
                    strokeWidth: 2,
                    style: { filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" },
                  }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Enhanced Timeframe Selector */}
      <div className="flex justify-center gap-2">
        {Object.entries(TIMEFRAME_LABELS).map(([timeframe, label]) => (
          <button
            key={timeframe}
            onClick={() => setSelectedTimeframe(timeframe as TimeFrame)}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedTimeframe === timeframe
                ? "bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-md hover:shadow-lg transform scale-105"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300 shadow-sm"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function PortfolioHistory() {
  const { user } = usePrivy()
  const { wallet } = useTranslations()
  const address = user?.smartWallet?.address || ""

  if (!user?.smartWallet?.address) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-8 border border-green-100 shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-200/30 to-teal-200/30 rounded-full blur-2xl -translate-y-16 translate-x-16" />
        <div className="relative">
          <div className="mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 text-transparent bg-clip-text">
              Portfolio History
            </h2>
            <p className="text-gray-600 mt-2">Track your portfolio value over time</p>
          </div>
          <div className="flex items-center justify-center h-[300px] bg-white/50 rounded-xl border border-green-100/50">
            <div className="text-center space-y-4">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-gray-700 font-medium">{wallet("connectWallet")} to view your portfolio history</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-8 border border-green-100 shadow-sm">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-200/30 to-teal-200/30 rounded-full blur-2xl -translate-y-16 translate-x-16" />
      <div className="relative">
        <div className="mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 text-transparent bg-clip-text">
            Portfolio History
          </h2>
          <p className="text-gray-600 mt-2">Track your portfolio value over time</p>
        </div>
        <PortfolioHistoryChart address={address} />
      </div>
    </div>
  )
} 