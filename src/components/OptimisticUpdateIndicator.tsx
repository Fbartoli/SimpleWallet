'use client'

import { memo } from 'react'
import { RefreshCw } from 'lucide-react'

interface OptimisticUpdateIndicatorProps {
    isActive: boolean
    message?: string
    compact?: boolean
}

export const OptimisticUpdateIndicator = memo(function OptimisticUpdateIndicator({
    isActive,
    message = "Transaction pending - updating...",
    compact = false
}: OptimisticUpdateIndicatorProps) {
    if (!isActive) return null

    if (compact) {
        return (
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span>Updating...</span>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-800 rounded-lg border border-blue-200">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm font-medium">{message}</span>
        </div>
    )
}) 