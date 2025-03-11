'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets'
import { useToast } from "@/app/components/ui/use-toast"
import { Token, TOKENS, type TokenSymbol } from '@/app/stores/useTokenStore'
import { useTokenBalances } from '@/app/hooks/useTokenBalances'
import { useSwapQuote } from '@/app/hooks/useSwapQuote'
import { createPublicClient, encodeFunctionData, erc20Abi, formatUnits, http } from 'viem'
import { base } from 'viem/chains'
import { ArrowDownUp, Loader2 } from 'lucide-react'
import { useUserFee } from '../hooks/useUserFee'
import { DEFAULT_FEE_BPS } from '../api/tiers/config'

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

function TokenSelect({
  name,
  label,
  filterPositiveBalance = false,
  balances = {}
}: {
  name: 'sellToken' | 'buyToken',
  label: string,
  filterPositiveBalance?: boolean,
  balances?: Record<string, { value: bigint, formatted: string }>
}) {
  // Get tokens to display, filtering by balance if needed
  const tokensToDisplay = filterPositiveBalance
    ? Object.entries(TOKENS).filter(([symbol]) =>
      balances[symbol] && balances[symbol].value > 0n
    )
    : Object.entries(TOKENS);

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
              {tokensToDisplay.map(([symbol, token]) => (
                <SelectItem key={symbol} value={symbol} className="hover:bg-muted">
                  {token.displaySymbol}
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
  onBlur,
  onMaxClick,
  isBalanceLoading,
  balance,
}: {
  onBlur: () => void
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
                onBlur={() => {
                  field.onBlur()
                  onBlur()
                }}
                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onMaxClick}
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

function findTokenByAddress(address: string): Token | undefined {
  return Object.values(TOKENS).find(token =>
    token.address.toLowerCase() === address.toLowerCase()
  )
}

export function ZeroXSwap({ userAddress }: ZeroXSwapProps) {
  const { client } = useSmartWallets()
  const { toast } = useToast()
  const [isSwapLoading, setIsSwapLoading] = useState(false)
  const [shouldFetchQuote, setShouldFetchQuote] = useState(false)
  const { balances, refresh, isLoading: isBalanceLoading } = useTokenBalances()
  const { data: feeBps } = useUserFee()

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

  // After the component renders initially, trigger quote fetch
  useEffect(() => {
    // We only want this to run once on mount
    if (sellToken && buyToken && amount && Number(amount) > 0 && sellToken !== buyToken) {
      setShouldFetchQuote(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Log whenever shouldFetchQuote changes to debug
  useEffect(() => {
  }, [shouldFetchQuote]);

  // Format the amount to ensure it's a valid number
  const formattedAmount = amount && !isNaN(Number(amount)) ? amount : '0'

  // Debug information
  const { data: quote, isLoading: isQuoteLoading } = useSwapQuote({
    sellToken,
    buyToken,
    sellAmount: formattedAmount,
    userAddress,
    feeBps: feeBps?.toString() || DEFAULT_FEE_BPS.toString(),
    shouldFetch: shouldFetchQuote,
    enabled: Boolean(sellToken && buyToken && formattedAmount && Number(formattedAmount) > 0 && sellToken !== buyToken)
  })

  // Watch for changes in tokens or amount to trigger quote updates
  useEffect(() => {
    if (sellToken && buyToken && formattedAmount && Number(formattedAmount) > 0 && sellToken !== buyToken) {
      setShouldFetchQuote(true);
    }
  }, [sellToken, buyToken, formattedAmount]);

  const handleMaxClick = () => {
    if (selectedTokenBalance) {
      setValue('amount', selectedTokenBalance.formatted)
      setShouldFetchQuote(true)
    }
  }

  const handleSwapTokens = () => {
    const currentSellToken = getValues('sellToken')
    const currentBuyToken = getValues('buyToken')
    setValue('sellToken', currentBuyToken, { shouldValidate: true })
    setValue('buyToken', currentSellToken, { shouldValidate: true })
    setShouldFetchQuote(true)
  }

  const handleAmountBlur = () => {
    setShouldFetchQuote(true)
  }

  // Reset quote fetch flag after quote is loaded
  useEffect(() => {
    if (quote) {
      setShouldFetchQuote(false)
    }
  }, [quote])

  // Manual fetch function for the Get Quote button
  const fetchQuote = () => {
    if (sellToken && buyToken && formattedAmount && Number(formattedAmount) > 0 && sellToken !== buyToken) {
      setShouldFetchQuote(true);
    } else {
      toast({
        title: "Cannot fetch quote",
        description: "Please select valid tokens and enter an amount greater than 0",
        variant: "destructive"
      });
    }
  };

  async function executeSwap() {
    if (!client || !quote) return
    setIsSwapLoading(true)

    try {
      if (! await client.account.isDeployed()) {
        const tx = await client.sendTransaction({
          to: userAddress,
          data: '0x',
          value: 0n
        })
        await publicClient.waitForTransactionReceipt({ hash: tx as `0x${string}` })
      }
    } catch (error) {
      console.error('Failed to deploy account:', error)
      toast({
        variant: "destructive",
        title: "Error deploying account",
        description: "Please try again"
      })
    }
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

      const receipt = await publicClient.waitForTransactionReceipt({ hash: tx as `0x${string}` })

      // Record the fee if present
      if (quote.fees?.integratorFee) {
        const feeToken = findTokenByAddress(quote.fees.integratorFee.token)
        if (feeToken) {
          const response = await fetch('/api/fees', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: userAddress,
              amount: quote.fees.integratorFee.amount,
              token: quote.fees.integratorFee.token,
              tokenSymbol: feeToken.symbol,
              transactionHash: receipt.transactionHash,
            }),
          })

          if (!response.ok) {
            console.error('Failed to record fee:', await response.json())
          }
        }
      }

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
    } finally {
      setIsSwapLoading(false)
    }
  }

  const isLoading = isQuoteLoading || isSwapLoading
  const buyTokenInfo = TOKENS[buyToken]

  return (
    <div className="space-y-6 p-6 border rounded-lg bg-card shadow-md relative overflow-hidden">
      {/* Background gradient element */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-teal-50 opacity-50 pointer-events-none" />

      <div className="relative">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-8 w-8 bg-green-500/10 text-green-600 rounded-full flex items-center justify-center">
            <ArrowDownUp className="h-4 w-4" />
          </div>
          <h2 className="text-lg font-semibold">Swap Tokens</h2>
        </div>

        <Form {...form}>
          <form className="space-y-5">
            <TokenSelect
              name="sellToken"
              label="Sell Token"
              filterPositiveBalance={true}
              balances={balances}
            />

            <AmountInput
              onBlur={handleAmountBlur}
              onMaxClick={handleMaxClick}
              isBalanceLoading={isBalanceLoading}
              balance={selectedTokenBalance?.formatted}
            />

            <div className="flex justify-center -my-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full bg-green-100 hover:bg-green-200 text-green-600 hover:text-green-700 transition-colors shadow-sm"
                onClick={handleSwapTokens}
              >
                <ArrowDownUp className="h-5 w-5" />
                <span className="sr-only">Swap tokens</span>
              </Button>
            </div>

            <TokenSelect name="buyToken" label="Buy Token" />

            <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg space-y-2 border border-green-100">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                  <p className="text-sm font-medium text-green-800">Fetching latest quote...</p>
                </div>
              ) : quote ? (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-green-800">
                    Estimated output: {(Number(quote.buyAmount) / 10 ** buyTokenInfo.decimals).toFixed(6)} {buyTokenInfo.symbol}
                  </p>
                  {quote.fees?.integratorFee && (() => {
                    const feeToken = findTokenByAddress(quote.fees.integratorFee.token)
                    if (!feeToken) return null
                    return (
                      <p className="text-sm text-green-600">
                        Platform fee: {formatUnits(BigInt(quote.fees.integratorFee.amount), feeToken.decimals).toString()} {feeToken.symbol}
                      </p>
                    )
                  })()}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-green-600">
                    Enter an amount and select tokens to get a quote
                  </p>
                  <Button
                    type="button"
                    onClick={fetchQuote}
                    className="w-full bg-green-100 hover:bg-green-200 text-green-700 shadow-sm"
                  >
                    Get Quote
                  </Button>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              {quote && (
                <Button
                  type="button"
                  onClick={executeSwap}
                  disabled={isLoading || !client}
                  className={!client
                    ? "bg-slate-200 text-slate-600"
                    : "bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white shadow-md hover:shadow-lg transition-all"}
                >
                  {!client ? 'Wallet Not Connected' : (
                    isSwapLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Executing Swap...</span>
                      </div>
                    ) : (
                      'Execute Swap'
                    )
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
} 