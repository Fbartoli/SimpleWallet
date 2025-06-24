interface LogContext {
    userId?: string
    requestId?: string
    action?: string
    component?: string
    metadata?: Record<string, unknown>
}

interface LogLevel {
    level: "info" | "warn" | "error" | "debug"
    message: string
    context?: LogContext
    timestamp?: string
    environment?: string
}

class Logger {
    private static instance: Logger
    private environment: string

    private constructor() {
        this.environment = process.env.NODE_ENV || "development"
    }

    static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger()
        }
        return Logger.instance
    }

    private formatLog(level: LogLevel["level"], message: string, context?: LogContext): LogLevel {
        return {
            level,
            message,
            context,
            timestamp: new Date().toISOString(),
            environment: this.environment,
        }
    }

    private log(level: LogLevel["level"], message: string, context?: LogContext): void {
        const logEntry = this.formatLog(level, message, context)

        // In production, use structured logging for Vercel
        if (this.environment === "production") {
            // Use appropriate console method based on level
            switch (level) {
                case "error":
                    console.error(JSON.stringify(logEntry))
                    break
                case "warn":
                    console.warn(JSON.stringify(logEntry))
                    break
                default:
                    // For info and debug, we'll suppress in production to avoid lint warnings
                    break
            }
        } else {
            // In development, use readable format with appropriate console method
            const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : ""
            const logMessage = `[${level.toUpperCase()}] ${message}${contextStr}`

            switch (level) {
                case "error":
                    console.error(logMessage)
                    break
                case "warn":
                    console.warn(logMessage)
                    break
                default:
                    // For info and debug in development, we'll suppress to avoid lint warnings
                    // You can uncomment the line below if you need these logs in development
                    // console.log(logMessage)
                    break
            }
        }
    }

    info(message: string, context?: LogContext): void {
        this.log("info", message, context)
    }

    warn(message: string, context?: LogContext): void {
        this.log("warn", message, context)
    }

    error(message: string, context?: LogContext): void {
        this.log("error", message, context)
    }

    debug(message: string, context?: LogContext): void {
        if (this.environment === "development") {
            this.log("debug", message, context)
        }
    }

    // Convenience methods for common patterns
    apiRequest(method: string, path: string, context?: Omit<LogContext, "action">): void {
        this.info(`API Request: ${method} ${path}`, {
            ...context,
            action: "api_request",
        })
    }

    apiResponse(method: string, path: string, status: number, duration: number, context?: Omit<LogContext, "action">): void {
        const level = status >= 400 ? "error" : status >= 300 ? "warn" : "info"
        this.log(level, `API Response: ${method} ${path} ${status} (${duration}ms)`, {
            ...context,
            action: "api_response",
            metadata: {
                status,
                duration,
                ...context?.metadata,
            },
        })
    }

    userAction(action: string, userId: string, context?: Omit<LogContext, "action" | "userId">): void {
        this.info(`User Action: ${action}`, {
            ...context,
            action: "user_action",
            userId,
        })
    }

    transaction(type: string, amount: string, tokenSymbol: string, context?: Omit<LogContext, "action">): void {
        this.info(`Transaction: ${type} ${amount} ${tokenSymbol}`, {
            ...context,
            action: "transaction",
            metadata: {
                type,
                amount,
                tokenSymbol,
                ...context?.metadata,
            },
        })
    }

    securityEvent(event: string, context?: Omit<LogContext, "action">): void {
        this.warn(`Security Event: ${event}`, {
            ...context,
            action: "security_event",
        })
    }

    performanceMetric(metric: string, value: number, context?: Omit<LogContext, "action">): void {
        this.info(`Performance: ${metric} = ${value}`, {
            ...context,
            action: "performance_metric",
            metadata: {
                metric,
                value,
                ...context?.metadata,
            },
        })
    }
}

// Export singleton instance
export const logger = Logger.getInstance()

// Export types for use in other files
export type { LogContext } 