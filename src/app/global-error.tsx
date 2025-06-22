"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { logger } from "@/lib/logger"

interface GlobalErrorProps {
    error: Error & { digest?: string }
    reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
    useEffect(() => {
        // Log critical application error
        logger.error("Critical application error - global boundary triggered", {
            component: "global-error-boundary",
            metadata: {
                error: error.message,
                stack: error.stack,
                digest: error.digest,
                timestamp: new Date().toISOString(),
                userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "unknown",
                url: typeof window !== "undefined" ? window.location.href : "unknown",
                severity: "critical",
            },
        })

        // In production, you might want to send this to an external error reporting service
        if (process.env.NODE_ENV === "production") {
            // Example: Sentry, Bugsnag, etc.
            // errorReportingService.captureException(error, { extra: { digest: error.digest } })
        }
    }, [error])

    const handleReset = () => {
        logger.info("User attempted global error recovery", {
            component: "global-error-boundary",
            metadata: {
                errorMessage: error.message,
                digest: error.digest,
            },
        })
        reset()
    }

    const handleReload = () => {
        logger.info("User reloaded page from global error boundary", {
            component: "global-error-boundary",
        })
        window.location.reload()
    }

    return (
        <html>
            <body>
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4">
                    <div className="max-w-lg w-full bg-white rounded-lg shadow-xl p-8 text-center">
                        <div className="mb-8">
                            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                                <AlertTriangle className="h-10 w-10 text-red-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-3">
                                Critical Error
                            </h1>
                            <p className="text-gray-600">
                                We&apos;re experiencing a critical issue that prevents the application from running properly.
                                Our team has been automatically notified and is working on a fix.
                            </p>
                        </div>

                        {/* Error details in development */}
                        {process.env.NODE_ENV === "development" && (
                            <div className="mb-8 p-4 bg-red-50 rounded-lg text-left border border-red-200">
                                <h3 className="font-semibold text-red-900 mb-2">Development Error Details</h3>
                                <p className="text-sm text-red-800 font-mono break-all mb-2">
                                    {error.message}
                                </p>
                                {error.stack && (
                                    <details className="text-xs text-red-700">
                                        <summary className="cursor-pointer hover:text-red-900">Stack Trace</summary>
                                        <pre className="mt-2 whitespace-pre-wrap">{error.stack}</pre>
                                    </details>
                                )}
                                {error.digest && (
                                    <p className="text-xs text-red-600 mt-2">
                                        Error Digest: {error.digest}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="space-y-4">
                            <button
                                onClick={handleReset}
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Try Again
                            </button>

                            <button
                                onClick={handleReload}
                                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                            >
                                Reload Application
                            </button>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <p className="text-sm text-gray-500">
                                Error ID: <span className="font-mono">{error.digest || "N/A"}</span>
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                                Please include this Error ID when contacting support
                            </p>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    )
} 