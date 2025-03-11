'use client'

import { useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets'
import { useTokenBalances } from '@/app/hooks/useTokenBalances'
import { useTokenPrices } from '@/app/hooks/useTokenPrices'
import { TOKENS, WETH_ABI, type TokenSymbol } from '@/app/stores/useTokenStore'
import { useBalance } from 'wagmi'
import { useToast } from '@/app/components/ui/use-toast'
import { encodeFunctionData, createPublicClient, http } from 'viem'
import { base } from 'viem/chains'
import { Wallet, CircleDollarSign, Bitcoin, Coins } from 'lucide-react'


// Initialize a public client for transaction receipt tracking
const publicClient = createPublicClient({
  chain: base,
  transport: http()
})

export function TokenBalances() {
  const { user } = usePrivy()
  const { client } = useSmartWallets()
  const { toast } = useToast()
  const { balances, isLoading, isError, refresh } = useTokenBalances()
  const { prices, isLoading: isPricesLoading } = useTokenPrices()
  const [isDepositingToWeth, setIsDepositingToWeth] = useState(false)

  // Get native ETH balance
  const walletAddress = user?.smartWallet?.address as `0x${string}`
  const {
    data: ethBalance,
    isLoading: isEthLoading
  } = useBalance({
    address: walletAddress,
    query: {
      enabled: Boolean(walletAddress),
      refetchInterval: 10000,
    }
  })

  // Deposit ETH to WETH if balance exists
  useEffect(() => {
    // Only run if we have a wallet client, a smart wallet address, and ETH balance data
    if (!client || !walletAddress || !ethBalance || isDepositingToWeth) return

    // If ETH balance is greater than 0 (and not too small to cover gas)
    // Leaving some ETH for gas costs (very rough estimate)
    const minBalanceToConvert = 0.0001 * 10 ** 18
    if (ethBalance.value > BigInt(minBalanceToConvert)) {
      const depositToWeth = async () => {
        setIsDepositingToWeth(true)

        try {
          // Create the deposit transaction data
          const data = encodeFunctionData({
            abi: WETH_ABI,
            functionName: 'deposit'
          })

          // Amount to deposit (leaving some ETH for gas)
          const amountToDeposit = ethBalance.value - BigInt(minBalanceToConvert)

          // Send the transaction
          const tx = await client.sendTransaction({
            to: TOKENS.WETH.address as `0x${string}`,
            data,
            value: amountToDeposit
          })

          // Notify user
          toast({
            title: "Depositing ETH to WETH",
            description: `Converting ${Number(amountToDeposit) / 10 ** 18} ETH to WETH...`
          })

          // Wait for transaction to complete
          await publicClient.waitForTransactionReceipt({ hash: tx as `0x${string}` })

          // Refresh balances after deposit
          refresh()

        } catch (error) {
          console.error("Error depositing ETH to WETH:", error)
        } finally {
          setIsDepositingToWeth(false)
        }
      }

      depositToWeth()
    }
  }, [client, ethBalance, walletAddress, toast, refresh, isDepositingToWeth])

  // Map token symbols to icons
  const tokenIcons: Record<TokenSymbol, React.ReactNode> = {
    'USDC': <CircleDollarSign className="h-5 w-5 text-green-600" />,
    'EURC': <CircleDollarSign className="h-5 w-5 text-blue-600" />,
    'WETH': <Coins className="h-5 w-5 text-purple-600" />,
    'WBTC': <Bitcoin className="h-5 w-5 text-orange-600" />,
  }

  // Get token background styles
  const getTokenStyle = (symbol: TokenSymbol) => {
    switch (symbol) {
      case 'USDC': return 'bg-green-50 text-green-800 border-green-100';
      case 'EURC': return 'bg-blue-50 text-blue-800 border-blue-100';
      case 'WETH': return 'bg-purple-50 text-purple-800 border-purple-100';
      case 'WBTC': return 'bg-orange-50 text-orange-800 border-orange-100';
      default: return 'bg-gray-50 text-gray-800 border-gray-100';
    }
  }

  if (!user?.smartWallet?.address) return null
  if (isLoading || isEthLoading) return (
    <div className="p-6 border rounded-lg shadow-md bg-card">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-8 w-8 bg-green-500/10 text-green-600 rounded-full flex items-center justify-center">
          <Wallet className="h-4 w-4" />
        </div>
        <h3 className="text-lg font-semibold">Your Balances</h3>
      </div>
      <div className="grid gap-3 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-14 bg-slate-100 rounded-md"></div>
        ))}
      </div>
    </div>
  )

  if (isError) return (
    <div className="p-6 border rounded-lg shadow-md bg-card">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-8 w-8 bg-red-500/10 text-red-600 rounded-full flex items-center justify-center">
          <Wallet className="h-4 w-4" />
        </div>
        <h3 className="text-lg font-semibold">Your Balances</h3>
      </div>
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        Error loading balances. Please refresh the page and try again.
      </div>
    </div>
  )

  // Filter tokens with non-zero balances
  const tokensWithBalance = Object.entries(TOKENS)
    .filter(([symbol]) => balances[symbol as TokenSymbol].value > 0n)
    .map(([symbol]) => symbol as TokenSymbol);

  const hasTokens = tokensWithBalance.length > 0;

  return (
    <div className="p-6 border rounded-lg shadow-md bg-card relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-teal-50 opacity-50 pointer-events-none" />

      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-8 bg-green-500/10 text-green-600 rounded-full flex items-center justify-center">
            <Wallet className="h-4 w-4" />
          </div>
          <h3 className="text-lg font-semibold">Your Balances</h3>
        </div>

        {hasTokens ? (
          <div className="grid gap-3">
            {tokensWithBalance.map((symbol) => {
              const token = TOKENS[symbol];
              const balance = balances[symbol];
              const price = prices?.[symbol];
              const tokenStyle = getTokenStyle(symbol);

              // Calculate the formatted balance value in USDC
              const balanceInUSDC = price && balance
                ? (Number(price.price) * Number(balance.formatted)).toFixed(2)
                : '0.00';

              return (
                <div
                  key={symbol}
                  className={`flex justify-between items-center p-3 rounded-lg border ${tokenStyle}`}
                >
                  <div className="flex items-center gap-2">
                    {tokenIcons[symbol]}
                    <div className="flex flex-col">
                      <span className="font-medium">{token.displaySymbol}</span>
                      {price && !isPricesLoading && (
                        <span className="text-sm text-gray-500">
                          ${Number(price.price).toFixed(2)} USD
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-mono font-medium">{balance.formatted.slice(0, 10)}</span>
                    {price && !isPricesLoading && (
                      <span className="text-sm text-gray-500">
                        ${balanceInUSDC} USD
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 bg-amber-50 text-amber-800 rounded-lg border border-amber-100">
            <p>No tokens in your wallet yet. Use the Buy Crypto option below to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
} 