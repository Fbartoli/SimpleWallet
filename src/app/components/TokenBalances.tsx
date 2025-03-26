'use client'

import { useEffect, useMemo, useCallback, memo, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets'
import { useTokenBalances } from '@/app/hooks/useTokenBalances'
import { useTokenPrices } from '@/app/hooks/useTokenPrices'
import { TOKENS, WETH_ABI, type TokenSymbol } from '@/app/stores/useTokenStore'
import { useBalance } from 'wagmi'
import { useToast } from '@/app/components/ui/use-toast'
import { encodeFunctionData, createPublicClient, http } from 'viem'
import { base } from 'viem/chains'
import { Wallet, Bitcoin, Coins, Euro, DollarSign } from 'lucide-react'
import { DuneBalance } from '@/types/dune'

// Initialize a public client for transaction receipt tracking
const publicClient = createPublicClient({
  chain: base,
  transport: http()
})

// Map token symbols to icons (memoized outside component)
const tokenIcons: Record<TokenSymbol, React.ReactNode> = {
  'USDC': <DollarSign className="h-5 w-5 text-green-600" />,
  'EURC': <Euro className="h-5 w-5 text-blue-600" />,
  'WETH': <Coins className="h-5 w-5 text-purple-600" />,
  'CBBTC': <Bitcoin className="h-5 w-5 text-orange-600" />,
}

// Get token background styles (memoized outside component)
const getTokenStyle = (symbol: TokenSymbol) => {
  switch (symbol) {
    case 'USDC': return 'bg-green-50 text-green-800 border-green-100';
    case 'EURC': return 'bg-blue-50 text-blue-800 border-blue-100';
    case 'WETH': return 'bg-purple-50 text-purple-800 border-purple-100';
    case 'CBBTC': return 'bg-orange-50 text-orange-800 border-orange-100';
    default: return 'bg-gray-50 text-gray-800 border-gray-100';
  }
}

interface TokenCardProps {
  balance: DuneBalance;
  prices: Record<TokenSymbol, { price: string; estimatedGas: string; decimals: number }> | null;
  isPricesLoading: boolean;
}

const TokenCard = memo(function TokenCard({ balance, prices, isPricesLoading }: TokenCardProps) {
  const tokenSymbol = useMemo(() =>
    Object.entries(TOKENS).find(
      (entry) => entry[1].address.toLowerCase() === balance.address.toLowerCase()
    )?.[0] as TokenSymbol | undefined,
    [balance.address]
  );

  const token = tokenSymbol ? TOKENS[tokenSymbol] : null;
  const price = tokenSymbol ? prices?.[tokenSymbol] : null;

  const balanceInUSD = useMemo(() =>
    price
      ? (Number(price.price) * Number(balance.amount) / 10 ** balance.decimals).toFixed(2)
      : '0.00',
    [price, balance.amount, balance.decimals]
  );

  const displaySymbol = token?.displaySymbol || balance.symbol;
  const tokenStyle = tokenSymbol ? getTokenStyle(tokenSymbol) : 'bg-gray-50 text-gray-800 border-gray-100';

  return (
    <div
      className={`flex justify-between items-center p-3 rounded-lg border ${tokenStyle} transition-opacity duration-300 ease-in-out`}
    >
      <div className="flex items-center gap-2">
        {tokenSymbol ? tokenIcons[tokenSymbol] : <Coins className="h-5 w-5 text-gray-600" />}
        <div className="flex flex-col">
          <span className="font-medium">{displaySymbol}</span>
          {price && !isPricesLoading && (
            <span className="text-sm text-gray-500">
              ${Number(price.price).toFixed(2)} USD
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end">
        <span className="font-mono font-medium">
          {Number(balance.amount) / 10 ** balance.decimals}
        </span>
        <span className="text-sm text-gray-500">
          ${balanceInUSD} USD
        </span>
      </div>
    </div>
  );
});

const BalancesList = memo(function BalancesList({
  balances,
  prices,
  isPricesLoading
}: {
  balances: DuneBalance[],
  prices: Record<TokenSymbol, { price: string; estimatedGas: string; decimals: number }> | null,
  isPricesLoading: boolean
}) {
  // Filter balances to only include whitelisted tokens
  const whitelistedBalances = balances.filter(balance =>
    Object.values(TOKENS).some(token =>
      token.address.toLowerCase() === balance.address.toLowerCase()
    )
  );

  const hasTokens = whitelistedBalances.length > 0;

  if (!hasTokens) {
    return (
      <div className="p-4 bg-amber-50 text-amber-800 rounded-lg border border-amber-100">
        <p>No tokens in your wallet yet. Use the Buy Crypto option below to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {whitelistedBalances.map((balance) => (
        <TokenCard
          key={balance.address}
          balance={balance}
          prices={prices}
          isPricesLoading={isPricesLoading}
        />
      ))}
    </div>
  );
});

export function TokenBalances() {
  const { user } = usePrivy()
  const { client } = useSmartWallets()
  const { toast } = useToast()
  const walletAddress = user?.smartWallet?.address as `0x${string}`
  const { balances, isLoading, error, refresh } = useTokenBalances(walletAddress || '')
  const { prices, isLoading: isPricesLoading } = useTokenPrices()
  const [isDepositingToWeth, setIsDepositingToWeth] = useState(false)

  // Get native ETH balance
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
  const depositToWeth = useCallback(async () => {
    if (!client || !walletAddress || !ethBalance || isDepositingToWeth) return;

    const minBalanceToConvert = 0.0001 * 10 ** 18;
    if (ethBalance.value <= BigInt(minBalanceToConvert)) return;

    setIsDepositingToWeth(true);

    try {
      const data = encodeFunctionData({
        abi: WETH_ABI,
        functionName: 'deposit'
      });

      const amountToDeposit = ethBalance.value - BigInt(minBalanceToConvert);

      const tx = await client.sendTransaction({
        to: TOKENS.WETH.address as `0x${string}`,
        data,
        value: amountToDeposit
      });

      toast({
        title: "Depositing ETH to WETH",
        description: `Converting ${Number(amountToDeposit) / 10 ** 18} ETH to WETH...`
      });

      await publicClient.waitForTransactionReceipt({ hash: tx as `0x${string}` });
      refresh();

    } catch (error) {
      console.error("Error depositing ETH to WETH:", error);
    } finally {
      setIsDepositingToWeth(false);
    }
  }, [client, ethBalance, walletAddress, toast, refresh, isDepositingToWeth]);

  useEffect(() => {
    if (ethBalance?.value) {
      depositToWeth();
    }
  }, [ethBalance, depositToWeth]);

  // Memoize the content to prevent unnecessary re-renders
  const content = useMemo(() => {
    if (!user?.smartWallet?.address) return null;
    if (isLoading || isEthLoading) {
      return (
        <div className="grid gap-3 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 bg-slate-100 rounded-md"></div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4 bg-red-50 text-red-700 rounded-md">
          Error loading balances. Please refresh the page and try again.
        </div>
      );
    }

    return (
      <BalancesList
        balances={balances}
        prices={prices}
        isPricesLoading={isPricesLoading}
      />
    );
  }, [user?.smartWallet?.address, isLoading, isEthLoading, error, balances, prices, isPricesLoading]);

  // Memoize the header to prevent unnecessary re-renders
  const header = useMemo(() => (
    <div className="flex items-center gap-3 mb-6">
      <div className="h-8 w-8 bg-green-500/10 text-green-600 rounded-full flex items-center justify-center">
        <Wallet className="h-4 w-4" />
      </div>
      <h3 className="text-lg font-semibold">Your Balances</h3>
    </div>
  ), []);

  return (
    <div className="p-6 border rounded-lg shadow-md bg-card relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-teal-50 opacity-50 pointer-events-none" />
      <div className="relative">
        {header}
        {content}
      </div>
    </div>
  );
} 