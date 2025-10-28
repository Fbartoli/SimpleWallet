import { Loader2 } from "lucide-react"

export function LoadingScreen() {
    return (
        <div className="min-h-screen bg-green-50/40 relative flex items-center justify-center">
            {/* Background gradient elements */}
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-green-100/30 to-teal-100/30 rounded-full blur-3xl -z-10 transform translate-x-1/4 -translate-y-1/4" />
            <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-green-100/30 to-teal-100/30 rounded-full blur-3xl -z-10 transform -translate-x-1/4 translate-y-1/4" />

            <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg">
                    <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-gray-900">Loading Simple Wallet</h2>
                    <p className="text-gray-600">Initializing your wallet connection...</p>
                </div>
            </div>
        </div>
    )
}

