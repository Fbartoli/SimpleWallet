import React from "react"
import { type FeatureFlag, isFeatureEnabled, useFeatureFlag } from "@/lib/feature-flags"

/**
 * Feature flag wrapper component for conditional rendering
 */
interface FeatureFlagProps {
    flag: FeatureFlag
    children: React.ReactNode
    fallback?: React.ReactNode
}

export function FeatureFlag({ flag, children, fallback = null }: FeatureFlagProps) {
    const isEnabled = useFeatureFlag(flag)

    if (isEnabled) {
        return <>{children}</>
    }

    return <>{fallback}</>
}

/**
 * Higher-order component for conditional rendering based on feature flags
 */
export function withFeatureFlag<P extends object>(
    Component: React.ComponentType<P>,
    flag: FeatureFlag,
    fallback?: React.ComponentType<P> | null
) {
    return function FeatureFlaggedComponent(props: P) {
        if (isFeatureEnabled(flag)) {
            return <Component {...props} />
        }

        if (fallback) {
            const FallbackComponent = fallback
            return <FallbackComponent {...props} />
        }

        return null
    }
}

/**
 * Development component to show feature flag states
 */
export function FeatureFlagDebugger() {
    if (process.env.NODE_ENV !== "development") {
        return null
    }

    const flags: FeatureFlag[] = [
        "monerium-auth",
        "morpho-earn",
        "zero-x-swap",
        "activity-tracking",
        "multi-language",
    ]

    return (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-xs z-50">
            <h3 className="text-sm font-semibold mb-2">🚩 Feature Flags</h3>
            <div className="space-y-1">
                {flags.map((flag) => {
                    const isEnabled = isFeatureEnabled(flag)
                    return (
                        <div key={flag} className="flex justify-between items-center text-xs">
                            <span className="text-gray-600">{flag}:</span>
                            <span className={`font-mono ${isEnabled ? "text-green-600" : "text-red-600"}`}>
                                {isEnabled ? "ON" : "OFF"}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
} 