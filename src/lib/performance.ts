import { logger } from "./logger"

interface PerformanceMetrics {
    name: string
    duration: number
    timestamp: number
    metadata?: Record<string, unknown>
}

// Interface for Vercel Analytics window extension
interface VercelWebVitals {
    reportCustomMetric: (metric: {
        name: string
        value: number
        label: string
        [key: string]: unknown
    }) => void
}

declare global {
    interface Window {
        webVitals?: VercelWebVitals
    }
}

class PerformanceMonitor {
    private static instance: PerformanceMonitor
    private measurements = new Map<string, number>()

    private constructor() { }

    static getInstance(): PerformanceMonitor {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor()
        }
        return PerformanceMonitor.instance
    }

    /**
     * Start measuring performance for a given operation
     */
    start(operationName: string): void {
        this.measurements.set(operationName, performance.now())
    }

    /**
     * End measurement and log the results
     */
    end(operationName: string, metadata?: Record<string, unknown>): number {
        const startTime = this.measurements.get(operationName)
        if (!startTime) {
            logger.warn("Performance measurement not found", {
                component: "performance-monitor",
                metadata: { operationName },
            })
            return 0
        }

        const duration = performance.now() - startTime
        this.measurements.delete(operationName)

        const metrics: PerformanceMetrics = {
            name: operationName,
            duration,
            timestamp: Date.now(),
            metadata,
        }

        // Log performance metrics
        logger.performanceMetric(operationName, duration, {
            metadata: {
                ...metadata,
                timestamp: metrics.timestamp,
            },
        })

        // Report to Vercel Analytics in production
        if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
            this.reportToVercel(metrics)
        }

        return duration
    }

    /**
     * Measure an async operation
     */
    async measure<T>(
        operationName: string,
        operation: () => Promise<T>,
        metadata?: Record<string, unknown>
    ): Promise<T> {
        this.start(operationName)
        try {
            const result = await operation()
            this.end(operationName, { ...metadata, success: true })
            return result
        } catch (error) {
            this.end(operationName, {
                ...metadata,
                success: false,
                error: error instanceof Error ? error.message : String(error),
            })
            throw error
        }
    }

    /**
     * Measure a synchronous operation
     */
    measureSync<T>(
        operationName: string,
        operation: () => T,
        metadata?: Record<string, unknown>
    ): T {
        this.start(operationName)
        try {
            const result = operation()
            this.end(operationName, { ...metadata, success: true })
            return result
        } catch (error) {
            this.end(operationName, {
                ...metadata,
                success: false,
                error: error instanceof Error ? error.message : String(error),
            })
            throw error
        }
    }

    /**
     * Report performance metrics to Vercel Analytics
     */
    private reportToVercel(metrics: PerformanceMetrics): void {
        // Report to Vercel Speed Insights if available
        if (typeof window !== "undefined" && window.webVitals) {
            // This integrates with Vercel's Speed Insights
            try {
                window.webVitals.reportCustomMetric({
                    name: metrics.name,
                    value: metrics.duration,
                    label: "custom",
                    ...metrics.metadata,
                })
            } catch (error) {
                logger.debug("Failed to report to Vercel Analytics", {
                    component: "performance-monitor",
                    metadata: { error: String(error) },
                })
            }
        }
    }

    /**
     * Track Web Vitals manually if needed
     */
    trackWebVital(name: string, value: number, label?: string): void {
        logger.performanceMetric(`webvital-${name}`, value, {
            metadata: { label, type: "web-vital" },
        })

        if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
            this.reportToVercel({
                name: `webvital-${name}`,
                duration: value,
                timestamp: Date.now(),
                metadata: { label, type: "web-vital" },
            })
        }
    }

    /**
     * Track component render performance
     */
    trackComponentRender(componentName: string, renderTime: number): void {
        logger.performanceMetric(`component-render-${componentName}`, renderTime, {
            component: "performance-monitor",
            metadata: { type: "component-render" },
        })
    }

    /**
     * Track API response times
     */
    trackApiCall(endpoint: string, duration: number, status: number): void {
        logger.performanceMetric(`api-call-${endpoint}`, duration, {
            component: "performance-monitor",
            metadata: {
                type: "api-call",
                endpoint,
                status,
                success: status >= 200 && status < 400,
            },
        })
    }

    /**
     * Track bundle loading performance
     */
    trackBundleLoad(bundleName: string, loadTime: number): void {
        logger.performanceMetric(`bundle-load-${bundleName}`, loadTime, {
            component: "performance-monitor",
            metadata: { type: "bundle-load" },
        })
    }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance()

// Convenience functions
export const startPerformanceMeasurement = (operationName: string) =>
    performanceMonitor.start(operationName)

export const endPerformanceMeasurement = (operationName: string, metadata?: Record<string, unknown>) =>
    performanceMonitor.end(operationName, metadata)

export const measureAsync = <T>(
    operationName: string,
    operation: () => Promise<T>,
    metadata?: Record<string, unknown>
) => performanceMonitor.measure(operationName, operation, metadata)

export const measureSync = <T>(
    operationName: string,
    operation: () => T,
    metadata?: Record<string, unknown>
) => performanceMonitor.measureSync(operationName, operation, metadata) 