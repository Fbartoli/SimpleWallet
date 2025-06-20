/**
 * Environment Security Configuration
 * Provides secure handling of environment variables and deployment security
 */

export class EnvironmentSecurity {

    /**
     * Validates that all required environment variables are present
     */
    static validateEnvironment(): { isValid: boolean; missingVars: string[] } {
        const requiredVars = [
            'NEXT_PUBLIC_APP_ID',
            'NEXT_PUBLIC_CLIENT_ID',
            'DUNE_API_KEY'
        ]

        const missingVars = requiredVars.filter(varName => !process.env[varName])

        return {
            isValid: missingVars.length === 0,
            missingVars
        }
    }

    /**
     * Sanitizes environment variables to prevent injection
     */
    static sanitizeEnvVar(value: string | undefined): string {
        if (!value) return ''

        // Remove any potentially dangerous characters
        return value
            .replace(/[<>'"]/g, '')
            .replace(/javascript:/gi, '')
            .replace(/data:/gi, '')
            .trim()
    }

    /**
     * Checks if the application is running in a secure environment
     */
    static isSecureEnvironment(): boolean {
        const isDevelopment = process.env.NODE_ENV === 'development'
        const hasHttps = typeof window !== 'undefined' && window.location.protocol === 'https:'
        const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost'

        // Allow HTTP in development and localhost
        if (isDevelopment || isLocalhost) {
            return true
        }

        // Require HTTPS in production
        return hasHttps
    }

    /**
     * Content Security Policy headers configuration
     */
    static getCSPHeaders(): Record<string, string> {
        return {
            'Content-Security-Policy': [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Note: unsafe-eval needed for some crypto libraries
                "style-src 'self' 'unsafe-inline'",
                "img-src 'self' data: https:",
                "font-src 'self'",
                "connect-src 'self' https://*.dune.com https://*.privy.io https://*.base.org https://*.tenderly.co wss:",
                "frame-src 'none'",
                "object-src 'none'",
                "base-uri 'self'",
                "form-action 'self'"
            ].join('; '),
            'X-Frame-Options': 'DENY',
            'X-Content-Type-Options': 'nosniff',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
        }
    }

    /**
     * Rate limiting configuration
     */
    static getRateLimits(): Record<string, { requests: number; windowMs: number }> {
        return {
            'api-calls': { requests: 100, windowMs: 60000 }, // 100 requests per minute
            'transactions': { requests: 10, windowMs: 60000 }, // 10 transactions per minute
            'login-attempts': { requests: 5, windowMs: 300000 }, // 5 login attempts per 5 minutes
        }
    }

    /**
     * Checks for common security misconfigurations
     */
    static auditSecurityConfiguration(): {
        passed: string[]
        warnings: string[]
        critical: string[]
    } {
        const audit = {
            passed: [] as string[],
            warnings: [] as string[],
            critical: [] as string[]
        }

        // Check HTTPS
        if (this.isSecureEnvironment()) {
            audit.passed.push('✓ Secure connection (HTTPS)')
        } else {
            audit.critical.push('✗ Insecure connection (HTTP) in production')
        }

        // Check environment variables
        const envCheck = this.validateEnvironment()
        if (envCheck.isValid) {
            audit.passed.push('✓ All required environment variables present')
        } else {
            audit.critical.push(`✗ Missing environment variables: ${envCheck.missingVars.join(', ')}`)
        }

        // Check for development settings in production
        if (process.env.NODE_ENV === 'production') {
            if (process.env.NEXT_PUBLIC_APP_ID?.includes('dev') ||
                process.env.NEXT_PUBLIC_APP_ID?.includes('test')) {
                audit.warnings.push('⚠ Using development API keys in production')
            } else {
                audit.passed.push('✓ Production API keys configured')
            }
        }

        // Check for debug mode
        if (process.env.NODE_ENV !== 'production') {
            audit.warnings.push('⚠ Running in development mode')
        } else {
            audit.passed.push('✓ Running in production mode')
        }

        return audit
    }

    /**
     * Secure API key management
     */
    static getSecureApiKey(keyName: string): string | null {
        const key = process.env[keyName]

        if (!key) {
            console.error(`Missing API key: ${keyName}`)
            return null
        }

        // Validate key format
        if (keyName === 'DUNE_API_KEY' && !key.startsWith('dune_')) {
            console.warn('DUNE_API_KEY does not match expected format')
        }

        return this.sanitizeEnvVar(key)
    }

    /**
     * Network security validation
     */
    static validateNetworkSecurity(): {
        isSecure: boolean
        issues: string[]
        recommendations: string[]
    } {
        const issues: string[] = []
        const recommendations: string[] = []

        // Check for mixed content
        if (typeof window !== 'undefined') {
            const isHttps = window.location.protocol === 'https:'
            const hasInsecureContent = document.querySelectorAll('img[src^="http:"], script[src^="http:"]').length > 0

            if (isHttps && hasInsecureContent) {
                issues.push('Mixed content detected (HTTPS page loading HTTP resources)')
                recommendations.push('Ensure all resources use HTTPS')
            }
        }

        // Check RPC endpoint security
        const rpcEndpoint = 'https://base.gateway.tenderly.co/28rOk2uI3CVMnyinm9c3yn'
        if (!rpcEndpoint.startsWith('https://')) {
            issues.push('Insecure RPC endpoint')
            recommendations.push('Use HTTPS RPC endpoints only')
        }

        return {
            isSecure: issues.length === 0,
            issues,
            recommendations
        }
    }

    /**
     * Dependency security check (basic)
     */
    static checkDependencySecurity(): {
        recommendations: string[]
    } {
        return {
            recommendations: [
                'Regularly update dependencies with `pnpm update`',
                'Run `pnpm audit` to check for vulnerabilities',
                'Pin dependency versions in package.json',
                'Use `pnpm audit --fix` to automatically fix issues',
                'Monitor for security advisories on critical packages',
                'Consider using automated dependency monitoring tools'
            ]
        }
    }

    /**
     * User session security
     */
    static getSessionSecurityConfig(): {
        maxAge: number
        sameSite: 'strict' | 'lax' | 'none'
        secure: boolean
        httpOnly: boolean
    } {
        return {
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            sameSite: 'strict',
            secure: this.isSecureEnvironment(),
            httpOnly: true
        }
    }

    /**
     * Generate security report
     */
    static generateSecurityReport(): {
        timestamp: string
        environment: string
        audit: ReturnType<typeof EnvironmentSecurity.auditSecurityConfiguration>
        network: ReturnType<typeof EnvironmentSecurity.validateNetworkSecurity>
        dependencies: ReturnType<typeof EnvironmentSecurity.checkDependencySecurity>
        overallScore: number
    } {
        const audit = this.auditSecurityConfiguration()
        const network = this.validateNetworkSecurity()
        const dependencies = this.checkDependencySecurity()

        // Calculate overall security score
        const totalChecks = audit.passed.length + audit.warnings.length + audit.critical.length
        const score = totalChecks > 0
            ? Math.round(((audit.passed.length + audit.warnings.length * 0.5) / totalChecks) * 100)
            : 0

        return {
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'unknown',
            audit,
            network,
            dependencies,
            overallScore: network.isSecure ? score : Math.max(0, score - 30)
        }
    }
} 