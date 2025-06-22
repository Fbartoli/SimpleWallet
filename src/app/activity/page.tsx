"use client"

import { usePrivy } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"
import { Activity as ActivityIcon, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Activity } from "@/components/Activity"
import { useTranslations } from "@/hooks/useTranslations"
import Header from "@/components/Header"
import { ActivityProvider } from "@/contexts/ActivityContext"

export default function ActivityPage() {
    const { user, ready } = usePrivy()
    const router = useRouter()
    const { common, activity } = useTranslations()

    // Redirect to home if not authenticated
    if (ready && !user) {
        router.push("/")
        return null
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="hidden md:block">
                <Header />
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.back()}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            {common("back")}
                        </Button>
                    </div>

                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                            <ActivityIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {activity("recentActivity")}
                            </h1>
                            <p className="text-gray-600">
                                Track your transaction history and wallet activity
                            </p>
                        </div>
                    </div>
                </div>

                {/* Activity Component */}
                <ActivityProvider>
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                        <Activity />
                    </div>
                </ActivityProvider>
            </div>
        </div>
    )
} 