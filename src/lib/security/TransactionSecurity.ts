import { isAddress, parseUnits, formatUnits } from 'viem'
import { SUPPORTED_TOKENS, type TokenSymbol } from '@/config/constants'

// Security configuration constants
export const SECURITY_LIMITS = {
    // Slippage protection (basis points: 100 = 1%)
    MAX_SLIPPAGE_BPS: 1000, // 10% maximum
    DEFAULT_SLIPPAGE_BPS: 50, // 0.5% default
    WARNING_SLIPPAGE_BPS: 300, // 3% warning threshold

    // Gas limits
    MIN_GAS_LIMIT: 21000n, // Minimum for ETH transfer
    MAX_GAS_LIMIT: 10000000n, // 10M gas maximum

    // Transaction amounts (in USD equivalent where possible)
    MAX_TRANSACTION_USD: 50000, // $50K max per transaction
    LARGE_TRANSACTION_USD: 1000, // $1K triggers warning

    // Address validation
    FORBIDDEN_ADDRESSES: [
        '0x0000000000000000000000000000000000000000', // Zero address
        '0x000000000000000000000000000000000000dead', // Burn address
    ] as const,

    // Network validation
    ALLOWED_CHAIN_IDS: [8453], // Base mainnet only

    // Transaction timeouts
    TRANSACTION_TIMEOUT_MS: 300000, // 5 minutes
    CONFIRMATION_TIMEOUT_MS: 120000, // 2 minutes
} as const

export interface TransactionValidationResult {
    isValid: boolean
    errors: string[]
    warnings: string[]
    securityScore: number // 0-100, higher is safer
    suggestions: string[]
}

export interface SwapValidationParams {
    sellToken: TokenSymbol
    buyToken: TokenSymbol
    sellAmount: string
    buyAmount: string
    slippageBps?: number
    userAddress: string
    recipient?: string
}

export interface SendValidationParams {
    token: TokenSymbol | 'ETH'
    amount: string
    recipient: string
    userAddress: string
    gasLimit?: bigint
}

export class TransactionSecurity {

    /**
     * Validates a swap transaction for security issues
     */
    static validateSwap(params: SwapValidationParams): TransactionValidationResult {
        const { sellToken, buyToken, sellAmount, buyAmount, slippageBps = SECURITY_LIMITS.DEFAULT_SLIPPAGE_BPS, userAddress, recipient } = params

        const result: TransactionValidationResult = {
            isValid: true,
            errors: [],
            warnings: [],
            securityScore: 100,
            suggestions: []
        }

        // Basic validation
        if (sellToken === buyToken) {
            result.errors.push('Cannot swap identical tokens')
            result.securityScore -= 50
        }

        // Amount validation
        const sellAmountNum = parseFloat(sellAmount)
        const buyAmountNum = parseFloat(buyAmount)

        if (sellAmountNum <= 0 || buyAmountNum <= 0) {
            result.errors.push('Invalid transaction amounts')
            result.securityScore -= 30
        }

        if (sellAmountNum > 1000000) { // Suspiciously large amount
            result.warnings.push('Extremely large transaction amount detected')
            result.securityScore -= 20
        }

        // Slippage validation
        if (slippageBps > SECURITY_LIMITS.MAX_SLIPPAGE_BPS) {
            result.errors.push(`Slippage too high (${slippageBps / 100}%). Maximum allowed: ${SECURITY_LIMITS.MAX_SLIPPAGE_BPS / 100}%`)
            result.securityScore -= 40
        }

        if (slippageBps > SECURITY_LIMITS.WARNING_SLIPPAGE_BPS) {
            result.warnings.push(`High slippage (${slippageBps / 100}%). Consider lowering for better execution`)
            result.securityScore -= 15
        }

        // Price impact calculation (simplified)
        const expectedPrice = sellAmountNum / buyAmountNum
        if (expectedPrice > 1.5) { // Suspicious price ratio
            result.warnings.push('Unusual price ratio detected - verify token prices')
            result.securityScore -= 10
        }

        // Recipient validation (if different from user)
        if (recipient && recipient !== userAddress) {
            if (!this.validateAddress(recipient).isValid) {
                result.errors.push('Invalid recipient address')
                result.securityScore -= 30
            }
            result.warnings.push('Tokens will be sent to a different address')
            result.securityScore -= 5
        }

        // Token validation
        if (!SUPPORTED_TOKENS[sellToken] || !SUPPORTED_TOKENS[buyToken]) {
            result.errors.push('Unsupported token in swap')
            result.securityScore -= 25
        }

        result.isValid = result.errors.length === 0

        // Add suggestions based on issues found
        if (slippageBps > SECURITY_LIMITS.DEFAULT_SLIPPAGE_BPS) {
            result.suggestions.push('Consider using lower slippage tolerance for better execution')
        }

        if (sellAmountNum > 100) {
            result.suggestions.push('Consider splitting large transactions into smaller amounts')
        }

        return result
    }

