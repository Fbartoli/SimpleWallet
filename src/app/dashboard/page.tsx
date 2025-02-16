'use client';

import Header from '@/app/components/Header';
import { usePrivy } from '@privy-io/react-auth';
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets';
import { VaultDetails } from '@/app/components/VaultDetails';
import { VAULT_ADDRESSES, VAULT_INFO } from '@/app/config/vaults';
import { OnrampForm } from '@/app/components/OnrampForm';
import { ZeroXSwap } from '@/app/components/ZeroXSwap';
import { TokenBalances } from '@/app/components/TokenBalances'

export default function App() {
  const { user } = usePrivy();
  const { client } = useSmartWallets();
  const projectId = process.env.NEXT_PUBLIC_CDP_PROJECT_ID;

  if (!projectId) {
    console.error('Missing NEXT_PUBLIC_COINBASE_PROJECT_ID environment variable');
    return <div>No smart wallet address</div>;
  }

  const smartWalletAddress = user?.smartWallet?.address;
  if (!smartWalletAddress) return <Header />;

  const handleDeploy = async () => {
    if(!client) return;
    const transactionRequest = {
      to: smartWalletAddress as `0x${string}`,
      value: 0n,
      data: "0x" as `0x${string}`,
    }
    const txHash = await client.sendTransaction(transactionRequest);
    console.log(txHash)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight mb-8">Your Vault Dashboard</h1>
          
          <div className="grid gap-6 mb-8">
            <OnrampForm 
              userAddress={smartWalletAddress as `0x${string}`}
              projectId={projectId}
            />
            <ZeroXSwap 
              userAddress={smartWalletAddress as `0x${string}`}
            />
            {/* <Button onClick={handleDeploy}>Deploy</Button> */}
          </div>

          <div className="grid gap-6">
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
                      {vaultInfo.token}
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
          <TokenBalances />
        </div>
      </main>
    </div>
  );
} 