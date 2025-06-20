'use client'

import { createContext, useContext, useCallback, useState } from 'react'

interface ActivityContextType {
    refreshActivity: () => void
    registerRefreshFunction: (fn: () => void) => void
    isRefreshing: boolean
}

const ActivityContext = createContext<ActivityContextType | null>(null)

export function ActivityProvider({ children }: { children: React.ReactNode }) {
    const [refreshFunctions, setRefreshFunctions] = useState<(() => void)[]>([])
    const [isRefreshing, setIsRefreshing] = useState(false)

    const registerRefreshFunction = useCallback((fn: () => void) => {
        setRefreshFunctions(prev => [...prev, fn])

        // Return cleanup function
        return () => {
            setRefreshFunctions(prev => prev.filter(f => f !== fn))
        }
    }, [])

    const refreshActivity = useCallback(async () => {
        if (refreshFunctions.length === 0) return

        setIsRefreshing(true)

        try {
            // Call all registered refresh functions
            await Promise.all(refreshFunctions.map(fn => {
                try {
                    const result = fn()
                    // Handle both sync and async functions
                    return Promise.resolve(result)
                } catch (error) {
                    console.error('Error refreshing activity:', error)
                    return Promise.resolve()
                }
            }))
        } catch (error) {
            console.error('Error refreshing activity:', error)
        } finally {
            setIsRefreshing(false)
        }
    }, [refreshFunctions])

    return (
        <ActivityContext.Provider
            value={{
                refreshActivity,
                registerRefreshFunction,
                isRefreshing
            }}
        >
            {children}
        </ActivityContext.Provider>
    )
}

export function useActivityRefresh() {
    const context = useContext(ActivityContext)
    if (!context) {
        throw new Error('useActivityRefresh must be used within an ActivityProvider')
    }
    return context
} 