'use client'

import { useState } from 'react'
import { getOnrampBuyUrl } from '@coinbase/onchainkit/fund'
import { Button } from './Button'
import { useForm } from 'react-hook-form'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/app/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/app/components/ui/select"
import { Input } from "@/app/components/ui/input"
import { useFundWallet } from '@privy-io/react-auth';
import { base } from 'viem/chains'

type FormValues = {
    asset: string
    amount: string
    fiatCurrency: string
}

const SUPPORTED_ASSETS = [
    { value: 'USDC', label: 'USD' },
    { value: 'EURC', label: 'EUR' },
    { value: 'ETH', label: 'Ethereum' },
    { value: 'WBTC', label: 'Wrapped Bitcoin' }
] as const

const SUPPORTED_CURRENCIES = [
    { value: 'USD', label: 'US Dollar' },
    { value: 'EUR', label: 'Euro' },
] as const

interface OnrampFormProps {
    userAddress: `0x${string}`
    projectId: string
}

export function OnrampForm({ userAddress, projectId }: OnrampFormProps) {
    const [onrampUrl, setOnrampUrl] = useState<string | null>(null)
    const { fundWallet } = useFundWallet();

    const form = useForm<FormValues>({
        defaultValues: {
            asset: 'USDC',
            amount: '0',
            fiatCurrency: 'USD'
        }
    })

    function onSubmit(values: FormValues) {
        console.log(values)
        const url = getOnrampBuyUrl({
            projectId,
            addresses: { [userAddress]: ['base'] },
            assets: [values.asset],
            presetCryptoAmount: Number(values.amount),
            fiatCurrency: 'EUR'
        })
        setOnrampUrl(url)
        openPopup({ url, height: 600, width: 400 })
        // fundWallet(userAddress, {
        //     chain: base,
        //     asset: { erc20: "0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42" },
        //     amount: values.amount,
        // });
        console.log(url)
    }

    type OpenPopupProps = {
        url: string;
        height: number;
        width: number;
        target?: string;
    };

    /**
     * Open a popup in the center of the screen with the specified size.
     */
    function openPopup({ url, target, height, width }: OpenPopupProps) {
        // Center the popup window in the screen
        const left = Math.round((window.screen.width - width) / 2);
        const top = Math.round((window.screen.height - height) / 2);

        const windowFeatures = `width=${width},height=${height},resizable,scrollbars=yes,status=1,left=${left},top=${top}`;
        return window.open(url, target, windowFeatures);
    }

    return (
        <div className="space-y-6 p-4 border rounded-lg bg-card">
            <h2 className="text-lg font-semibold">Buy Crypto</h2>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="asset"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Asset</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select asset to buy" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {SUPPORTED_ASSETS.map((asset) => (
                                            <SelectItem key={asset.value} value={asset.value}>
                                                {asset.label}
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
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Amount</FormLabel>
                                <FormControl>
                                    <Input type="number" min="1" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex flex-col gap-4">
                        <Button type="submit">
                            Buy
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
} 