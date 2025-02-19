'use client';

import Header from '@/app/components/Header';
import { usePrivy } from '@privy-io/react-auth';
import { VaultDetails } from '@/app/components/VaultDetails';
import { VAULT_ADDRESSES, VAULT_INFO } from '@/app/config/vaults';
import { OnrampForm } from '@/app/components/OnrampForm';
import { ZeroXSwap } from '@/app/components/ZeroXSwap';
import { TokenBalances } from '@/app/components/TokenBalances'
import { UserFeeDisplay } from '@/app/components/UserFeeDisplay'

export default function App() {
  const { user } = usePrivy();
  const smartWalletAddress = user?.smartWallet?.address;

  if (!smartWalletAddress) return <Header />;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-start mb-8">
            <h1 className="text-4xl font-bold tracking-tight">Your Vault Dashboard</h1>
            {/* <UserFeeDisplay /> */}
          </div>
          
          <div className="grid gap-6 mb-8">
          <TokenBalances />

            <OnrampForm 
              userAddress={smartWalletAddress as `0x${string}`}
              projectId={process.env.NEXT_PUBLIC_CDP_PROJECT_ID!}
            />
            <ZeroXSwap 
              userAddress={smartWalletAddress as `0x${string}`}
            />
          </div>

          <div className="grid gap-6">
      <p>Soon you will be able to earn a yield on your deposits.</p>

            {VAULT_ADDRESSES.map((vaultAddress) => {
              const vaultInfo = VAULT_INFO[vaultAddress];
              return (
                <div key={vaultAddress} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold">{vaultInfo.name}</h2>
                      <p className="text-muted-foreground">{vaultInfo.description}</p>
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">
                      {/* <p>Eligible balance: {vaultInfo.token}</p> */}
                    </div>
                  </div>
                  <VaultDetails
                    vaultAddress={vaultAddress as `0x${string}`}
                    userAddress={smartWalletAddress as `0x${string}`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
} 