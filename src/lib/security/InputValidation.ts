import DOMPurify from 'isomorphic-dompurify'

export interface ValidationResult {
    isValid: boolean
    errors: string[]
    sanitizedValue?: string
}

export class InputValidation {

    /**
     * Sanitizes user input to prevent XSS attacks
     */
    static sanitizeInput(input: string): string {
        if (typeof input !== 'string') {
            return ''
        }

        // Remove any HTML tags and scripts
        const sanitized = DOMPurify.sanitize(input, {
            ALLOWED_TAGS: [], // No HTML tags allowed
            ALLOWED_ATTR: []  // No attributes allowed
        })

        // Additional sanitization for potential injection attempts
        return sanitized
            .replace(/[<>'"]/g, '') // Remove dangerous characters
            .trim()
    }

    /**
     * Validates and sanitizes a cryptocurrency amount
     */
    static validateAmount(amount: string): ValidationResult {
        const result: ValidationResult = {
            isValid: true,
            errors: []
        }

        // Sanitize input first
        const sanitized = this.sanitizeInput(amount)
        result.sanitizedValue = sanitized

        // Check if empty
        if (!sanitized || sanitized.length === 0) {
            result.errors.push('Amount is required')
            result.isValid = false
            return result
        }

        // Check for valid number format
        const numberRegex = /^\d+(\.\d+)?$/
        if (!numberRegex.test(sanitized)) {
            result.errors.push('Amount must be a valid number')
            result.isValid = false
            return result
        }

        const numValue = parseFloat(sanitized)

        // Check for positive value
        if (numValue <= 0) {
            result.errors.push('Amount must be greater than zero')
            result.isValid = false
        }

        // Check for reasonable precision (max 18 decimals)
        const decimalPlaces = (sanitized.split('.')[1] || '').length
        if (decimalPlaces > 18) {
            result.errors.push('Too many decimal places (max 18)')
            result.isValid = false
        }

        // Check for reasonable size
        if (numValue > 1e18) {
            result.errors.push('Amount too large')
            result.isValid = false
        }

        return result
    }

    /**
     * Validates an Ethereum address format
     */
    static validateAddressFormat(address: string): ValidationResult {
        const result: ValidationResult = {
            isValid: true,
            errors: []
        }

        // Sanitize input
        const sanitized = this.sanitizeInput(address)
        result.sanitizedValue = sanitized

        // Check if empty
        if (!sanitized || sanitized.length === 0) {
            result.errors.push('Address is required')
            result.isValid = false
            return result
        }

        // Check basic format
        const addressRegex = /^0x[a-fA-F0-9]{40}$/
        if (!addressRegex.test(sanitized)) {
            result.errors.push('Invalid Ethereum address format')
            result.isValid = false
        }

        // Normalize to lowercase for consistency
        result.sanitizedValue = sanitized.toLowerCase()

        return result
    }

    /**
     * Validates a token symbol
     */
    static validateTokenSymbol(symbol: string, allowedTokens: string[]): ValidationResult {
        const result: ValidationResult = {
            isValid: true,
            errors: []
        }

        // Sanitize input
        const sanitized = this.sanitizeInput(symbol).toUpperCase()
        result.sanitizedValue = sanitized

        // Check if empty
        if (!sanitized || sanitized.length === 0) {
            result.errors.push('Token symbol is required')
            result.isValid = false
            return result
        }

        // Check if allowed
        if (!allowedTokens.includes(sanitized)) {
            result.errors.push('Token not supported')
            result.isValid = false
        }

        return result
    }

    /**
     * Validates numeric input with custom constraints
     */
    static validateNumeric(
        value: string,
        options: {
            min?: number
            max?: number
            decimals?: number
            required?: boolean
        } = {}
    ): ValidationResult {
        const { min, max, decimals, required = true } = options

        const result: ValidationResult = {
            isValid: true,
            errors: []
        }

        // Sanitize input
        const sanitized = this.sanitizeInput(value)
        result.sanitizedValue = sanitized

        // Check required
        if (required && (!sanitized || sanitized.length === 0)) {
            result.errors.push('Value is required')
            result.isValid = false
            return result
        }

        if (!sanitized) {
            return result // Optional and empty is valid
        }

        // Validate numeric format
        const numValue = parseFloat(sanitized)
        if (isNaN(numValue)) {
            result.errors.push('Must be a valid number')
            result.isValid = false
            return result
        }

        // Check min/max
        if (min !== undefined && numValue < min) {
            result.errors.push(`Value must be at least ${min}`)
            result.isValid = false
        }

        if (max !== undefined && numValue > max) {
            result.errors.push(`Value must be at most ${max}`)
            result.isValid = false
        }

        // Check decimal places
        if (decimals !== undefined) {
            const decimalCount = (sanitized.split('.')[1] || '').length
            if (decimalCount > decimals) {
                result.errors.push(`Maximum ${decimals} decimal places allowed`)
                result.isValid = false
            }
        }

        return result
    }

    /**
     * Rate limiting check for API calls
     */
    static checkRateLimit(
        key: string,
        maxRequests: number,
        windowMs: number
    ): { allowed: boolean; remaining: number; resetTime: number } {
        const now = Date.now()
        const windowKey = `${key}_${Math.floor(now / windowMs)}`

        // Get current count from localStorage (in production, use Redis or similar)
        const stored = localStorage.getItem(windowKey)
        const currentCount = stored ? parseInt(stored) : 0

        if (currentCount >= maxRequests) {
            return {
                allowed: false,
                remaining: 0,
                resetTime: Math.ceil(now / windowMs) * windowMs
            }
        }

        // Increment counter
        localStorage.setItem(windowKey, (currentCount + 1).toString())

        // Clean up old entries
        this.cleanupRateLimitStorage(windowMs)

        return {
            allowed: true,
            remaining: maxRequests - currentCount - 1,
            resetTime: Math.ceil(now / windowMs) * windowMs
        }
    }

    /**
     * Cleans up old rate limit entries from localStorage
     */
    private static cleanupRateLimitStorage(windowMs: number): void {
        const now = Date.now()
        const cutoff = now - windowMs * 2 // Keep data for 2 windows

        Object.keys(localStorage).forEach(key => {
            if (key.includes('_')) {
                const timestamp = parseInt(key.split('_').pop() || '0') * windowMs
                if (timestamp < cutoff) {
                    localStorage.removeItem(key)
                }
            }
        })
    }

    /**
     * Validates form data comprehensively
     */
    static validateFormData(data: Record<string, unknown>): ValidationResult {
        const result: ValidationResult = {
            isValid: true,
            errors: []
        }

        // Check for potential injection patterns
        const dangerousPatterns = [
            /<script/i,
            /javascript:/i,
            /on\w+\s*=/i,
            /data:text\/html/i,
            /vbscript:/i
        ]

        Object.entries(data).forEach(([key, value]) => {
            if (typeof value === 'string') {
                dangerousPatterns.forEach(pattern => {
                    if (pattern.test(value)) {
                        result.errors.push(`Potentially dangerous content detected in ${key}`)
                        result.isValid = false
                    }
                })
            }
        })

        return result
    }

    /**
     * Validates transaction timing to prevent replay attacks
     */
    static validateTransactionTiming(
        timestamp: number,
        maxAgeMs: number = 300000 // 5 minutes default
    ): ValidationResult {
        const result: ValidationResult = {
            isValid: true,
            errors: []
        }

        const now = Date.now()
        const age = now - timestamp

        if (age > maxAgeMs) {
            result.errors.push('Transaction request has expired')
            result.isValid = false
        }

        if (timestamp > now + 60000) { // 1 minute future tolerance
            result.errors.push('Transaction timestamp is too far in the future')
            result.isValid = false
        }

        return result
    }
} 