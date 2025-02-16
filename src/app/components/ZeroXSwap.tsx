'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets'
import { useToast } from "@/app/components/ui/use-toast"
import { Token, TOKENS, type TokenSymbol } from '@/app/stores/useTokenStore'
import { useTokenBalances } from '@/app/hooks/useTokenBalances'
import { useSwapQuote } from '@/app/hooks/useSwapQuote'
import { createPublicClient, encodeFunctionData, erc20Abi, http } from 'viem'
import { base } from 'viem/chains'
import { ArrowDownUp } from 'lucide-react'

import { Button } from '@/app/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select"
import { Input } from "@/app/components/ui/input"
import { ZeroXQuote } from '../types/quote'

interface SwapFormValues {
  sellToken: TokenSymbol
  buyToken: TokenSymbol
  amount: string
}

interface ZeroXSwapProps {
  userAddress: `0x${string}`
}

const publicClient = createPublicClient({
  chain: base,
  transport: http('https://base.gateway.tenderly.co/28rOk2uI3CVMnyinm9c3yn'),
})

function TokenSelect({ name, label }: { name: 'sellToken' | 'buyToken', label: string }) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={`Select token to ${name === 'sellToken' ? 'sell' : 'buy'}`} />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="bg-background border rounded-md shadow-md">
              {Object.entries(TOKENS).map(([symbol, token]) => (
                <SelectItem key={symbol} value={symbol} className="hover:bg-muted">
                  {token.symbol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function AmountInput({ 
  isLoading,
  onMaxClick,
  isBalanceLoading,
  balance,
}: { 
  isLoading: boolean
  onMaxClick: () => void
  isBalanceLoading: boolean
  balance?: string
}) {
  return (
    <FormField
      name="amount"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Amount</FormLabel>
          <FormControl>
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                step="0.000000000000000001"
                {...field}
                disabled={isLoading}
                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onMaxClick}
                disabled={isLoading}
                className="shrink-0"
              >
                Max
              </Button>
            </div>
          </FormControl>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              Balance: {isBalanceLoading ? (
                <span className="animate-pulse">Loading...</span>
              ) : (
                balance || '0.00'
              )}
            </span>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function QuoteDetails({ quote, buyTokenInfo }: { quote: ZeroXQuote, buyTokenInfo: Token }) {
  if (!quote) return null
  
  return (
    <div className="p-4 bg-muted rounded-lg space-y-2">
      <p className="text-sm font-medium">
        Estimated output: {(Number(quote.buyAmount) / 10 ** buyTokenInfo.decimals).toFixed(6)} {buyTokenInfo.symbol}
      </p>
      <p className="text-sm text-muted-foreground">
        Price impact: {((Number(quote.price) / Number(quote.guaranteedPrice) - 1) * 100).toFixed(2)}%
      </p>
    </div>
  )
}

export function ZeroXSwap({ userAddress }: ZeroXSwapProps) {
  const { client } = useSmartWallets()
  const { toast } = useToast()
  const [isSwapLoading, setIsSwapLoading] = useState(false)
  const { balances, refresh, isLoading: isBalanceLoading } = useTokenBalances()

  const form = useForm<SwapFormValues>({
    defaultValues: {
      sellToken: 'USDC',
      buyToken: 'EURC',
      amount: '1'
    }
  })

  const { watch, setValue, getValues } = form
  const sellToken = watch('sellToken')
  const buyToken = watch('buyToken')
  const amount = watch('amount')
  
  const selectedTokenBalance = balances[sellToken]

  const { data: quote, isLoading: isQuoteLoading } = useSwapQuote({
    sellToken,
    buyToken,
    sellAmount: amount,
    userAddress,
    enabled: Boolean(sellToken && buyToken && amount && Number(amount) > 0 && sellToken !== buyToken)
  })

  const handleMaxClick = () => {
    if (selectedTokenBalance) {
      setValue('amount', selectedTokenBalance.formatted)
    }
  }

  const handleSwapTokens = () => {
    const currentSellToken = getValues('sellToken')
    const currentBuyToken = getValues('buyToken')
    setValue('sellToken', currentBuyToken, { shouldValidate: true })
    setValue('buyToken', currentSellToken, { shouldValidate: true })
  }

  async function executeSwap() {
    if (!client || !quote) return
    setIsSwapLoading(true)
    try {
      const calls = []
      if (quote.issues?.allowance) {
        calls.push({
          to: quote.sellToken as `0x${string}`,
          data: encodeFunctionData({
            abi: erc20Abi,
            functionName: 'approve',
            args: [quote.issues.allowance.spender, BigInt(quote.sellAmount)]
          }),
          value: 0n,
        })
      }
      calls.push({
        to: quote.transaction.to as `0x${string}`,
        data: quote.transaction.data as `0x${string}`,
        value: BigInt(quote.transaction.value || 0),
      })
      const tx = await client.sendTransaction({ calls })

      toast({
        title: "Swap initiated",
        description: "Your swap transaction has been sent to the network"
      })

      await publicClient.waitForTransactionReceipt({ hash: tx as `0x${string}` })
      refresh()

      toast({
        title: "Swap completed",
        description: "Your swap has been completed and balances are being updated"
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to execute swap'
      toast({
        variant: "destructive",
        title: "Error executing swap",
        description: message
      })
      console.error('Swap error:', error)
    } finally {
      setIsSwapLoading(false)
    }
  }

  const isLoading = isQuoteLoading || isSwapLoading
  const buyTokenInfo = TOKENS[buyToken]

  return (
    <div className="space-y-6 p-4 border rounded-lg bg-card">
      <h2 className="text-lg font-semibold">Swap Tokens</h2>
      <Form {...form}>
        <form className="space-y-4">
          <TokenSelect name="sellToken" label="Sell Token" />
          
          <AmountInput
            isLoading={isLoading}
            onMaxClick={handleMaxClick}
            isBalanceLoading={isBalanceLoading}
            balance={selectedTokenBalance?.formatted}
          />

          <div className="flex justify-center -my-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-muted"
              onClick={handleSwapTokens}
              disabled={isLoading}
            >
              <ArrowDownUp className="h-4 w-4" />
              <span className="sr-only">Swap tokens</span>
            </Button>
          </div>

          <TokenSelect name="buyToken" label="Buy Token" />

          {quote && (
            <QuoteDetails quote={quote} buyTokenInfo={buyTokenInfo} />
          )}

          <div className="flex flex-col gap-4">
            {quote && (
              <Button
                type="button"
                onClick={executeSwap}
                disabled={isLoading || !client}
                variant={!client ? "secondary" : "default"}
              >
                {!client ? 'Wallet Not Connected' :
                  isSwapLoading ? 'Executing Swap...' : 'Execute Swap'}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
} 