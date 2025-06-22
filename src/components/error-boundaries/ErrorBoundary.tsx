"use client"

import React, { Component, ReactNode } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { logger } from "@/lib/logger"

interface ErrorBoundaryProps {
    children: ReactNode
    fallback?: (error: Error, resetError: () => void) => ReactNode
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void
    level?: "component" | "page" | "feature"
    name?: string
}

interface ErrorBoundaryState {
    hasError: boolean
    error: Error | null
    errorInfo: React.ErrorInfo | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        }
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return {
            hasError: true,
            error,
        }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        this.setState({
            error,
            errorInfo,
        })

        // Log the error
        logger.error(`Error boundary caught error in ${this.props.name || "component"}`, {
            component: `error-boundary-${this.props.level || "component"}`,
            metadata: {
                error: error.message,
                stack: error.stack,
                componentStack: errorInfo.componentStack,
                name: this.props.name,
                level: this.props.level,
                timestamp: new Date().toISOString(),
            },
        })

        // Call custom error handler if provided
        if (this.props.onError) {
            this.props.onError(error, errorInfo)
        }
    }

    resetError = () => {
        logger.info(`Error boundary reset for ${this.props.name || "component"}`, {
            component: `error-boundary-${this.props.level || "component"}`,
            metadata: {
                name: this.props.name,
                level: this.props.level,
            },
        })

        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        })
    }

    render() {
        if (this.state.hasError && this.state.error) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback(this.state.error, this.resetError)
            }

            // Default fallback UI
            return <DefaultErrorFallback
                error={this.state.error}
                errorInfo={this.state.errorInfo}
                resetError={this.resetError}
                level={this.props.level}
                name={this.props.name}
            />
        }

        return this.props.children
    }
}

interface DefaultErrorFallbackProps {
    error: Error
    errorInfo: React.ErrorInfo | null
    resetError: () => void
    level?: "component" | "page" | "feature"
    name?: string
}

function DefaultErrorFallback({
    error,
    errorInfo,
    resetError,
    level = "component",
    name,
}: DefaultErrorFallbackProps) {
    const isComponentLevel = level === "component"

    if (isComponentLevel) {
        // Minimal inline error for components
        return (
            <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm font-medium">
                            {name ? `${name} Error` : "Component Error"}
                        </p>
                        <p className="text-xs text-red-600 mt-1">
                            Something went wrong loading this section
                        </p>
                    </div>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={resetError}
                        className="text-red-700 border-red-300 hover:bg-red-100"
                    >
                        <RefreshCw className="h-3 w-3" />
                    </Button>
                </div>

                {/* Show error details in development */}
                {process.env.NODE_ENV === "development" && (
                    <details className="mt-3 text-xs">
                        <summary className="cursor-pointer text-red-600 hover:text-red-800">
                            Error Details (Development)
                        </summary>
                        <div className="mt-2 p-2 bg-red-100 rounded border font-mono text-red-800">
                            <p className="break-all">{error.message}</p>
                            {errorInfo?.componentStack && (
                                <pre className="mt-1 text-xs overflow-auto">
                                    {errorInfo.componentStack}
                                </pre>
                            )}
                        </div>
                    </details>
                )}
            </div>
        )
    }

    // Full page error for page/feature level
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>

            <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {name ? `${name} Error` : `${level} Error`}
            </h2>

            <p className="text-gray-600 mb-6 max-w-md">
                We encountered an error while loading this {level}. Please try again or contact support if the problem persists.
            </p>

            {/* Error details in development */}
            {process.env.NODE_ENV === "development" && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg text-left max-w-lg w-full">
                    <h3 className="font-medium text-gray-900 mb-2 text-sm">
                        Development Error Details
                    </h3>
                    <p className="text-xs text-gray-600 font-mono break-all mb-2">
                        {error.message}
                    </p>
                    {errorInfo?.componentStack && (
                        <details className="text-xs text-gray-500">
                            <summary className="cursor-pointer">Component Stack</summary>
                            <pre className="mt-1 whitespace-pre-wrap">
                                {errorInfo.componentStack}
                            </pre>
                        </details>
                    )}
                </div>
            )}

            <Button onClick={resetError} className="bg-blue-600 hover:bg-blue-700">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
            </Button>
        </div>
    )
} 