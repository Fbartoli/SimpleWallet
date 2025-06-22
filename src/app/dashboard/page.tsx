"use client"

import { Suspense, lazy } from "react"
import Header from "@/components/Header"
import { usePrivy } from "@privy-io/react-auth"
import { ActivityProvider } from "@/contexts/ActivityContext"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useTranslations } from "@/hooks/useTranslations"

// Lazy load heavy components
const ZeroXSwap = lazy(() => import("@/components/ZeroXSwap").then(mod => ({ default: mod.ZeroXSwap })))
const TokenBalances = lazy(() => import("@/components/TokenBalances").then(mod => ({ default: mod.TokenBalances })))
const Activity = lazy(() => import("@/components/Activity").then(mod => ({ default: mod.Activity })))
const Send = lazy(() => import("@/components/Send").then(mod => ({ default: mod.Send })))

// Improved skeleton loaders with consistent dimensions
const TokenBalancesSkeleton = () => (
    <div className="p-6 border rounded-lg shadow-md bg-card relative overflow-hidden min-h-[400px]">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-teal-50 opacity-50 pointer-events-none" />
        <div className="relative">
            <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
            </div>

            {/* Total value section skeleton */}
            <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-green-100">
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                        <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="h-px bg-gray-200" />
                    <div className="h-8 w-full bg-gray-200 rounded animate-pulse" />
                </div>
            </div>

            {/* Token cards skeleton - consistent with actual content */}
            <div className="grid gap-3">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex justify-between items-center p-3 rounded-lg border bg-gray-50 animate-pulse">
                        <div className="flex items-center gap-2">
                            <div className="h-5 w-5 bg-gray-200 rounded" />
                            <div className="flex flex-col gap-1">
                                <div className="h-4 w-12 bg-gray-200 rounded" />
                                <div className="h-3 w-16 bg-gray-200 rounded" />
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <div className="h-4 w-16 bg-gray-200 rounded" />
                            <div className="h-3 w-12 bg-gray-200 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
)

const SwapSkeleton = () => (
    <div className="p-6 border rounded-lg shadow-md bg-card relative overflow-hidden min-h-[500px] flex flex-col">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-teal-50 opacity-50 pointer-events-none" />
        <div className="relative flex-1 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
            </div>

            <div className="space-y-5 flex-1">
                {/* Form fields skeleton */}
                <div className="space-y-2">
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                    <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
                </div>

                <div className="space-y-2">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                    <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
                </div>

                <div className="flex justify-center">
                    <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
                </div>

                <div className="space-y-2">
                    <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
                    <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
                </div>

                {/* Quote section skeleton */}
                <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-green-100 min-h-[80px]">
                    <div className="space-y-2">
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                    </div>
                </div>

                <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
            </div>
        </div>
    </div>
)

const SendSkeleton = () => (
    <div className="p-6 border rounded-lg shadow-md bg-card relative overflow-hidden min-h-[500px] flex flex-col">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-50 pointer-events-none" />
        <div className="relative flex-1 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
            </div>

            <div className="space-y-5 flex-1">
                {/* Form fields skeleton */}
                <div className="space-y-2">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                    <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
                </div>

                <div className="space-y-2">
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                    <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
                </div>

                <div className="space-y-2">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                    <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
                </div>

                <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
            </div>
        </div>
    </div>
)

const ActivitySkeleton = () => (
    <div className="space-y-4 min-h-[400px]">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
            </div>
        </div>

        <div className="space-y-3">
            {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border animate-pulse">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gray-200 rounded-full" />
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-32" />
                            <div className="h-3 bg-gray-200 rounded w-24" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-20" />
                        <div className="h-8 w-8 bg-gray-200 rounded" />
                    </div>
                </div>
            ))}
        </div>
    </div>
)

// Optimized loading screen component
const LoadingScreen = () => (
    <div className="min-h-screen bg-green-50/40 relative flex items-center justify-center">
        {/* Background gradient elements */}
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-green-100/30 to-teal-100/30 rounded-full blur-3xl -z-10 transform translate-x-1/4 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-green-100/30 to-teal-100/30 rounded-full blur-3xl -z-10 transform -translate-x-1/4 translate-y-1/4" />

        <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg">
                <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
            </div>
            <div className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-900">Loading Simple Savings</h2>
                <p className="text-gray-600">Initializing your wallet connection...</p>
            </div>
        </div>
    </div>
)

// Optimized connect screen component
const ConnectScreen = ({ onConnect }: { onConnect: () => void }) => {
    const { wallet } = useTranslations()

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
                        {wallet("connectWallet")} to access your vault dashboard and start managing your finances.
                    </p>
                    <Button
                        size="lg"
                        onClick={onConnect}
                        className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white shadow-md hover:shadow-lg transition-all animate-pulse"
                    >
                        {wallet("connectWallet")}
                    </Button>
                </div>
            </main>
        </div>
    )
}

export default function Dashboard() {
    const { user, login, ready } = usePrivy()
    const smartWalletAddress = user?.smartWallet?.address
    const { navigation } = useTranslations()

    // Show loading screen while Privy is initializing
    if (!ready) {
        return <LoadingScreen />
    }

    // Show connect screen if user is not authenticated
    if (!smartWalletAddress) {
        return <ConnectScreen onConnect={login} />
    }

    // Show dashboard when authenticated
    return (
        <div className="relative min-h-screen bg-green-50/40 pb-16 md:pb-0">
            {/* Background gradient elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-b from-green-300/15 to-teal-400/10 rounded-full filter blur-3xl -z-10 transform translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-t from-green-400/15 to-teal-300/10 rounded-full filter blur-3xl -z-10 transform -translate-x-1/3 translate-y-1/3" />

            {/* Reserve space for header to prevent layout shift */}
            <div className="h-16 md:h-20">
                <div className="hidden md:block">
                    <Header />
                </div>
            </div>

            <main className="container mx-auto p-4 md:p-6 lg:p-8 relative z-10">
                <header className="mb-8">
                    <div className="flex flex-col gap-1 mb-6">
                        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 text-transparent bg-clip-text">
                            {navigation("dashboard")}
                        </h1>
                        <p className="text-slate-500">Manage and track your token portfolio</p>
                    </div>
                </header>

                <div className="lg:col-span-2 flex flex-col gap-6">
                    <Suspense fallback={<TokenBalancesSkeleton />}>
                        <TokenBalances />
                    </Suspense>

                    {/* <MoneriumAuth /> */}

                    <ActivityProvider>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Suspense fallback={<SwapSkeleton />}>
                                <ZeroXSwap userAddress={smartWalletAddress as `0x${string}`} />
                            </Suspense>
                            <Suspense fallback={<SendSkeleton />}>
                                <Send />
                            </Suspense>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <Suspense fallback={<ActivitySkeleton />}>
                                <Activity />
                            </Suspense>
                        </div>
                    </ActivityProvider>
                </div>

            </main>
        </div>
    )
} 