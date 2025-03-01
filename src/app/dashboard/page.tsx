'use client';

import Header from '@/app/components/Header';
import { usePrivy } from '@privy-io/react-auth';
import { OnrampForm } from '@/app/components/OnrampForm';
import { ZeroXSwap } from '@/app/components/ZeroXSwap';
import { TokenBalances } from '@/app/components/TokenBalances'
import { UserFeeDisplay } from '../components/UserFeeDisplay';
import { Button } from '@/app/components/ui/button';
import { BanknoteIcon, LockIcon, UnlockIcon, ActivityIcon } from 'lucide-react';
import { ArrowDownIcon, ArrowUpIcon, RefreshCwIcon } from 'lucide-react';

// Sample activity data
const activityItems = [
  {
    type: 'deposit',
    description: 'Deposited to Vault',
    amount: '100',
    token: 'USDC',
    time: '2 hours ago'
  },
  {
    type: 'swap',
    description: 'Swapped tokens',
    amount: '50',
    token: 'ETH',
    time: 'Yesterday'
  },
  {
    type: 'withdrawal',
    description: 'Withdrew from Vault',
    amount: '25',
    token: 'USDC',
    time: '3 days ago'
  }
];

export default function Dashboard() {
  const { user, login } = usePrivy();
  const smartWalletAddress = user?.smartWallet?.address;

  const zeroXProps = {
    userAddress: smartWalletAddress as `0x${string}`
  };

  const onrampProps = {
    userAddress: smartWalletAddress as `0x${string}`,
    projectId: process.env.NEXT_PUBLIC_CDP_PROJECT_ID!
  };

  if (!smartWalletAddress) {
    return (
      <div className="min-h-screen bg-background relative">
        {/* Background gradient elements */}
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-full blur-3xl -z-10 transform translate-x-1/4 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-green-100/30 to-cyan-100/30 rounded-full blur-3xl -z-10 transform -translate-x-1/4 translate-y-1/4" />

        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Welcome to Simple Savings</h1>
            <p className="text-muted-foreground">
              Connect your wallet to access your vault dashboard and start managing your finances.
            </p>
            <Button
              size="lg"
              onClick={login}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all animate-pulse"
            >
              Connect
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Background gradient elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-b from-green-400/10 to-teal-500/5 rounded-full filter blur-3xl -z-10 transform translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-t from-green-300/10 to-emerald-500/5 rounded-full filter blur-3xl -z-10 transform -translate-x-1/3 translate-y-1/3" />

      <Header />
      <main className="container mx-auto p-4 md:p-6 lg:p-8 relative z-10">
        <header className="mb-8">
          <div className="flex flex-col gap-1 mb-6">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 text-transparent bg-clip-text">
              Smart Vault Dashboard
            </h1>
            <p className="text-slate-500">Manage and track your token portfolio</p>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <UserFeeDisplay />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ZeroXSwap {...zeroXProps} />
              <OnrampForm {...onrampProps} />
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="p-6 border rounded-lg shadow-md bg-card relative overflow-hidden">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-teal-50 opacity-50 pointer-events-none" />

                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-8 bg-green-500/10 text-green-600 rounded-full flex items-center justify-center">
                      <BanknoteIcon className="h-4 w-4" />
                    </div>
                    <h3 className="text-lg font-semibold">Earn Yield</h3>
                  </div>

                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg mb-4">
                    <p className="text-amber-800">
                      <strong>Coming soon!</strong> This upcoming feature will allow you to earn yield on your Dollars and Euros in the vault. Stay tuned for updates.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button disabled className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white shadow-sm transition-all">
                      <LockIcon className="mr-2 h-4 w-4" />
                      Stake
                    </Button>
                    <Button disabled className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white shadow-sm transition-all">
                      <UnlockIcon className="mr-2 h-4 w-4" />
                      Unstake
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 flex flex-col gap-6">
            <TokenBalances />

            <div className="p-6 border rounded-lg shadow-md bg-card relative overflow-hidden">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-teal-50 opacity-50 pointer-events-none" />

              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-8 w-8 bg-green-500/10 text-green-600 rounded-full flex items-center justify-center">
                    <ActivityIcon className="h-4 w-4" />
                  </div>
                  <h3 className="text-lg font-semibold">Recent Activity</h3>
                </div>

                <div className="flex flex-col gap-3">
                  {activityItems.map((item, i) => (
                    <div key={i} className="p-3 rounded-md border border-slate-100 flex items-center gap-3 hover:border-green-100 hover:bg-green-50/50 transition-colors">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${item.type === 'deposit' ? 'bg-green-100 text-green-600' :
                        item.type === 'withdrawal' ? 'bg-amber-100 text-amber-600' :
                          'bg-sky-100 text-sky-600'
                        }`}>
                        {item.type === 'deposit' ? <ArrowDownIcon className="h-4 w-4" /> :
                          item.type === 'withdrawal' ? <ArrowUpIcon className="h-4 w-4" /> :
                            <RefreshCwIcon className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.description}</p>
                        <p className="text-xs text-muted-foreground">{item.time}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${item.type === 'deposit' ? 'text-green-600' :
                          item.type === 'withdrawal' ? 'text-amber-600' :
                            'text-sky-600'
                          }`}>
                          {item.type === 'deposit' ? '+' : item.type === 'withdrawal' ? '-' : ''}
                          {item.amount} {item.token}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 