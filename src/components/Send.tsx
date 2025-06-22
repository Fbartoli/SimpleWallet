"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { usePrivy } from "@privy-io/react-auth"
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets"
import { useToast } from "@/components/ui/use-toast"
import { useTokenBalances } from "@/hooks/useTokenBalances"
import { useActivityRefresh } from "@/contexts/ActivityContext"
import { SUPPORTED_TOKENS, type TokenSymbol } from "@/config/constants"
import { createPublicClient, encodeFunctionData, erc20Abi, http, isAddress, parseUnits } from "viem"
import { base } from "viem/chains"
import { AlertTriangle, ArrowRight, CheckCircle, Loader2, Send as SendIcon } from "lucide-react"
import { useTranslations } from "@/hooks/useTranslations"
import { logger } from "@/lib/logger"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface SendFormValues {
    recipient: string
    token: TokenSymbol | "ETH"
    amount: string
}

interface ConfirmationModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    isLoading: boolean
    formData: SendFormValues
    estimatedGas?: string
}

const publicClient = createPublicClient({
    chain: base,
    transport: http("https://base.gateway.tenderly.co/28rOk2uI3CVMnyinm9c3yn"),
})

function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    isLoading,
    formData,
    estimatedGas,
}: ConfirmationModalProps) {
    const { send, common } = useTranslations()
    const tokenInfo = formData.token === "ETH"
        ? { symbol: "ETH", displaySymbol: "ETH", decimals: 18 }
        : SUPPORTED_TOKENS[formData.token as TokenSymbol]

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <SendIcon className="h-5 w-5 text-blue-600" />
                        {send("confirmTransaction")}
                    </DialogTitle>
                    <DialogDescription>
                        {send("reviewDetails")}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Warning Banner */}
                    <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-amber-800">
                                {send("baseNetworkOnly")}
                            </p>
                            <p className="text-xs text-amber-700">
                                {send("baseNetworkWarning")}
                            </p>
                        </div>
                    </div>

                    {/* Transaction Details */}
                    <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">{send("sending")}</span>
                            <span className="font-mono font-medium">
                                {formData.amount} {tokenInfo?.displaySymbol}
                            </span>
                        </div>

                        <div className="flex justify-between items-start">
                            <span className="text-sm text-gray-600">{send("to")}</span>
                            <span className="font-mono text-sm text-right break-all max-w-48">
                                {formData.recipient}
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">{send("network")}</span>
                            <span className="text-sm font-medium text-blue-600">Base</span>
                        </div>

                        {estimatedGas && (
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">{send("estimatedGas")}</span>
                                <span className="text-sm text-gray-800">{estimatedGas} ETH</span>
                            </div>
                        )}
                    </div>

                    {/* Final Warning */}
                    <div className="text-center text-sm text-gray-600">
                        <p>{send("actionCannotBeUndone")}</p>
                    </div>
                </div>

                <DialogFooter className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        {common("cancel")}
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {send("sending...")}
                            </>
                        ) : (
                            <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                {send("confirmSend")}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export function Send() {
    const { user } = usePrivy()
    const { client } = useSmartWallets()
    const { toast } = useToast()
    const { refreshActivity } = useActivityRefresh()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const { send, wallet, common } = useTranslations()

    const walletAddress = user?.smartWallet?.address

    const { storeBalances, isLoading: isBalanceLoading, refresh } = useTokenBalances(walletAddress || "")

    const form = useForm<SendFormValues>({
        defaultValues: {
            recipient: "",
            token: "ETH",
            amount: "",
        },
    })

    const { watch, setValue, handleSubmit } = form
    const selectedToken = watch("token")

    // Get available balance for selected token
    const getAvailableBalance = () => {
        if (selectedToken === "ETH") {
            // For native ETH, get from storeBalances if available, otherwise return '0'
            return storeBalances["WETH"]?.formatted || "0"
        }
        return storeBalances[selectedToken as TokenSymbol]?.formatted || "0"
    }

    const handleMaxClick = () => {
        const balance = getAvailableBalance()
        if (balance && parseFloat(balance) > 0) {
            setValue("amount", balance)
        }
    }

    const validateForm = (data: SendFormValues): string | null => {
        if (!isAddress(data.recipient)) {
            return send("pleaseEnterValidAddress")
        }

        if (!data.amount || parseFloat(data.amount) <= 0) {
            return send("pleaseEnterValidAmount")
        }

        const availableBalance = parseFloat(getAvailableBalance())
        const sendAmount = parseFloat(data.amount)

        if (sendAmount > availableBalance) {
            return send("insufficientBalance")
        }

        return null
    }

    const onSubmit = async (data: SendFormValues) => {
        const validation = validateForm(data)
        if (validation) {
            toast({
                title: send("validationError"),
                description: validation,
                variant: "destructive",
            })
            return
        }

        // Estimate gas before showing modal
        try {
            // For now, we'll skip gas estimation and just show the modal
            setIsModalOpen(true)
        } catch {
            toast({
                title: common("error"),
                description: send("failedToEstimate"),
                variant: "destructive",
            })
        }
    }

    const executeSend = async () => {
        if (!client || !walletAddress) return

        setIsSending(true)

        try {
            const formData = form.getValues()

            // Deploy account if needed
            if (!await client.account.isDeployed()) {
                const deployTx = await client.sendTransaction({
                    to: walletAddress as `0x${string}`,
                    data: "0x",
                    value: 0n,
                })
                await publicClient.waitForTransactionReceipt({ hash: deployTx as `0x${string}` })
            }

            let tx: string

            if (formData.token === "ETH") {
                // Native ETH transfer
                const valueInWei = parseUnits(formData.amount, 18)
                tx = await client.sendTransaction({
                    to: formData.recipient as `0x${string}`,
                    value: valueInWei,
                    data: "0x",
                })
            } else {
                // ERC20 transfer
                const token = SUPPORTED_TOKENS[formData.token as TokenSymbol]
                if (!token) {
                    throw new Error(send("tokenNotFound"))
                }
                const amountInTokenUnits = parseUnits(formData.amount, token.decimals)

                const transferData = encodeFunctionData({
                    abi: erc20Abi,
                    functionName: "transfer",
                    args: [formData.recipient as `0x${string}`, amountInTokenUnits],
                })

                tx = await client.sendTransaction({
                    to: token.address as `0x${string}`,
                    data: transferData,
                    value: 0n,
                })
            }

            // Wait for confirmation
            await publicClient.waitForTransactionReceipt({ hash: tx as `0x${string}` })

            // Refresh balances
            refresh()

            toast({
                title: send("transactionSuccessful"),
                description: `${send("successfullySent")} ${formData.amount} ${formData.token === "ETH" ? "ETH" : SUPPORTED_TOKENS[formData.token as TokenSymbol]?.displaySymbol} to ${formData.recipient.slice(0, 6)}...${formData.recipient.slice(-4)}`,
            })

            // Refresh activity feed with a small delay to allow indexing
            setTimeout(() => {
                refreshActivity()
            }, 2000)

            // Reset form
            form.reset()
            setIsModalOpen(false)

        } catch (error) {
            logger.error("Send transaction error", {
                component: "send",
                metadata: {
                    error: error instanceof Error ? error.message : String(error),
                    stack: error instanceof Error ? error.stack : undefined,
                },
            })
            const message = error instanceof Error ? error.message : send("transactionFailed")
            toast({
                title: send("transactionFailed"),
                description: message,
                variant: "destructive",
            })
        } finally {
            setIsSending(false)
        }
    }

    if (!walletAddress) {
        return (
            <div className="p-6 border rounded-lg shadow-md bg-card">
                <div className="text-center">
                    <p className="text-amber-800">{wallet("connectWallet")} to send tokens.</p>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="p-6 border rounded-lg shadow-md bg-card relative overflow-hidden">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-50 pointer-events-none" />

                <div className="relative">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-8 w-8 bg-blue-500/10 text-blue-600 rounded-full flex items-center justify-center">
                            <SendIcon className="h-4 w-4" />
                        </div>
                        <h3 className="text-lg font-semibold">{send("sendTokens")}</h3>
                    </div>

                    {/* Warning Banner */}
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-amber-800 mb-1">
                                    ⚠️ {send("baseNetworkOnly")}
                                </p>
                                <p className="text-sm text-amber-700">
                                    {send("baseNetworkWarningLong")}
                                </p>
                            </div>
                        </div>
                    </div>

                    <Form {...form}>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="recipient"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{send("recipientAddress")}</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="0x..."
                                                {...field}
                                                className="font-mono"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="token"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Token</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={send("selectTokenToSend")} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="ETH">
                                                    <div className="flex items-center justify-between w-full">
                                                        <span className="font-medium">{send("ethNative")}</span>
                                                        <span className="ml-2 text-sm text-gray-500 font-mono">
                                                            {isBalanceLoading ? "..." : getAvailableBalance()}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                                {Object.entries(SUPPORTED_TOKENS)
                                                    .filter(([symbol]) => {
                                                        const balance = storeBalances[symbol as TokenSymbol]
                                                        return balance && balance.value > 0n
                                                    })
                                                    .map(([symbol, token]) => {
                                                        const balance = storeBalances[symbol as TokenSymbol]
                                                        return (
                                                            <SelectItem key={symbol} value={symbol}>
                                                                <div className="flex items-center justify-between w-full">
                                                                    <span className="font-medium">{token.displaySymbol}</span>
                                                                    <span className="ml-2 text-sm text-gray-500 font-mono">
                                                                        {balance?.formatted || "0.00"}
                                                                    </span>
                                                                </div>
                                                            </SelectItem>
                                                        )
                                                    })
                                                }
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{send("amount")}</FormLabel>
                                        <div className="relative">
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="any"
                                                    min="0"
                                                    placeholder="0.00"
                                                    {...field}
                                                    className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none pr-16"
                                                />
                                            </FormControl>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                onClick={handleMaxClick}
                                                disabled={isBalanceLoading}
                                            >
                                                {isBalanceLoading ? (
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                ) : (
                                                    common("max")
                                                )}
                                            </Button>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {send("available")}: {isBalanceLoading ? "..." : getAvailableBalance()} {selectedToken === "ETH" ? "ETH" : SUPPORTED_TOKENS[selectedToken as TokenSymbol]?.displaySymbol}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                disabled={!client || isBalanceLoading}
                            >
                                {!client ? (
                                    wallet("connectWallet")
                                ) : (
                                    <>
                                        <ArrowRight className="mr-2 h-4 w-4" />
                                        {send("reviewTransaction")}
                                    </>
                                )}
                            </Button>
                        </form>
                    </Form>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={executeSend}
                isLoading={isSending}
                formData={form.getValues()}
            />
        </>
    )
} 