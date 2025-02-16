'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useTokenBalances } from '@/app/hooks/useTokenBalances'
import { TOKENS, type TokenSymbol } from '@/app/stores/useTokenStore'

export function TokenBalances() {
  const { user } = usePrivy()
  const { balances, isLoading, isError } = useTokenBalances()

  if (!user?.smartWallet?.address) return null
  if (isLoading) return <div className="animate-pulse">Loading balances...</div>
  if (isError) return <div className="text-destructive">Error loading balances</div>

  return (
    <div className="grid gap-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Your Balances</h3>
      <div className="grid gap-2">
        {Object.entries(TOKENS).map(([symbol, token]) => {
          const balance = balances[symbol as TokenSymbol]
          return (
            <div key={symbol} className="flex justify-between items-center">
              <span className="font-medium">{token.symbol}</span>
              <span className="text-muted-foreground">{balance.formatted}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
} 