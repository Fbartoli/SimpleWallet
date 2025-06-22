"use client"

import { useState } from "react"
import { useFundWallet, usePrivy } from "@privy-io/react-auth"
import { Button } from "./ui/button"
import { ArrowDownCircle, Check, Copy, ExternalLink, QrCode, Wallet } from "lucide-react"
import { useToast } from "./ui/use-toast"
import { base } from "viem/chains"
import { TOKENS } from "@/stores/useTokenStore"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "./ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select"
import { Input } from "./ui/input"
import { useForm } from "react-hook-form"

// Define our form values type
type FormValues = {
    amount: string;
    asset: string;
};

export default function Receive() {
    const { user } = usePrivy()
    const { fundWallet } = useFundWallet()
    const { toast } = useToast()
    const walletAddress = user?.smartWallet?.address
    const [copied, setCopied] = useState(false)

    // Setup form with react-hook-form without zod
    const form = useForm<FormValues>({
        defaultValues: {
            amount: "0.001",
            asset: "native-currency",
        },
    })

    const onSubmit = (data: FormValues) => {
        if (walletAddress) {
            // Determine asset format based on selection
            let assetParam: "native-currency" | "USDC" | { erc20: `0x${string}` }

            if (data.asset === "native-currency" || data.asset === "USDC") {
                assetParam = data.asset as "native-currency" | "USDC"
            } else {
                // For ERC20 tokens, we get the address from our TOKENS list and ensure it's in the correct format
                const tokenAddress = TOKENS[data.asset as keyof typeof TOKENS]?.address
                if (!tokenAddress) {
                    throw new Error(`Token address not found for ${data.asset}`)
                }
                assetParam = { erc20: tokenAddress as `0x${string}` }
            }

            // Call fundWallet with the form values
            fundWallet(walletAddress, {
                chain: base,
                amount: data.amount,
                asset: assetParam,
            })

        }
    }

    const handleCopy = async () => {
        if (!walletAddress) return

        await navigator.clipboard.writeText(walletAddress)
        setCopied(true)
        toast({
            title: "Address copied",
            description: "Wallet address copied to clipboard",
        })

        setTimeout(() => {
            setCopied(false)
        }, 2000)
    }

    const openExplorer = () => {
        if (!walletAddress) return
        window.open(`https://basescan.org/address/${walletAddress}`, "_blank")
    }

    if (!walletAddress) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
                <p className="text-lg text-center mb-4">Please connect your wallet to view your receiving address.</p>
            </div>
        )
    }

    return (
        <div className="max-w-md mx-auto">
            <header className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 text-transparent bg-clip-text">
                    Receive Tokens
                </h1>
                <p className="text-slate-500">Get tokens sent to your smart wallet</p>
            </header>

            <div className="p-6 border rounded-lg shadow-md bg-card relative overflow-hidden">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-teal-50 opacity-50 pointer-events-none" />

                <div className="relative">
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-8 w-8 bg-green-500/10 text-green-600 rounded-full flex items-center justify-center">
                                <Wallet className="h-4 w-4" />
                            </div>
                            <h3 className="text-lg font-semibold">Your Wallet</h3>
                        </div>

                        <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 mb-4">
                            <p className="text-amber-800 text-sm font-medium">
                                ⚠️ Only Base network is supported. Do not send tokens from other networks.
                            </p>
                        </div>

                        <p className="text-sm font-medium text-green-700 mb-2">Wallet Address</p>
                        <div className="flex items-center space-x-2 w-full">
                            <div className="flex-1 bg-green-50 p-3 rounded-md break-all overflow-hidden border border-green-100">
                                <p className="text-sm font-mono text-green-800">{walletAddress}</p>
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleCopy}
                                className="h-10 w-10 flex-shrink-0 border-green-100 hover:bg-green-50 hover:text-green-700"
                            >
                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={openExplorer}
                                className="h-10 w-10 flex-shrink-0 border-green-100 hover:bg-green-50 hover:text-green-700"
                            >
                                <ExternalLink className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-8 w-8 bg-green-500/10 text-green-600 rounded-full flex items-center justify-center">
                                <ArrowDownCircle className="h-4 w-4" />
                            </div>
                            <h3 className="text-lg font-semibold">Request Funds</h3>
                        </div>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-green-700">Amount</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="0.001"
                                                    type="number"
                                                    step="any"
                                                    {...field}
                                                    className="border-green-100 focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="asset"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-green-700">Asset</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="border-green-100 focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50">
                                                        <SelectValue placeholder="Select asset" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="native-currency">ETH</SelectItem>
                                                    <SelectItem value="USDC">USDC</SelectItem>
                                                    {/* Add ERC20 tokens from our token list */}
                                                    {Object.entries(TOKENS)
                                                        .filter(([symbol]) => symbol !== "USDC") // USDC already included above
                                                        .map(([symbol, token]) => (
                                                            <SelectItem key={symbol} value={symbol}>
                                                                {token.displaySymbol} ({symbol})
                                                            </SelectItem>
                                                        ))
                                                    }
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white shadow-sm transition-all duration-200"
                                >
                                    <QrCode className="mr-2 h-4 w-4" />
                                    Show QR Code & Receive Options
                                </Button>
                            </form>
                        </Form>
                    </div>

                    <div className="p-4 bg-green-50/50 rounded-lg border border-green-100">
                        <p className="font-medium text-green-700 mb-2">Instructions:</p>
                        <ol className="list-decimal list-inside space-y-1 text-sm text-green-600">
                            <li>Enter the amount and select the asset you want to receive</li>
                            <li>Use the button below to see your QR code</li>
                            <li>Share your address or QR code with the sender</li>
                            <li>Only request tokens on Base network</li>
                            <li>After receiving, tokens will appear in your wallet automatically</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    )
} 