"use client"

import { useEffect } from "react"
import { AlertTriangle, Home, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { logger } from "@/lib/logger"

interface ErrorProps {
    error: Error & { digest?: string }
    reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
    useEffect(() => {
        // Log the error with context
        logger.error("Application error boundary triggered", {
            component: "app-error-boundary",
            metadata: {
                error: error.message,
                stack: error.stack,
                digest: error.digest,
                timestamp: new Date().toISOString(),
                userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "unknown",
                url: typeof window !== "undefined" ? window.location.href : "unknown",
            },
        })
    }, [error])

    const handleReset = () => {
        logger.info("User attempted error recovery", {
            component: "app-error-boundary",
            metadata: {
                errorMessage: error.message,
                digest: error.digest,
            },
        })
        reset()
    }

    const handleGoHome = () => {
        logger.info("User navigated home from error boundary", {
            component: "app-error-boundary",
        })
        window.location.href = "/"
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="mb-6">
                    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>
                    <h1 className="text-xl font-semibold text-gray-900 mb-2">
                        Oops! Something went wrong
                    </h1>
                    <p className="text-gray-600 text-sm">
                        We encountered an unexpected error. This has been automatically reported to our team.
                    </p>
                </div>

                {/* Error details (only in development) */}
                {process.env.NODE_ENV === "development" && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg text-left">
                        <h3 className="font-medium text-gray-900 mb-2 text-sm">Error Details (Development Only)</h3>
                        <p className="text-xs text-gray-600 font-mono break-all">
                            {error.message}
                        </p>
                        {error.digest && (
                            <p className="text-xs text-gray-500 mt-1">
                                Error ID: {error.digest}
                            </p>
                        )}
                    </div>
                )}

                <div className="space-y-3">
                    <Button
                        onClick={handleReset}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Try Again
                    </Button>

                    <Button
                        onClick={handleGoHome}
                        variant="outline"
                        className="w-full"
                    >
                        <Home className="h-4 w-4 mr-2" />
                        Go to Homepage
                    </Button>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                        If this problem persists, please contact support with Error ID: {error.digest || "N/A"}
                    </p>
                </div>
            </div>
        </div>
    )
} 