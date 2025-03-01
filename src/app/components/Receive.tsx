'use client';

import { useState } from 'react';
import { usePrivy, useFundWallet } from '@privy-io/react-auth';
import { Button } from './ui/button';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { useToast } from './ui/use-toast';
import { base } from 'viem/chains';
import { TOKENS } from '@/app/stores/useTokenStore';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "./ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { useForm } from 'react-hook-form';

// Define our form values type
type FormValues = {
    amount: string;
    asset: string;
};

export default function Receive() {
    const { user } = usePrivy();
    const { fundWallet } = useFundWallet();
    const { toast } = useToast();
    const walletAddress = user?.smartWallet?.address;
    const [copied, setCopied] = useState(false);

    // Setup form with react-hook-form without zod
    const form = useForm<FormValues>({
        defaultValues: {
            amount: "0.001",
            asset: "native-currency"
        }
    });

    const onSubmit = (data: FormValues) => {
        if (walletAddress) {
            // Determine asset format based on selection
            let assetParam: 'native-currency' | 'USDC' | { erc20: `0x${string}` };

            if (data.asset === 'native-currency' || data.asset === 'USDC') {
                assetParam = data.asset as 'native-currency' | 'USDC';
            } else {
                // For ERC20 tokens, we get the address from our TOKENS list and ensure it's in the correct format
                const tokenAddress = TOKENS[data.asset as keyof typeof TOKENS]?.address;
                assetParam = { erc20: tokenAddress };
            }

            // Call fundWallet with the form values
            fundWallet(walletAddress, {
                chain: base,
                amount: data.amount,
                asset: assetParam
            });

            toast({
                title: "Request initiated",
                description: `Requested ${data.amount} ${data.asset} to your wallet`,
            });
        }
    };

    const handleCopy = async () => {
        if (!walletAddress) return;

        await navigator.clipboard.writeText(walletAddress);
        setCopied(true);
        toast({
            title: "Address copied",
            description: "Wallet address copied to clipboard",
        });

        setTimeout(() => {
            setCopied(false);
        }, 2000);
    };

    const openExplorer = () => {
        if (!walletAddress) return;
        window.open(`https://basescan.org/address/${walletAddress}`, '_blank');
    };

    if (!walletAddress) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
                <p className="text-lg text-center mb-4">Please connect your wallet to view your receiving address.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-md mx-auto">
                <h1 className="text-3xl font-bold mb-6">Receive Tokens</h1>

                <div className="p-6 bg-white rounded-lg border shadow-sm">
                    <div className="mb-6">
                        <div className="bg-yellow-100 p-4 rounded-md mb-6 border border-yellow-200">
                            <p className="text-yellow-800 text-sm font-medium">
                                ⚠️ Only Base network is supported. Do not send tokens from other networks.
                            </p>
                        </div>

                        <p className="text-sm font-medium text-gray-500 mb-2">Your Wallet Address</p>
                        <div className="flex items-center space-x-2 w-full">
                            <div className="flex-1 bg-gray-100 p-3 rounded-md break-all overflow-hidden">
                                <p className="text-sm font-mono">{walletAddress}</p>
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleCopy}
                                className="h-10 w-10 flex-shrink-0"
                            >
                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={openExplorer}
                                className="h-10 w-10 flex-shrink-0"
                            >
                                <ExternalLink className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mb-6">
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="0.001"
                                                type="number"
                                                step="any"
                                                {...field}
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
                                        <FormLabel>Asset</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select asset" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="native-currency">ETH (Native)</SelectItem>
                                                <SelectItem value="USDC">USDC</SelectItem>
                                                {/* Add ERC20 tokens from our token list */}
                                                {Object.entries(TOKENS)
                                                    .filter(([symbol]) => symbol !== 'USDC') // USDC already included above
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

                            <Button type="submit" className="w-full">
                                Show QR Code & Receive Options
                            </Button>
                        </form>
                    </Form>

                    <div className="text-sm text-gray-500">
                        <p className="font-medium mb-1">Instructions:</p>
                        <ol className="list-decimal list-inside space-y-1">
                            <li>Enter the amount and select the asset you want to receive</li>
                            <li>Click &quot;Show QR Code & Receive Options&quot; to see your QR code</li>
                            <li>Share your address or QR code with the sender</li>
                            <li>Only request tokens on Base network</li>
                            <li>After receiving, tokens will appear in your wallet automatically</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
} 