'use client'

import { useState, useEffect } from 'react'
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets'
import { useForm } from 'react-hook-form'
import { isAddress, parseUnits, createPublicClient, http, encodeFunctionData, erc20Abi } from 'viem'
import { base } from 'viem/chains'
import { useToast } from './ui/use-toast'
import { useTokenBalances } from '@/app/hooks/useTokenBalances'
import { TOKENS, type TokenSymbol, WETH_ABI } from '@/app/stores/useTokenStore'

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from './ui/form'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './ui/select'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Loader2 } from 'lucide-react'
import * as Slider from '@radix-ui/react-slider'

// Initialize a public client for transaction receipt tracking
const publicClient = createPublicClient({
    chain: base,
    transport: http()
})

// Define form value type
type FormValues = {
    token: string;
    recipient: string;
    amount: string;
}

export function SendToken() {
    const { toast } = useToast()
    const { client } = useSmartWallets()
    const { balances, refresh } = useTokenBalances()
    const [isTransferring, setIsTransferring] = useState(false)
    const [percentage, setPercentage] = useState(0)
    const [selectedTokenBalance, setSelectedTokenBalance] = useState<{
        formatted: string;
        decimals: number;
    } | null>(null)

    // Initialize form with manual validation
    const form = useForm<FormValues>({
        defaultValues: {
            token: '',
            recipient: '',
            amount: '',
        },
    })

    // Update selected token balance when token changes
    useEffect(() => {
        const tokenSymbol = form.watch('token') as TokenSymbol
        if (tokenSymbol && balances[tokenSymbol]) {
            const tokenInfo = TOKENS[tokenSymbol]
            setSelectedTokenBalance({
                formatted: balances[tokenSymbol].formatted,
                decimals: tokenInfo.decimals
            })
        } else {
            setSelectedTokenBalance(null)
        }
    }, [form.watch('token'), balances])

    // Update amount when percentage changes
    useEffect(() => {
        if (selectedTokenBalance && percentage > 0) {
            const maxAmount = parseFloat(selectedTokenBalance.formatted)
            const calculatedAmount = (maxAmount * percentage / 100).toFixed(6)
            // Remove trailing zeros
            const trimmedAmount = parseFloat(calculatedAmount).toString()
            form.setValue('amount', trimmedAmount)
        }
    }, [percentage, selectedTokenBalance, form])

    // Filter tokens to only show those with balance > 0
    const tokensWithBalance = Object.entries(balances)
        .filter(([, tokenBalance]) => tokenBalance.value > 0n)
        .map(([symbol]) => symbol as TokenSymbol)

    // Handle slider change
    const handleSliderChange = (value: number[]) => {
        if (typeof value[0] === 'number') {
            setPercentage(value[0])
        }
    }

    // Handle WETH unwrapping and ETH sending
    const handleWethUnwrapAndSend = async (recipient: `0x${string}`, amount: bigint) => {
        if (!client) return false

        try {
            // Prepare the WETH unwrap transaction data
            const withdrawTxData = encodeFunctionData({
                abi: WETH_ABI,
                functionName: 'withdraw',
                args: [amount]
            })

            toast({
                title: 'Processing ETH Transaction',
                description: 'Sending ETH to recipient...',
            })

            // Use batched transactions to unwrap WETH and then send ETH
            const batchedTx = await client.sendTransaction({
                calls: [
                    // First call: Unwrap WETH to ETH
                    {
                        to: TOKENS.WETH.address as `0x${string}`,
                        data: withdrawTxData,
                        value: 0n
                    },
                    // Second call: Send ETH to recipient
                    {
                        to: recipient,
                        data: '0x', // Empty data for ETH transfer
                        value: amount
                    }
                ]
            })

            // Wait for transaction to complete
            await publicClient.waitForTransactionReceipt({
                hash: batchedTx as `0x${string}`
            })

            return true
        } catch (error) {
            console.error('WETH unwrap & send error:', error)
            throw error
        }
    }

    const onSubmit = async (values: FormValues) => {
        // Basic validation
        if (!values.token) {
            form.setError('token', {
                type: 'manual',
                message: 'Please select a token',
            })
            return;
        }

        if (!values.recipient || !isAddress(values.recipient)) {
            form.setError('recipient', {
                type: 'manual',
                message: 'Please enter a valid Ethereum address',
            })
            return;
        }

        const amount = parseFloat(values.amount);
        if (isNaN(amount) || amount <= 0) {
            form.setError('amount', {
                type: 'manual',
                message: 'Please enter a valid amount greater than 0',
            })
            return;
        }

        if (!client) {
            toast({
                variant: 'destructive',
                title: 'Wallet not ready',
                description: 'Please wait for your wallet to be ready.',
            })
            return
        }

        setIsTransferring(true)

        try {
            const tokenSymbol = values.token as TokenSymbol
            const tokenInfo = TOKENS[tokenSymbol]
            const tokenBalance = balances[tokenSymbol]

            // Convert input amount to token units
            const tokenAmount = parseUnits(values.amount, tokenInfo.decimals)

            // Verify sufficient balance
            if (tokenAmount > tokenBalance.value) {
                toast({
                    variant: 'destructive',
                    title: 'Insufficient balance',
                    description: `You don&apos;t have enough ${tokenInfo.displaySymbol} to send this amount.`,
                })
                setIsTransferring(false)
                return
            }

            let success = false;

            // Special handling for WETH - unwrap and send as native ETH
            if (tokenSymbol === 'WETH') {
                success = await handleWethUnwrapAndSend(
                    values.recipient as `0x${string}`,
                    tokenAmount
                );
            } else {
                // Regular ERC20 token transfer
                // Encode transfer function call
                const txData = encodeFunctionData({
                    abi: erc20Abi,
                    functionName: 'transfer',
                    args: [values.recipient as `0x${string}`, tokenAmount]
                })

                // Send the transaction
                const tx = await client.sendTransaction({
                    to: tokenInfo.address as `0x${string}`,
                    data: txData,
                    value: 0n
                })

                toast({
                    title: 'Transaction Submitted',
                    description: `Sending ${values.amount} ${tokenInfo.displaySymbol} to the recipient`,
                })

                // Wait for transaction to complete
                await publicClient.waitForTransactionReceipt({
                    hash: tx as `0x${string}`
                })

                success = true;
            }

            if (success) {
                toast({
                    title: 'Transaction Successful',
                    description: tokenSymbol === 'WETH'
                        ? `Successfully sent ${values.amount} ETH (unwrapped from WETH)`
                        : `Successfully sent ${values.amount} ${tokenInfo.displaySymbol}`,
                })

                // Reset form and refresh balances
                form.reset()
                setPercentage(0)
                refresh()
            }
        } catch (error) {
            console.error('Transfer error:', error)
            toast({
                variant: 'destructive',
                title: 'Transaction Failed',
                description: error instanceof Error ? error.message : 'Failed to send tokens',
            })
        } finally {
            setIsTransferring(false)
        }
    }

    // If no tokens with balance, show message
    if (tokensWithBalance.length === 0) {
        return (
            <div className="grid gap-4 p-6 border rounded-lg bg-gradient-to-br from-green-50 to-teal-50 shadow-md">
                <h3 className="text-xl font-semibold text-green-800">Send Tokens</h3>
                <div className="flex items-center justify-center py-8">
                    <p className="text-muted-foreground text-center">You don&apos;t have any tokens to send. Add funds to your wallet first.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="grid gap-6 p-6 border rounded-lg bg-gradient-to-br from-green-50 to-teal-50 shadow-md">
            <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-green-500/10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                        <path d="M19 12H5"></path>
                        <path d="M12 19l-7-7 7-7"></path>
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-green-800">Send Tokens</h3>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                        control={form.control}
                        name="token"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-green-700">Token</FormLabel>
                                <Select
                                    onValueChange={(value) => {
                                        field.onChange(value)
                                        setPercentage(0) // Reset percentage when token changes
                                    }}
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger className="border-green-200 focus:ring-green-500">
                                            <SelectValue placeholder="Select token to send" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {tokensWithBalance.map((symbol) => (
                                            <SelectItem key={symbol} value={symbol}>
                                                {TOKENS[symbol].displaySymbol} - Balance: {balances[symbol].formatted}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="recipient"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-green-700">Recipient Address</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="0x..."
                                        {...field}
                                        className="border-green-200 focus:ring-green-500"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-green-700">Amount</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="0.0"
                                        {...field}
                                        className="border-green-200 focus:ring-green-500"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {selectedTokenBalance && (
                        <div className="space-y-3 bg-white/50 p-4 rounded-lg border border-green-100">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium text-green-700">Select amount: {percentage}%</span>
                                {percentage > 0 && (
                                    <span className="text-green-600">
                                        {form.watch('amount')} / {selectedTokenBalance.formatted}
                                    </span>
                                )}
                            </div>
                            <div className="px-1 py-3">
                                <Slider.Root
                                    className="relative flex items-center select-none touch-none w-full h-6"
                                    value={[percentage]}
                                    onValueChange={(value: number[]) => handleSliderChange(value)}
                                    max={100}
                                    step={1}
                                    aria-label="Percentage"
                                >
                                    <Slider.Track className="bg-green-100 relative grow rounded-full h-[5px]">
                                        <Slider.Range className="absolute bg-green-500 rounded-full h-full" />
                                    </Slider.Track>
                                    <Slider.Thumb className="block w-6 h-6 bg-gradient-to-r from-green-500 to-teal-500 shadow-md rounded-full hover:from-green-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2" />
                                </Slider.Root>
                            </div>
                            <div className="grid grid-cols-5 gap-2 mt-1">
                                {[20, 40, 60, 80, 100].map((preset) => (
                                    <Button
                                        key={preset}
                                        variant="outline"
                                        size="sm"
                                        type="button"
                                        onClick={() => setPercentage(preset)}
                                        className="text-xs border-green-200 text-green-700 hover:bg-green-100 hover:text-green-800"
                                    >
                                        {preset}%
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={isTransferring}
                        className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-medium"
                    >
                        {isTransferring ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                            </>
                        ) : 'Send Tokens'}
                    </Button>
                </form>
            </Form>
        </div>
    )
} 