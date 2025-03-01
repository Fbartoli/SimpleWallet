'use client'

import { useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets'
import { useTokenBalances } from '@/app/hooks/useTokenBalances'
import { TOKENS, WETH_ABI, type TokenSymbol } from '@/app/stores/useTokenStore'
import { useBalance } from 'wagmi'
import { useToast } from '@/app/components/ui/use-toast'
import { encodeFunctionData, createPublicClient, http } from 'viem'
import { base } from 'viem/chains'


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

  if (!user?.smartWallet?.address) return null
  if (isLoading || isEthLoading) return <div className="animate-pulse">Loading balances...</div>
  if (isError) return <div className="text-destructive">Error loading balances</div>

  return (
    <div className="grid gap-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Your Balances</h3>
      <div className="grid gap-2">
        {Object.entries(TOKENS).map(([symbol, token]) => {
          const balance = balances[symbol as TokenSymbol]
          return (
            <div key={symbol} className="flex justify-between items-center">
              <span className="font-medium">{token.displaySymbol}</span>
              <span className="text-muted-foreground">{balance.formatted.slice(0, 8)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
} 