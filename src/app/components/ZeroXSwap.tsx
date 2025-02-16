'use client'

import { useState } from 'react'
import { Button } from './Button'
import { useForm } from 'react-hook-form'
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
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets'
import { useToast } from "@/app/components/ui/use-toast"
import { TOKENS, type TokenSymbol } from '@/app/stores/useTokenStore'
import { useTokenBalances } from '@/app/hooks/useTokenBalances'
import { Address, createPublicClient, encodeFunctionData, erc20Abi, http, TransactionRequest } from 'viem'
import { ArrowDownUp } from 'lucide-react'
import { base } from 'viem/chains'

interface ZeroXQuote {
  to: string
  data: string
  value: string
  buyAmount: string
  estimatedGas: string
  price: string
  guaranteedPrice: string
  gas: string
  transaction: TransactionRequest,
  sellToken: Address,
  sellAmount: string,
  buyToken: Address,
  issues: {
    allowance: {
      spender: Address,
      actual: string
    }
  }
}

interface SwapFormValues {
  sellToken: TokenSymbol
  buyToken: TokenSymbol
  amount: string
}

interface ZeroXSwapProps {
  userAddress: `0x${string}`
}

const SWAP_FEE_CONFIG = {
  swapFeeRecipient: '0xf580ECFD347EDD88f048d694f744C790AF8e20e4' as const,
  swapFeeBps: '100' as const,
  tradeSurplusRecipient: '0xf580ECFD347EDD88f048d694f744C790AF8e20e4' as const,
}

export function ZeroXSwap({ userAddress }: ZeroXSwapProps) {
  const { client } = useSmartWallets()
  const { toast } = useToast()
  const [quote, setQuote] = useState<ZeroXQuote | null>(null)
  const [isQuoteLoading, setIsQuoteLoading] = useState(false)
  const [isSwapLoading, setIsSwapLoading] = useState(false)
  const { balances, refresh, isLoading: isBalanceLoading } = useTokenBalances()
  const publicClient = createPublicClient({
    chain: base,
    transport: http('https://base.gateway.tenderly.co/28rOk2uI3CVMnyinm9c3yn'),
  })

  const form = useForm<SwapFormValues>({
    defaultValues: {
      sellToken: 'USDC',
      buyToken: 'EURC',
      amount: '1'
    }
  })

  const selectedToken = form.watch('sellToken')
  const selectedTokenBalance = balances[selectedToken]

  const handleMaxClick = () => {
    if (selectedTokenBalance) {
      form.setValue('amount', selectedTokenBalance.formatted)
    }
  }

  async function getQuote(values: SwapFormValues) {
    if (values.sellToken === values.buyToken) {
      toast({
        variant: "destructive",
        title: "Invalid token selection",
        description: "Sell and buy tokens must be different"
      })
      return
    }

    if (isNaN(Number(values.amount)) || Number(values.amount) <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid amount",
        description: "Amount must be greater than 0"
      })
      return
    }

    setIsQuoteLoading(true)
    setQuote(null)

    try {
      const sellToken = TOKENS[values.sellToken]
      const buyToken = TOKENS[values.buyToken]

      const sellAmount = (BigInt(Math.floor(Number(values.amount) * 10 ** sellToken.decimals))).toString()

      const priceParams = new URLSearchParams({
        chainId: '8453',
        sellToken: sellToken.address,
        buyToken: buyToken.address,
        sellAmount,
        taker: userAddress,
        ...SWAP_FEE_CONFIG,
        swapFeeToken: sellToken.address,
      })

      const response = await fetch('/api/quote?' + priceParams.toString())
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch quote')
      }

      const data = await response.json()
      setQuote(data as ZeroXQuote)
      console.log('quote', data)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch quote'
      toast({
        variant: "destructive",
        title: "Error getting quote",
        description: message
      })
      console.error('Quote error:', error)
    } finally {
      setIsQuoteLoading(false)
    }
  }

  async function executeSwap() {
    if (!client || !quote) return
    console.log('Executing swap with quote:', quote)
    setIsSwapLoading(true)
    try {
      const calls = []
      if (quote.issues && quote.issues.allowance) {
        console.log('Adding allowance call')
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
      const tx = await client.sendTransaction({
        calls
      })

      toast({
        title: "Swap initiated",
        description: "Your swap transaction has been sent to the network"
      })

      // Wait for transaction to be mined
      await publicClient.waitForTransactionReceipt({ hash: tx as `0x${string}` })

      // Refresh balances after transaction is confirmed
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

  const handleSwapTokens = () => {
    const sellToken = form.getValues('sellToken')
    const buyToken = form.getValues('buyToken')
    
    // Update both fields and trigger form updates
    form.setValue('sellToken', buyToken, { shouldValidate: true })
    form.setValue('buyToken', sellToken, { shouldValidate: true })
    
    // Clear the quote when tokens are swapped
    setQuote(null)
  }

  const isLoading = isQuoteLoading || isSwapLoading
  const buyTokenInfo = TOKENS[form.watch('buyToken') as TokenSymbol]

  return (
    <div className="space-y-6 p-4 border rounded-lg bg-card">
      <h2 className="text-lg font-semibold">Swap Tokens</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(getQuote)} className="space-y-4">
          <FormField
            control={form.control}
            name="sellToken"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sell Token</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select token to sell" />
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
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>
                    Balance: {isBalanceLoading ? (
                      <span className="animate-pulse">Loading...</span>
                    ) : (
                      selectedTokenBalance?.formatted || '0.00'
                    )}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleMaxClick}
                    disabled={isLoading || isBalanceLoading}
                    className="h-auto py-0 px-2"
                  >
                    Max
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
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
                      onClick={handleMaxClick}
                      disabled={isLoading}
                      className="shrink-0"
                    >
                      Max
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
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

          <FormField
            control={form.control}
            name="buyToken"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Buy Token</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select token to buy" />
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

          {quote && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <p className="text-sm font-medium">
                Estimated output: {(Number(quote.buyAmount) / 10 ** buyTokenInfo.decimals).toFixed(6)} {buyTokenInfo.symbol}
              </p>
              <p className="text-sm text-muted-foreground">
                Price impact: {((Number(quote.price) / Number(quote.guaranteedPrice) - 1) * 100).toFixed(2)}%
              </p>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <Button type="submit" disabled={isLoading}>
              {isQuoteLoading ? 'Getting Quote...' : 'Get Quote'}
            </Button>
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