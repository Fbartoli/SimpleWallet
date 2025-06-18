'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { SmartWalletsProvider } from '@privy-io/react-auth/smart-wallets';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createConfig, WagmiProvider } from '@privy-io/wagmi';
import { base } from 'wagmi/chains';
import { http } from 'wagmi';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
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
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5000, // Consider data stale after 5 seconds by default
            gcTime: 1000 * 60 * 60 * 24, // Keep unused data in cache for 24 hours
            refetchOnWindowFocus: false, // Don't refetch on window focus by default
            retry: 3, // Retry failed requests 3 times
          },
        },
      })
  )
  return (
    <QueryClientProvider client={queryClient}>
      <PrivyProvider
        appId={process.env.NEXT_PUBLIC_APP_ID!}
        clientId={process.env.NEXT_PUBLIC_CLIENT_ID!}
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
          <WagmiProvider config={config}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
          </WagmiProvider>
        </SmartWalletsProvider>
      </PrivyProvider>
    </QueryClientProvider>

  )
}