"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets"
import { useToast } from "@/components/ui/use-toast"
import { SUPPORTED_TOKENS as TOKENS, type TokenConfig as Token, type TokenSymbol } from "@/config/constants"
import { useTokenBalances } from "@/hooks/useTokenBalances"
import { useSwapQuote } from "@/hooks/useSwapQuote"
import { useActivityRefresh } from "@/contexts/ActivityContext"
import { createPublicClient, encodeFunctionData, erc20Abi, formatUnits, http } from "viem"
import { base } from "viem/chains"
import { ArrowDownUp, Loader2 } from "lucide-react"
import { useTranslations } from "@/hooks/useTranslations"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"

interface SwapFormValues {
  sellToken: TokenSymbol
  buyToken: TokenSymbol
  amount: string
}

interface ZeroXSwapProps {
  userAddress: string
}

const publicClient = createPublicClient({
  chain: base,
  transport: http("https://base.gateway.tenderly.co/28rOk2uI3CVMnyinm9c3yn"),
})

function TokenSelect({
  name,
  label,
  storeBalances,
  tokensToDisplay,
}: {
  name: "sellToken" | "buyToken",
  label: string,
  balances?: { address: string; amount: string; decimals: number }[]
  storeBalances?: Record<TokenSymbol, { value: bigint; formatted: string }>
  tokensToDisplay?: Array<[string, Token]>
}) {
  const { swap } = useTranslations()

  // Memoize the fallback tokens to prevent new array creation
  const fallbackTokens = useMemo(() => Object.entries(TOKENS), [])

  // Use provided memoized tokens or fallback to memoized all tokens
  const displayTokens = tokensToDisplay || fallbackTokens

  // Memoize the token items to prevent recreation on every render
  const tokenItems = useMemo(() => {
    return displayTokens.map(([symbol, token]) => {
      const tokenSymbol = symbol as TokenSymbol
      const storeBalance = storeBalances?.[tokenSymbol]
      const displayBalance = storeBalance?.formatted || "0.00"

      return (
        <SelectItem key={symbol} value={symbol} className="hover:bg-muted">
          <div className="flex items-center justify-between w-full">
            <span className="font-medium">{token.displaySymbol}</span>
            {storeBalance && storeBalance.value > 0n && (
              <span className="ml-2 text-sm text-gray-500 font-mono">
                {displayBalance}
              </span>
            )}
          </div>
        </SelectItem>
      )
    })
  }, [displayTokens, storeBalances])

  return (
    <FormField
      name={name as keyof SwapFormValues}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={swap("selectToken")} />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="bg-background border rounded-md shadow-md max-h-60 overflow-y-auto">
              {tokenItems}
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
  const { swap } = useTranslations()

  return (
    <FormField
      name={"amount" as const}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{swap("enterAmount")}</FormLabel>
          <div className="relative">
            <FormControl>
              <Input
                type="number"
                step="any"
                min="0"
                placeholder="0.00"
                {...field}
                onBlur={() => {
                  field.onBlur()
                  onBlur()
                }}
                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none pr-16"
              />
            </FormControl>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2.5 text-xs font-medium text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={onMaxClick}
              disabled={isBalanceLoading || !balance}
            >
              {isBalanceLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                "Max"
              )}
            </Button>
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
  const { refreshActivity } = useActivityRefresh()
  const [isSwapLoading, setIsSwapLoading] = useState(false)
  const [shouldFetchQuote, setShouldFetchQuote] = useState(false)
  const { swap, common } = useTranslations()

  // Re-enable useTokenBalances with proper memoization
  const {
    balances,
    storeBalances,
    refresh,
    isLoading: isBalanceLoading,
    optimisticUpdate,
    applyOptimisticSwap,
    revertOptimisticSwap,
    confirmOptimisticSwap,
  } = useTokenBalances(userAddress)

  const form = useForm<SwapFormValues>({
    defaultValues: {
      sellToken: "" as TokenSymbol,
      buyToken: "EURC",
      amount: "1",
    },
  })

  const { watch, setValue, getValues } = form
  const sellToken = watch("sellToken")
  const buyToken = watch("buyToken")
  const amount = watch("amount")

  // Format the amount to ensure it's a valid number
  const formattedAmount = useMemo(() => {
    return amount && !isNaN(Number(amount)) ? amount : "0"
  }, [amount])

  // Get quote for the swap
  const { data: quote, isLoading: isQuoteLoading } = useSwapQuote({
    sellToken,
    buyToken,
    sellAmount: formattedAmount,
    taker: userAddress,
    shouldFetch: shouldFetchQuote,
    enabled: Boolean(sellToken && buyToken && formattedAmount && Number(formattedAmount) > 0 && sellToken !== buyToken),
  })

  // Memoize the tokens to display to prevent unnecessary re-renders
  const tokensToDisplay = useMemo(() => {
    return Object.entries(TOKENS)
  }, [])

  // Memoize tokens with positive balance
  const tokensWithPositiveBalance = useMemo(() => {
    return Object.entries(TOKENS).filter(([symbol]) => {
      const tokenSymbol = symbol as TokenSymbol
      const storeBalance = storeBalances[tokenSymbol]
      return storeBalance && storeBalance.value > 0n
    })
  }, [storeBalances])

  // Memoize the selected token balance to prevent repeated access
  const selectedTokenBalance = useMemo(() => {
    return sellToken ? storeBalances[sellToken] : null
  }, [sellToken, storeBalances])

  // Auto-select first available token with positive balance when user connects
  useEffect(() => {
    if (storeBalances && Object.keys(storeBalances).length > 0 && !sellToken) {
      // Only run this logic if no sellToken is selected
      const firstAvailableToken = Object.entries(storeBalances).find(([_, balance]) =>
        balance.value > 0n
      )

      if (firstAvailableToken) {
        const [tokenSymbol] = firstAvailableToken
        setValue("sellToken", tokenSymbol as TokenSymbol, { shouldValidate: true })
      }
    }
  }, [storeBalances, setValue, sellToken])

  // Watch for changes in tokens or amount to trigger quote updates
  useEffect(() => {
    if (sellToken && buyToken && formattedAmount && Number(formattedAmount) > 0 && sellToken !== buyToken) {
      setShouldFetchQuote(true)
    }
  }, [sellToken, buyToken, formattedAmount])

  // Memoize handleMaxClick to prevent recreation
  const handleMaxClick = useCallback(() => {
    if (selectedTokenBalance && selectedTokenBalance.value > 0n) {
      setValue("amount", selectedTokenBalance.formatted)
      setShouldFetchQuote(true)
    }
  }, [selectedTokenBalance, setValue])

  // Memoize handleSwapTokens to prevent recreation
  const handleSwapTokens = useCallback(() => {
    const currentSellToken = getValues("sellToken")
    const currentBuyToken = getValues("buyToken")
    setValue("sellToken", currentBuyToken, { shouldValidate: true })
    setValue("buyToken", currentSellToken, { shouldValidate: true })
    setShouldFetchQuote(true)
  }, [getValues, setValue])

  // Memoize handleAmountBlur to prevent recreation
  const handleAmountBlur = useCallback(() => {
    setShouldFetchQuote(true)
  }, [])

  // Reset quote fetch flag after quote is loaded
  useEffect(() => {
    if (quote) {
      setShouldFetchQuote(false)
    }
  }, [quote])

  // Memoize fetchQuote function
  const fetchQuote = useCallback(() => {
    if (sellToken && buyToken && formattedAmount && Number(formattedAmount) > 0 && sellToken !== buyToken) {
      setShouldFetchQuote(true)
    } else {
      toast({
        title: swap("cannotFetchQuote"),
        description: swap("selectValidTokensAndAmount"),
        variant: "destructive",
      })
    }
  }, [sellToken, buyToken, formattedAmount, toast, swap])

  async function executeSwap() {
    if (!client || !quote) return
    setIsSwapLoading(true)

    // Apply optimistic update immediately
    const sellAmount = BigInt(quote.sellAmount)
    const buyAmount = BigInt(quote.buyAmount)

    applyOptimisticSwap(sellToken, buyToken, sellAmount, buyAmount)

    // Show immediate success feedback
    toast({
      title: swap("swapProcessing"),
      description: swap("swappingTokens").replace("{{sellToken}}", TOKENS[sellToken]?.displaySymbol || sellToken).replace("{{buyToken}}", TOKENS[buyToken]?.displaySymbol || buyToken),
    })

    try {
      // Deploy account if needed
      if (!await client.account.isDeployed()) {
        const deployTx = await client.sendTransaction({
          to: userAddress as `0x${string}`,
          data: "0x",
          value: 0n,
        })
        await publicClient.waitForTransactionReceipt({ hash: deployTx as `0x${string}` })
      }

      // Prepare swap transaction
      const calls = []
      if (quote.issues?.allowance) {
        calls.push({
          to: quote.sellToken as `0x${string}`,
          data: encodeFunctionData({
            abi: erc20Abi,
            functionName: "approve",
            args: [quote.issues.allowance.spender, BigInt(quote.sellAmount)],
          }),
          value: 0n,
        })
      }
      calls.push({
        to: quote.transaction.to as `0x${string}`,
        data: quote.transaction.data as `0x${string}`,
        value: BigInt(quote.transaction.value || 0),
      })

      // Execute the swap
      const tx = await client.sendTransaction({ calls })

      // Wait for confirmation
      await publicClient.waitForTransactionReceipt({ hash: tx as `0x${string}` })

      // Confirm the optimistic update (clears the pending indicator)
      confirmOptimisticSwap()

      // Refresh actual balances after confirmation
      refresh()

      toast({
        title: swap("swapCompleted"),
        description: swap("swapExecutedSuccessfully"),
      })

      // Refresh activity feed with a small delay to allow indexing
      setTimeout(() => {
        refreshActivity()
      }, 2000)
    } catch (error) {
      // Revert optimistic update on failure
      revertOptimisticSwap()

      const message = error instanceof Error ? error.message : "Failed to execute swap"
      toast({
        variant: "destructive",
        title: swap("swapFailed"),
        description: message,
      })
    } finally {
      setIsSwapLoading(false)
    }
  }

  const isLoading = isQuoteLoading || isSwapLoading
  const buyTokenInfo = TOKENS[buyToken]

  if (!buyTokenInfo) {
    return (
      <div className="p-6 border rounded-lg shadow-md bg-card">
        <p>{swap("invalidTokenConfiguration")}</p>
      </div>
    )
  }

  return (
    <div className="p-6 border rounded-lg shadow-md bg-card relative overflow-hidden min-h-[500px] flex flex-col">
      {/* Background gradient element */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-teal-50 opacity-50 pointer-events-none" />

      <div className="relative flex-1 flex flex-col">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-8 w-8 bg-green-500/10 text-green-600 rounded-full flex items-center justify-center">
            <ArrowDownUp className="h-4 w-4" />
          </div>
          <h2 className="text-lg font-semibold">{swap("swapTokens")}</h2>
        </div>

        <Form {...form}>
          <form className="space-y-5">
            <TokenSelect
              name="sellToken"
              label={swap("from")}
              balances={balances}
              storeBalances={storeBalances}
              tokensToDisplay={tokensWithPositiveBalance}
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
                <span className="sr-only">{swap("swapTokens")}</span>
              </Button>
            </div>

            <TokenSelect
              name="buyToken"
              label={swap("to")}
              storeBalances={storeBalances}
              tokensToDisplay={tokensToDisplay}
            />

            <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-green-100 min-h-[100px]">
              {/* Reserve space for optimistic update notification */}
              <div className="mb-2" style={{ minHeight: optimisticUpdate.isActive ? "auto" : "0px" }}>
                {optimisticUpdate.isActive && (
                  <div className="flex items-center gap-2 p-2 bg-blue-50 rounded border border-blue-200">
                    <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
                    <p className="text-xs font-medium text-blue-800">{swap("confirmingSwapOnBlockchain")}</p>
                  </div>
                )}
              </div>

              {/* Quote/loading section with consistent height */}
              <div className="space-y-2" style={{ minHeight: "48px" }}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                    <p className="text-sm font-medium text-green-800">{common("loading")}</p>
                  </div>
                ) : quote ? (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-green-800">
                      {swap("estimatedOutput")} {(Number(quote.buyAmount) / 10 ** buyTokenInfo.decimals).toFixed(6)} {buyTokenInfo.symbol}
                    </p>
                    {quote.fees?.integratorFee && (() => {
                      const feeToken = findTokenByAddress(quote.fees.integratorFee.token)
                      if (!feeToken) return null
                      return (
                        <p className="text-sm text-green-600">
                          {swap("platformFee")} {formatUnits(BigInt(quote.fees.integratorFee.amount), feeToken.decimals).toString()} {feeToken.symbol}
                        </p>
                      )
                    })()}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-green-600">
                      {swap("enterAmount")} {swap("selectTokensForQuote")}
                    </p>
                    <Button
                      type="button"
                      onClick={fetchQuote}
                      className="w-full bg-green-100 hover:bg-green-200 text-green-700 shadow-sm"
                    >
                      {swap("getQuote")}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {quote && (
                <Button
                  type="button"
                  onClick={executeSwap}
                  disabled={isLoading || !client}
                  className={!client
                    ? "bg-slate-200 text-slate-600 h-10"
                    : "bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white shadow-md hover:shadow-lg transition-all h-10"}
                >
                  {!client ? swap("walletNotConnected") : (
                    isSwapLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>{swap("swapNow")}...</span>
                      </div>
                    ) : (
                      swap("swapNow")
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