    /**
     * Validates a send transaction for security issues
     */
    static validateSend(params: SendValidationParams): TransactionValidationResult {
        const { token, amount, recipient, userAddress, gasLimit } = params

        const result: TransactionValidationResult = {
            isValid: true,
            errors: [],
            warnings: [],
            securityScore: 100,
            suggestions: []
        }

        // Address validation
        const addressValidation = this.validateAddress(recipient)
        if (!addressValidation.isValid) {
            result.errors.push(...addressValidation.errors)
            result.securityScore -= 40
        }
        result.warnings.push(...addressValidation.warnings)

        // Self-send check
        if (recipient.toLowerCase() === userAddress.toLowerCase()) {
            result.warnings.push('Sending to yourself - transaction will only consume gas')
            result.securityScore -= 10
        }

        // Amount validation
        const amountNum = parseFloat(amount)
        if (amountNum <= 0) {
            result.errors.push('Invalid send amount')
            result.securityScore -= 30
        }

        // Large transaction warning
        if (amountNum > SECURITY_LIMITS.LARGE_TRANSACTION_USD / 100) { // Rough estimate
            result.warnings.push('Large transaction amount - please verify recipient address carefully')
            result.securityScore -= 15
        }

        // Gas validation
        if (gasLimit) {
            if (gasLimit < SECURITY_LIMITS.MIN_GAS_LIMIT) {
                result.errors.push('Gas limit too low - transaction will likely fail')
                result.securityScore -= 25
            }

            if (gasLimit > SECURITY_LIMITS.MAX_GAS_LIMIT) {
                result.warnings.push('Very high gas limit - transaction may be expensive')
                result.securityScore -= 10
            }
        }

        // Token validation
        if (token !== 'ETH' && !SUPPORTED_TOKENS[token as TokenSymbol]) {
            result.errors.push('Unsupported token')
            result.securityScore -= 30
        }

        result.isValid = result.errors.length === 0

        // Security suggestions
        if (amountNum > 10) {
            result.suggestions.push('Double-check recipient address for large transactions')
        }

        if (!addressValidation.isChecksumValid) {
            result.suggestions.push('Use checksummed address format for better security')
        }

        return result
    }

    /**
     * Validates an Ethereum address
     */
    static validateAddress(address: string): { isValid: boolean; errors: string[]; warnings: string[]; isChecksumValid: boolean } {
        const result = {
            isValid: true,
            errors: [] as string[],
            warnings: [] as string[],
            isChecksumValid: false
        }

        // Basic format validation
        if (!isAddress(address)) {
            result.errors.push('Invalid Ethereum address format')
            result.isValid = false
            return result
        }

        // Check against forbidden addresses
        const lowerAddress = address.toLowerCase()
        if (SECURITY_LIMITS.FORBIDDEN_ADDRESSES.some(forbidden => forbidden.toLowerCase() === lowerAddress)) {
            result.errors.push('Cannot send to this address (zero/burn address)')
            result.isValid = false
        }

        // Checksum validation
        const hasUpperCase = /[A-F]/.test(address)
        const hasLowerCase = /[a-f]/.test(address.slice(2)) // Skip 0x prefix
        result.isChecksumValid = hasUpperCase || hasLowerCase

        if (!result.isChecksumValid) {
            result.warnings.push('Address is not checksummed - consider using checksummed format')
        }

        // Contract detection (basic heuristic)
        if (address.slice(2).startsWith('000000')) {
            result.warnings.push('Address appears to be a contract - verify this is intended')
        }

        return result
    }

    /**
     * Calculates slippage for a swap
     */
    static calculateSlippage(expectedAmount: string, actualAmount: string, decimals: number): number {
        const expected = parseFloat(formatUnits(BigInt(expectedAmount), decimals))
        const actual = parseFloat(formatUnits(BigInt(actualAmount), decimals))

        if (expected === 0) return 0

        const slippage = ((expected - actual) / expected) * 10000 // Return in basis points
        return Math.max(0, slippage) // Negative slippage is bonus, not slippage
    }

    /**
     * Estimates gas for different transaction types
     */
    static estimateGasLimits(transactionType: 'eth_transfer' | 'erc20_transfer' | 'swap'): { min: bigint; recommended: bigint; max: bigint } {
        switch (transactionType) {
            case 'eth_transfer':
                return {
                    min: 21000n,
                    recommended: 21000n,
                    max: 25000n
                }
            case 'erc20_transfer':
                return {
                    min: 50000n,
                    recommended: 65000n,
                    max: 100000n
                }
            case 'swap':
                return {
                    min: 150000n,
                    recommended: 250000n,
                    max: 500000n
                }
            default:
                return {
                    min: 21000n,
                    recommended: 100000n,
                    max: 500000n
                }
        }
    }

    /**
     * Checks if a transaction amount represents a significant portion of balance
     */
    static checkBalanceImpact(sendAmount: string, totalBalance: string, decimals: number): { isSignificant: boolean; percentage: number } {
        const send = parseFloat(formatUnits(parseUnits(sendAmount, decimals), decimals))
        const total = parseFloat(formatUnits(parseUnits(totalBalance, decimals), decimals))

        if (total === 0) return { isSignificant: false, percentage: 0 }

        const percentage = (send / total) * 100

        return {
            isSignificant: percentage > 50, // More than 50% of balance
            percentage
        }
    }
} 