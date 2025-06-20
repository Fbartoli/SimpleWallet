'use client'

import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    AlertTriangle,
    Shield,
    Clock,
    CheckCircle,
    XCircle,
    Eye,
    EyeOff,
    Loader2
} from 'lucide-react'
import { TransactionSecurity, type TransactionValidationResult } from '@/lib/security/TransactionSecurity'
import { SUPPORTED_TOKENS, type TokenSymbol } from '@/config/constants'

interface SecurityConfirmationModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    isLoading: boolean
    transactionData: {
        type: 'send' | 'swap'
        amount: string
        token: TokenSymbol | 'ETH'
        recipient?: string
        buyToken?: TokenSymbol
        buyAmount?: string
        estimatedGas?: string
        userAddress: string
    }
}

export function SecurityConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    isLoading,
    transactionData
}: SecurityConfirmationModalProps) {
    const [validation, setValidation] = useState<TransactionValidationResult | null>(null)
    const [confirmationText, setConfirmationText] = useState('')
    const [showRecipient, setShowRecipient] = useState(false)
    const [timeLeft, setTimeLeft] = useState(30) // 30 second timeout for security
    const [hasUserConfirmed, setHasUserConfirmed] = useState(false)

    const requiredConfirmationText = 'CONFIRM TRANSACTION'

    // Validate transaction when modal opens
    useEffect(() => {
        if (isOpen && transactionData) {
            if (transactionData.type === 'send' && transactionData.recipient) {
                const sendValidation = TransactionSecurity.validateSend({
                    token: transactionData.token,
                    amount: transactionData.amount,
                    recipient: transactionData.recipient,
                    userAddress: transactionData.userAddress
                })
                setValidation(sendValidation)
            } else if (transactionData.type === 'swap' && transactionData.buyToken && transactionData.buyAmount) {
                const swapValidation = TransactionSecurity.validateSwap({
                    sellToken: transactionData.token as TokenSymbol,
                    buyToken: transactionData.buyToken,
                    sellAmount: transactionData.amount,
                    buyAmount: transactionData.buyAmount,
                    userAddress: transactionData.userAddress
                })
                setValidation(swapValidation)
            }
        }
    }, [isOpen, transactionData])

    // Security timeout countdown
    useEffect(() => {
        if (!isOpen) return

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    onClose()
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [isOpen, onClose])

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setConfirmationText('')
            setHasUserConfirmed(false)
            setTimeLeft(30)
            setValidation(null)
        }
    }, [isOpen])

    const getSecurityColor = (score: number) => {
        if (score >= 80) return 'text-green-600'
        if (score >= 60) return 'text-yellow-600'
        return 'text-red-600'
    }

    const getSecurityBadge = (score: number) => {
        if (score >= 80) return { text: 'SECURE', color: 'bg-green-500' }
        if (score >= 60) return { text: 'WARNING', color: 'bg-yellow-500' }
        return { text: 'HIGH RISK', color: 'bg-red-500' }
    }

    const canConfirm = validation?.isValid &&
        confirmationText === requiredConfirmationText &&
        hasUserConfirmed &&
        timeLeft > 0

    const tokenInfo = transactionData.token === 'ETH'
        ? { symbol: 'ETH', displaySymbol: 'ETH' }
        : SUPPORTED_TOKENS[transactionData.token as TokenSymbol]

    const buyTokenInfo = transactionData.buyToken ? SUPPORTED_TOKENS[transactionData.buyToken] : null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-600" />
                        Security Review Required
                    </DialogTitle>
                    <DialogDescription>
                        Please carefully review this transaction before confirming.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Security Score */}
                    {validation && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                <span className="text-sm font-medium">Security Score:</span>
                                <span className={`font-bold ${getSecurityColor(validation.securityScore)}`}>
                                    {validation.securityScore}/100
                                </span>
                            </div>
                            <div className={`px-2 py-1 rounded text-xs text-white font-medium ${getSecurityBadge(validation.securityScore).color}`}>
                                {getSecurityBadge(validation.securityScore).text}
                            </div>
                        </div>
                    )}

                    {/* Transaction Details */}
                    <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900">Transaction Details</h4>

                        {transactionData.type === 'send' ? (
                            <>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Sending:</span>
                                    <span className="font-mono font-medium">
                                        {transactionData.amount} {tokenInfo?.displaySymbol}
                                    </span>
                                </div>

                                <div className="flex justify-between items-start">
                                    <span className="text-sm text-gray-600">To:</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-sm text-right max-w-32 truncate">
                                            {showRecipient
                                                ? transactionData.recipient
                                                : `${transactionData.recipient?.slice(0, 6)}...${transactionData.recipient?.slice(-4)}`
                                            }
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowRecipient(!showRecipient)}
                                            className="h-6 w-6 p-0"
                                        >
                                            {showRecipient ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                        </Button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Selling:</span>
                                    <span className="font-mono font-medium">
                                        {transactionData.amount} {tokenInfo?.displaySymbol}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Buying:</span>
                                    <span className="font-mono font-medium">
                                        {transactionData.buyAmount} {buyTokenInfo?.displaySymbol}
                                    </span>
                                </div>
                            </>
                        )}

                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Network:</span>
                            <span className="text-sm font-medium text-blue-600">Base</span>
                        </div>

                        {transactionData.estimatedGas && (
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Est. Gas:</span>
                                <span className="text-sm text-gray-800">{transactionData.estimatedGas} ETH</span>
                            </div>
                        )}
                    </div>

                    {/* Security Warnings */}
                    {validation && validation.errors.length > 0 && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start gap-3">
                                <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="font-medium text-red-800 mb-2">Security Errors</h4>
                                    <ul className="space-y-1">
                                        {validation.errors.map((error, index) => (
                                            <li key={index} className="text-sm text-red-700">• {error}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Security Warnings */}
                    {validation && validation.warnings.length > 0 && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="font-medium text-amber-800 mb-2">Security Warnings</h4>
                                    <ul className="space-y-1">
                                        {validation.warnings.map((warning, index) => (
                                            <li key={index} className="text-sm text-amber-700">• {warning}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Security Suggestions */}
                    {validation && validation.suggestions.length > 0 && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="font-medium text-blue-800 mb-2">Security Suggestions</h4>
                                    <ul className="space-y-1">
                                        {validation.suggestions.map((suggestion, index) => (
                                            <li key={index} className="text-sm text-blue-700">• {suggestion}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Base Network Warning */}
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="font-medium text-orange-800 mb-1">Base Network Only</h4>
                                <p className="text-sm text-orange-700">
                                    This transaction will only work on Base network. Ensure the recipient supports Base.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Timeout Warning */}
                    <div className="flex items-center justify-center gap-2 p-3 bg-gray-100 rounded-lg">
                        <Clock className="h-4 w-4 text-gray-600" />
                        <span className="text-sm text-gray-700">
                            Auto-close in <span className="font-bold text-red-600">{timeLeft}s</span>
                        </span>
                    </div>

                    {/* Confirmation Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900">
                            Type &quot;{requiredConfirmationText}&quot; to confirm:
                        </label>
                        <Input
                            value={confirmationText}
                            onChange={(e) => setConfirmationText(e.target.value.toUpperCase())}
                            placeholder={requiredConfirmationText}
                            className="font-mono"
                            disabled={isLoading}
                        />
                    </div>

                    {/* Final Confirmation Checkbox */}
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                        <input
                            type="checkbox"
                            id="final-confirm"
                            checked={hasUserConfirmed}
                            onChange={(e) => setHasUserConfirmed(e.target.checked)}
                            className="mt-1"
                            disabled={isLoading}
                        />
                        <label htmlFor="final-confirm" className="text-sm text-gray-700 cursor-pointer">
                            I understand this action is irreversible and I have verified all transaction details are correct.
                        </label>
                    </div>

                    {/* Final Warning */}
                    <div className="text-center text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium text-red-600 mb-1">⚠️ FINAL WARNING ⚠️</p>
                        <p>Once confirmed, this transaction cannot be undone. Double-check all details.</p>
                    </div>
                </div>

                <DialogFooter className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={!canConfirm || isLoading}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Shield className="mr-2 h-4 w-4" />
                                Execute Transaction
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
} 