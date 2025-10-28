import Header from "@/components/Header"
import { Button } from "@/components/ui/button"
import { useTranslations } from "@/hooks/useTranslations"
import { FeatureFlagDebugger } from "@/components/FeatureFlag"

interface ConnectScreenProps {
    onConnect: () => void
}

export function ConnectScreen({ onConnect }: ConnectScreenProps) {
    const { wallet } = useTranslations()

    return (
        <div className="min-h-screen bg-green-50/40 relative">
            {/* Background gradient elements */}
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-green-100/30 to-teal-100/30 rounded-full blur-3xl -z-10 transform translate-x-1/4 -translate-y-1/4" />
            <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-green-100/30 to-teal-100/30 rounded-full blur-3xl -z-10 transform -translate-x-1/4 translate-y-1/4" />

            <Header />
            <main className="container mx-auto px-4 py-16">
                <div className="max-w-md mx-auto text-center space-y-6">
                    <h1 className="text-3xl font-bold tracking-tight">Welcome to Simple Wallet</h1>
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

            {/* Development feature flag debugger */}
            <FeatureFlagDebugger />
        </div>
    )
}

