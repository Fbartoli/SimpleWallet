"use client"

import { Suspense, useMemo } from "react"
import { usePrivy } from "@privy-io/react-auth"
import { useTokenBalances } from "@/hooks/useTokenBalances"
import { useTokenPrices } from "@/hooks/useTokenPrices"
import { SUPPORTED_TOKENS, type TokenSymbol } from "@/config/constants"
import { RefreshCw, Wallet } from "lucide-react"
import { ErrorDisplay, TokenGrid, TotalValueDisplay } from "@/components/token-balances"
import { useTranslations } from "@/hooks/useTranslations"



interface TokenBalance {
  formatted: string
  usdValue: number
  value: bigint
}







function TokenBalancesContent() {
  const { user } = usePrivy()
  const walletAddress = user?.smartWallet?.address as `0x${string}`

  const {
    storeBalances,
    isLoading: balancesLoading,
    error: balancesError,
    refresh: refreshBalances,
    totalUSDValue,
    optimisticUpdate,
  } = useTokenBalances(walletAddress || "")

  return (
    <>
      {/* Reserve space for optimistic update notification to prevent layout shift */}
      <div className="mb-4" style={{ minHeight: optimisticUpdate.isActive ? "auto" : "0px" }}>
        {optimisticUpdate.isActive && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-800 rounded-lg border border-blue-200">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm font-medium">Transaction pending - balances updating...</span>
          </div>
        )}
      </div>

      <TokenBalancesMainContent
        user={user}
        storeBalances={storeBalances}
        balancesLoading={balancesLoading}
        balancesError={balancesError?.message || null}
        refreshBalances={refreshBalances}
        totalUSDValue={totalUSDValue}
      />
    </>
  )
}

function TokenBalancesMainContent({
  user,
  storeBalances,
  balancesLoading,
  balancesError,
  refreshBalances,
  totalUSDValue,
}: {
  user: ReturnType<typeof usePrivy>["user"]
  storeBalances: Record<TokenSymbol, TokenBalance>
  balancesLoading: boolean
  balancesError: string | null
  refreshBalances: () => void
  totalUSDValue: number
}) {
  const { wallet } = useTranslations()

  const {
    storePrices,
    isLoading: pricesLoading,
    error: pricesError,
    refresh: refreshPrices,
  } = useTokenPrices()

  const isLoading = balancesLoading || pricesLoading
  const error = balancesError || pricesError || null

  const handleRetry = () => {
    refreshBalances()
    refreshPrices()
  }

  // Calculate stablecoin value
  const stablecoinValue = useMemo(() => {
    return Object.entries(storeBalances)
      .filter(([symbol]) => SUPPORTED_TOKENS[symbol as TokenSymbol]?.isStablecoin)
      .reduce((total, [, balance]) => total + (balance?.usdValue || 0), 0)
  }, [storeBalances])

  if (!user?.smartWallet?.address) {
    return (
      <div className="p-4 bg-amber-50 text-amber-800 rounded-lg border border-amber-100">
        <p>{wallet("connectWallet")} to view token balances.</p>
      </div>
    )
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={handleRetry} />
  }

  return (
    <>
      <TotalValueDisplay
        totalValue={totalUSDValue}
        stablecoinValue={stablecoinValue}
        isLoading={isLoading}
      />
      <TokenGrid
        storeBalances={storeBalances}
        storePrices={storePrices}
        isLoading={isLoading}
      />
    </>
  )
}

export function TokenBalances() {
  return (
    <div className="p-6 border rounded-lg shadow-md bg-card relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-teal-50 opacity-50 pointer-events-none" />
      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-8 bg-green-500/10 text-green-600 rounded-full flex items-center justify-center">
            <Wallet className="h-4 w-4" />
          </div>
          <h3 className="text-lg font-semibold">{useTranslations().wallet("balance")}</h3>
        </div>

        <Suspense fallback={
          <div className="grid gap-3 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-slate-100 rounded-md"></div>
            ))}
          </div>
        }>
          <TokenBalancesContent />
        </Suspense>
      </div>
    </div>
  )
} 