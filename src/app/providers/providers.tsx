"use client"

import { PrivyProvider } from "@privy-io/react-auth"
import { SmartWalletsProvider } from "@privy-io/react-auth/smart-wallets"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { MoneriumProvider } from "@monerium/sdk-react-provider"
import { WagmiProvider, createConfig } from "@privy-io/wagmi"
import { base } from "wagmi/chains"
import { http } from "wagmi"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { useState } from "react"
import { LanguageProvider } from "../../contexts/LanguageContext"

// Initialize i18n
import "../../lib/i18n"

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
})

// Optimized Query Client with performance-focused defaults
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Performance optimizations
        staleTime: 5000, // Consider data fresh for 5 seconds
        gcTime: 1000 * 60 * 60, // Cache for 1 hour (reduced from 24 hours)
        refetchOnWindowFocus: false, // Prevent unnecessary refetches
        refetchOnMount: true, // Fresh data on component mount
        refetchOnReconnect: true, // Refetch when network reconnects
        retry: (failureCount, error) => {
          // Smart retry logic
          if (error && typeof error === "object" && "status" in error) {
            const status = (error as { status: number }).status
            // Don't retry client errors (4xx)
            if (status >= 400 && status < 500) return false
          }
          // Retry up to 2 times for other errors
          return failureCount < 2
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

        // Network optimizations
        networkMode: "online", // Only run queries when online
      },
      mutations: {
        // Reduce mutation retry attempts for better UX
        retry: 1,
        networkMode: "online",
      },
    },
  })
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient)

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <PrivyProvider
          appId={process.env.NEXT_PUBLIC_APP_ID!}
          clientId={process.env.NEXT_PUBLIC_CLIENT_ID!}
          config={{
            defaultChain: base,
            supportedChains: [base],
            // Customize Privy's appearance in your app
            appearance: {
              theme: "light",
              accentColor: "#676FFF",
              logo: "https://your-logo-url",
              walletChainType: "ethereum-only",
            },
            // Create embedded wallets for users who don't have a wallet
            embeddedWallets: {
              createOnLogin: "users-without-wallets",
              showWalletUIs: false,
            },
            // Performance optimizations
            loginMethods: ["email", "google"], // Limit login methods for faster load
          }}
        >
          <SmartWalletsProvider>
            <WagmiProvider config={config}>
              <MoneriumProvider
                clientId="4636fc62-fe8f-11ef-8ea8-d600b28158e8"
                redirectUri={typeof window !== "undefined" ? `${window.location.origin}/dashboard` : "http://localhost:3000/dashboard"}
                environment="sandbox"
              >
                {children}
              </MoneriumProvider>
              {process.env.NODE_ENV === "development" && (
                <ReactQueryDevtools initialIsOpen={false} />
              )}
            </WagmiProvider>
          </SmartWalletsProvider>
        </PrivyProvider>
      </LanguageProvider>
    </QueryClientProvider>
  )
}