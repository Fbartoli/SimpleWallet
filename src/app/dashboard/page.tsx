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

// Component loading fallback
const ComponentLoader = ({ className = "" }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`}>
        <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
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

            {/* Hide header on mobile, show on md breakpoint and above */}
            <div className="hidden md:block">
                <Header />
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
                    <Suspense fallback={<ComponentLoader className="h-64" />}>
                        <TokenBalances />
                    </Suspense>

                    {/* <MoneriumAuth /> */}

                    <ActivityProvider>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Suspense fallback={<ComponentLoader className="h-96" />}>
                                <ZeroXSwap userAddress={smartWalletAddress as `0x${string}`} />
                            </Suspense>
                            <Suspense fallback={<ComponentLoader className="h-96" />}>
                                <Send />
                            </Suspense>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <Suspense fallback={<ComponentLoader className="h-64" />}>
                                <Activity />
                            </Suspense>
                        </div>
                    </ActivityProvider>
                </div>

            </main>
        </div>
    )
} 