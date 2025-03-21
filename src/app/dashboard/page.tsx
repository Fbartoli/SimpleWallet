'use client';

import Header from '@/app/components/Header';
import { usePrivy } from '@privy-io/react-auth';
import { OnrampForm } from '@/app/components/OnrampForm';
import { ZeroXSwap } from '@/app/components/ZeroXSwap';
import { TokenBalances } from '@/app/components/TokenBalances'
import { Button } from '@/app/components/ui/button';

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
      <div className="min-h-screen bg-green-50/40 relative">
        {/* Background gradient elements */}
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-green-100/30 to-teal-100/30 rounded-full blur-3xl -z-10 transform translate-x-1/4 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-green-100/30 to-teal-100/30 rounded-full blur-3xl -z-10 transform -translate-x-1/4 translate-y-1/4" />

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
              className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white shadow-md hover:shadow-lg transition-all animate-pulse"
            >
              Connect
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-green-50/40 pb-16 md:pb-0">
      {/* Background gradient elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-b from-green-300/15 to-teal-400/10 rounded-full filter blur-3xl -z-10 transform translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-t from-green-400/15 to-teal-300/10 rounded-full filter blur-3xl -z-10 transform -translate-x-1/3 translate-y-1/3" />

      {/* Hide header on mobile, show on md breakpoint and above */}
      <div className="hidden md:block">
        <Header />
      </div>

      <main className="container mx-auto p-4 md:p-6 lg:p-8 relative z-10">
        <header className="mb-8">
          <div className="flex flex-col gap-1 mb-6">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 text-transparent bg-clip-text">
              Smart Vault Dashboard
            </h1>
            <p className="text-slate-500">Manage and track your token portfolio</p>
          </div>
        </header>

        <div className="lg:col-span-2 flex flex-col gap-6">
          <TokenBalances />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ZeroXSwap {...zeroXProps} />
            <OnrampForm {...onrampProps} />
          </div>
        </div>

      </main>
    </div>
  );
} 