"use client"

import { ReactNode, useEffect, useState } from "react"
import { ErrorBoundary } from "./ErrorBoundary"
import { logger } from "@/lib/logger"

interface AsyncErrorBoundaryProps {
    children: ReactNode
    fallback?: (error: Error, resetError: () => void) => ReactNode
    onError?: (error: Error) => void
    name?: string
}

/**
 * Enhanced error boundary that also catches async errors and unhandled promise rejections
 */
export function AsyncErrorBoundary({
    children,
    fallback,
    onError,
    name = "AsyncComponent",
}: AsyncErrorBoundaryProps) {
    const [asyncError, setAsyncError] = useState<Error | null>(null)

    useEffect(() => {
        // Handle unhandled promise rejections
        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            const error = event.reason instanceof Error
                ? event.reason
                : new Error(String(event.reason))

            logger.error("Unhandled promise rejection caught by AsyncErrorBoundary", {
                component: "async-error-boundary",
                metadata: {
                    error: error.message,
                    stack: error.stack,
                    name,
                    reason: event.reason,
                    timestamp: new Date().toISOString(),
                },
            })

            setAsyncError(error)
            onError?.(error)

            // Prevent the default unhandled rejection behavior
            event.preventDefault()
        }

        // Handle general errors that might not be caught by React error boundaries
        const handleError = (event: ErrorEvent) => {
            const error = event.error instanceof Error
                ? event.error
                : new Error(event.message)

            logger.error("Unhandled error caught by AsyncErrorBoundary", {
                component: "async-error-boundary",
                metadata: {
                    error: error.message,
                    stack: error.stack,
                    name,
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno,
                    timestamp: new Date().toISOString(),
                },
            })

            setAsyncError(error)
            onError?.(error)
        }

        // Add event listeners
        window.addEventListener("unhandledrejection", handleUnhandledRejection)
        window.addEventListener("error", handleError)

        // Cleanup
        return () => {
            window.removeEventListener("unhandledrejection", handleUnhandledRejection)
            window.removeEventListener("error", handleError)
        }
    }, [name, onError])

    const resetAsyncError = () => {
        logger.info("AsyncErrorBoundary reset", {
            component: "async-error-boundary",
            metadata: { name },
        })
        setAsyncError(null)
    }

    // If we have an async error, show the fallback
    if (asyncError) {
        if (fallback) {
            return fallback(asyncError, resetAsyncError)
        }

        // Default async error fallback
        return (
            <div className="p-6 border border-red-200 bg-red-50 rounded-lg">
                <div className="text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-red-900 mb-2">
                        Async Operation Failed
                    </h3>
                    <p className="text-red-700 mb-4">
                        An asynchronous operation in {name} failed unexpectedly.
                    </p>

                    {process.env.NODE_ENV === "development" && (
                        <div className="mb-4 p-3 bg-red-100 rounded text-left">
                            <p className="text-sm font-mono text-red-800 break-all">
                                {asyncError.message}
                            </p>
                        </div>
                    )}

                    <button
                        onClick={resetAsyncError}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    // Wrap in regular error boundary for sync errors
    return (
        <ErrorBoundary
            level="component"
            name={name}
            fallback={fallback}
            onError={(error, errorInfo) => {
                logger.error("Sync error in AsyncErrorBoundary", {
                    component: "async-error-boundary",
                    metadata: {
                        error: error.message,
                        stack: error.stack,
                        componentStack: errorInfo.componentStack,
                        name,
                    },
                })
                onError?.(error)
            }}
        >
            {children}
        </ErrorBoundary>
    )
}

/**
 * Hook to manually trigger error boundary
 */
export function useErrorBoundary() {
    const [_error, setError] = useState<Error | null>(null)

    const captureError = (error: Error | string) => {
        const errorObj = error instanceof Error ? error : new Error(error)
        setError(errorObj)
        throw errorObj
    }

    const resetError = () => setError(null)

    return { captureError, resetError }
} 