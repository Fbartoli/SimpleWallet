'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { SmartWalletsProvider } from '@privy-io/react-auth/smart-wallets';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createConfig, WagmiProvider } from '@privy-io/wagmi';
import { base } from 'wagmi/chains';

import { http } from 'wagmi';

export const config = createConfig({
  batch: {
    multicall: {
      batchSize: 10,
      wait: 100,
    },
  },
  chains: [base], // Pass your required chains as an array
  transports: {
    [base.id]: http(),
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();


  return (
    <PrivyProvider
      appId="cm1q4mfkg00wvobwxl0g6nny4"
      config={{
        defaultChain: base,
        supportedChains: [base],
        // Customize Privy's appearance in your app
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
          logo: 'https://your-logo-url',
          walletChainType: 'ethereum-only'
        },
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          showWalletUIs: false,
        },
      }}
    >
      <SmartWalletsProvider>
        <OnchainKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          //@ts-ignore
          chain={base} // add baseSepolia for testing 
        >
          <QueryClientProvider client={queryClient}>
            <WagmiProvider config={config}>
              {children}
            </WagmiProvider>
          </QueryClientProvider>
        </OnchainKitProvider>
      </SmartWalletsProvider>
    </PrivyProvider>
  )
}