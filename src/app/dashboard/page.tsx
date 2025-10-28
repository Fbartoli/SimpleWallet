"use client"

import { Suspense, lazy, memo, useMemo } from "react"
import Header from "@/components/Header"
import { usePrivy } from "@privy-io/react-auth"
import { ActivityProvider } from "@/contexts/ActivityContext"
import { useTranslations } from "@/hooks/useTranslations"
import { MoneriumAuth } from "@/components/MoneriumAuth"
import { FeatureFlag } from "@/components/FeatureFlag"
import {
    ConnectScreen,
    LoadingScreen,
    MorphoEarnSkeleton,
    SendSkeleton,
    SwapSkeleton,
    TokenBalancesSkeleton,
} from "@/components/skeletons"

// Lazy load heavy components with prefetch hints
const ZeroXSwap = lazy(() => import("@/components/ZeroXSwap").then(mod => ({ default: mod.ZeroXSwap })))
const TokenBalances = lazy(() => import("@/components/TokenBalances").then(mod => ({ default: mod.TokenBalances })))
const MorphoEarn = lazy(() => import("@/components/MorphoEarn").then(mod => ({ default: mod.MorphoEarn })))
const Send = lazy(() => import("@/components/Send").then(mod => ({ default: mod.Send })))

// Extract background gradients to avoid re-creating on each render
function BackgroundGradientsComponent() {
    return (
        <>
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-b from-green-300/15 to-teal-400/10 rounded-full filter blur-3xl -z-10 transform translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-t from-green-400/15 to-teal-300/10 rounded-full filter blur-3xl -z-10 transform -translate-x-1/3 translate-y-1/3" />
        </>
    )
}

const BackgroundGradients = memo(BackgroundGradientsComponent)

// Memoized dashboard header to prevent unnecessary re-renders
function DashboardHeaderComponent() {
    const { navigation } = useTranslations()
    
    return (
        <header className="mb-8">
            <div className="flex flex-col gap-1 mb-6">
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 text-transparent bg-clip-text">
                    {navigation("dashboard")}
                </h1>
                <p className="text-slate-500">Manage and track your token portfolio</p>
            </div>
        </header>
    )
}

const DashboardHeader = memo(DashboardHeaderComponent)

// Memoized swap and send grid to prevent unnecessary re-renders
interface SwapSendGridProps {
    smartWalletAddress: `0x${string}`
}

function SwapSendGridComponent({ smartWalletAddress }: SwapSendGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Suspense fallback={<SwapSkeleton />}>
                <ZeroXSwap userAddress={smartWalletAddress} />
            </Suspense>
            <Suspense fallback={<SendSkeleton />}>
                <Send />
            </Suspense>
        </div>
    )
}

const SwapSendGrid = memo(SwapSendGridComponent)

// Memoized Morpho section
interface MorphoSectionProps {
    smartWalletAddress: `0x${string}`
}

function MorphoSectionComponent({ smartWalletAddress }: MorphoSectionProps) {
    return (
        <div className="grid grid-cols-1 gap-6">
            <Suspense fallback={<MorphoEarnSkeleton />}>
                <MorphoEarn userAddress={smartWalletAddress} />
            </Suspense>
        </div>
    )
}

const MorphoSection = memo(MorphoSectionComponent)

export default function Dashboard() {
    const { user, login, ready } = usePrivy()
    const smartWalletAddress = user?.smartWallet?.address

    // Memoize wallet address to prevent unnecessary type casting
    const typedWalletAddress = useMemo(() => 
        smartWalletAddress as `0x${string}` | undefined,
        [smartWalletAddress]
    )

    // Show loading screen while Privy is initializing
    if (!ready) {
        return <LoadingScreen />
    }

    // Show connect screen if user is not authenticated
    if (!typedWalletAddress) {
        return <ConnectScreen onConnect={login} />
    }

    // Show dashboard when authenticated
    return (
        <div className="relative min-h-screen bg-green-50/40 pb-16 md:pb-0">
            {/* Background gradient elements - memoized to prevent re-renders */}
            <BackgroundGradients />

            {/* Reserve space for header to prevent layout shift */}
            <div className="h-16 md:h-20">
                <div className="hidden md:block">
                    <Header />
                </div>
            </div>

            <main className="container mx-auto p-4 md:p-6 lg:p-8 relative z-10">
                <DashboardHeader />

                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Token Balances Section */}
                    <Suspense fallback={<TokenBalancesSkeleton />}>
                        <TokenBalances />
                    </Suspense>

                    {/* Monerium Auth - Feature Flagged */}
                    <FeatureFlag flag="monerium-auth">
                        <MoneriumAuth />
                    </FeatureFlag>

                    {/* Activity-dependent sections */}
                    <ActivityProvider>
                        <SwapSendGrid smartWalletAddress={typedWalletAddress} />
                        <MorphoSection smartWalletAddress={typedWalletAddress} />
                    </ActivityProvider>
                </div>
            </main>
        </div>
    )
}
