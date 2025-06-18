'use client'

import { useMemo, memo, Suspense } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useTokenBalances } from '@/hooks/useTokenBalances'
import { useTokenPrices } from '@/hooks/useTokenPrices'
import { SUPPORTED_TOKENS, type TokenSymbol } from '@/config/constants'
import { Wallet, Bitcoin, Coins, Euro, DollarSign, RefreshCw, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Token icon mapping (constant to prevent re-creation)
const TOKEN_ICONS: Record<TokenSymbol, React.ReactNode> = {
  'USDC': <DollarSign className="h-5 w-5 text-green-600" />,
  'EURC': <Euro className="h-5 w-5 text-blue-600" />,
  'WETH': <Coins className="h-5 w-5 text-purple-600" />,
  'CBBTC': <Bitcoin className="h-5 w-5 text-orange-600" />,
}

// Token styling (constant to prevent re-creation)
const TOKEN_STYLES: Record<TokenSymbol, string> = {
  'USDC': 'bg-green-50 text-green-800 border-green-100 hover:bg-green-100',
  'EURC': 'bg-blue-50 text-blue-800 border-blue-100 hover:bg-blue-100',
  'WETH': 'bg-purple-50 text-purple-800 border-purple-100 hover:bg-purple-100',
  'CBBTC': 'bg-orange-50 text-orange-800 border-orange-100 hover:bg-orange-100',
}

interface TokenCardProps {
  symbol: TokenSymbol
  balance: string
  usdValue: number
  price: number
  isLoading: boolean
}

const TokenCard = memo(function TokenCard({
  symbol,
  balance,
  usdValue,
  price,
  isLoading
}: TokenCardProps) {
  const token = SUPPORTED_TOKENS[symbol]
  const icon = TOKEN_ICONS[symbol]
  const style = TOKEN_STYLES[symbol] || 'bg-gray-50 text-gray-800 border-gray-100'

  const formattedBalance = useMemo(() => {
    const num = Number(balance)
    if (num === 0) return '0.00'
    if (num < 0.001) return '<0.001'
    if (num < 1) return num.toFixed(6)
    return num.toFixed(4)
  }, [balance])

  const formattedUsdValue = useMemo(() =>
    usdValue < 0.01 ? '<$0.01' : `$${usdValue.toFixed(2)}`,
    [usdValue]
  )

  const formattedPrice = useMemo(() =>
    price < 0.01 ? '<$0.01' : `$${price.toFixed(2)}`,
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

interface TokenBalance {
  formatted: string
  usdValue: number
  value: bigint
}

interface TokenPrice {
  price: number
}

const TokenGrid = memo(function TokenGrid({
  storeBalances,
  storePrices,
  isLoading
}: {
  storeBalances: Record<TokenSymbol, TokenBalance>
  storePrices: Record<TokenSymbol, TokenPrice>
  isLoading: boolean
}) {
  const tokenList = useMemo(() => {
    return Object.entries(SUPPORTED_TOKENS).map(([symbol]) => {
      const tokenSymbol = symbol as TokenSymbol
      const balance = storeBalances[tokenSymbol]
      const price = storePrices[tokenSymbol]

      return {
        symbol: tokenSymbol,
        balance: balance?.formatted || '0.00',
        usdValue: balance?.usdValue || 0,
        price: price?.price || 0,
        hasBalance: balance && balance.value > 0n
      }
    })
  }, [storeBalances, storePrices])

  // Filter and sort tokens - only show tokens with value >= $1 or with any balance
  const sortedTokens = useMemo(() => {
    return tokenList
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
  }, [tokenList])

  return (
    <div className="grid gap-3">
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

const ErrorDisplay = memo(function ErrorDisplay({
  error,
  onRetry
}: {
  error: string
  onRetry: () => void
}) {
  return (
    <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
      <div className="flex items-center gap-2 mb-2">
        <AlertCircle className="h-4 w-4" />
        <span className="font-medium">Error loading balances</span>
      </div>
      <p className="text-sm mb-3">{error}</p>
      <Button
        size="sm"
        variant="outline"
        onClick={onRetry}
        className="text-red-700 border-red-200 hover:bg-red-100"
      >
        <RefreshCw className="h-3 w-3 mr-1" />
        Try Again
      </Button>
    </div>
  )
})

const TotalValueDisplay = memo(function TotalValueDisplay({
  totalValue,
  stablecoinValue
}: {
  totalValue: number
  stablecoinValue: number
}) {
  if (totalValue === 0) return null

  return (
    <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-green-100">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Total Portfolio Value</span>
        <span className="font-semibold text-lg">${totalValue.toFixed(2)}</span>
      </div>
      {stablecoinValue > 0 && (
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-500">Stablecoins</span>
          <span className="text-sm text-gray-600">${stablecoinValue.toFixed(2)}</span>
        </div>
      )}
    </div>
  )
})

function TokenBalancesContent() {
  const { user } = usePrivy()
  const walletAddress = user?.smartWallet?.address as `0x${string}`

  const {
    storeBalances,
    isLoading: balancesLoading,
    error: balancesError,
    refresh: refreshBalances,
    totalUSDValue,
    optimisticUpdate
  } = useTokenBalances(walletAddress || '')

  return (
    <>
      {optimisticUpdate.isActive && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-blue-50 text-blue-800 rounded-lg border border-blue-200">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span className="text-sm font-medium">Transaction pending - balances updating...</span>
        </div>
      )}
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
  totalUSDValue
}: {
  user: ReturnType<typeof usePrivy>['user']
  storeBalances: Record<TokenSymbol, TokenBalance>
  balancesLoading: boolean
  balancesError: string | null
  refreshBalances: () => void
  totalUSDValue: number
}) {

  const {
    storePrices,
    isLoading: pricesLoading,
    error: pricesError,
    refresh: refreshPrices
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
        <p>Please connect your wallet to view token balances.</p>
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
          <h3 className="text-lg font-semibold">Your Balances</h3>
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