'use client'

import { useState } from 'react'
import { getOnrampBuyUrl } from '@coinbase/onchainkit/fund'
import { Button } from './Button'
import { useForm } from 'react-hook-form'
import { CreditCard, Loader2 } from 'lucide-react'
import {
    Form,
} from "@/app/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/app/components/ui/select"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"

type FormValues = {
    asset: string
    amount: string
    fiatCurrency: string
}

const SUPPORTED_ASSETS = [
    { value: 'USDC', label: 'USD' },
] as const


interface OnrampFormProps {
    userAddress: `0x${string}`
    projectId: string
}

export function OnrampForm({ userAddress, projectId }: OnrampFormProps) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [onrampUrl, setOnrampUrl] = useState<string | null>(null)

    const form = useForm<FormValues>({
        defaultValues: {
            asset: 'USDC',
            amount: '0',
            fiatCurrency: 'USD'
        }
    })

    const [isSubmitting, setIsSubmitting] = useState(false)

    function onSubmit(values: FormValues) {
        setIsSubmitting(true)
        try {
            const url = getOnrampBuyUrl({
                projectId,
                addresses: { [userAddress]: ['base'] },
                assets: [values.asset],
                presetCryptoAmount: Number(values.amount),
                fiatCurrency: 'EUR'
            })
            setOnrampUrl(url)
            openPopup({ url, height: 600, width: 400 })
        } catch (error) {
            console.error('Error opening onramp:', error)
        } finally {
            setIsSubmitting(false)
        }
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
        <div className="p-6 border rounded-lg shadow-md bg-card relative overflow-hidden min-h-[500px] flex flex-col">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-teal-50 opacity-50 pointer-events-none" />

            <div className="relative flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-8 w-8 bg-green-500/10 text-green-600 rounded-full flex items-center justify-center">
                        <CreditCard className="h-4 w-4" />
                    </div>
                    <h2 className="text-lg font-semibold">Buy Crypto</h2>
                </div>

                <div className="mb-6 p-3 bg-green-50 border border-green-100 rounded-lg flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p className="text-sm text-green-800">
                        <span className="font-medium">Zero fees on USD deposits!</span> Buy crypto instantly without any additional charges.
                    </p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                        <div>
                            <Label htmlFor="amount">Amount</Label>
                            <div className="relative mt-1.5">
                                <Input
                                    id="amount"
                                    type="number"
                                    min="1"
                                    max="1000"
                                    step="1"
                                    {...form.register("amount")}
                                    className="pr-12 border-green-100 focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                                    required
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <span className="text-sm text-muted-foreground">USD</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="token">Receive</Label>
                            <Select
                                value={form.watch("asset")}
                                onValueChange={(value) => form.setValue("asset", value)}
                            >
                                <SelectTrigger id="token" className="w-full border-green-100 focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50">
                                    <SelectValue placeholder="Select token" />
                                </SelectTrigger>
                                <SelectContent>
                                    {SUPPORTED_ASSETS.map((asset) => (
                                        <SelectItem key={asset.value} value={asset.value} className="flex items-center gap-2">
                                            <div className="flex items-center gap-2">
                                                {/* Add your token icon here */}
                                                {/* For example: <img src={asset.icon} alt={asset.label} className="h-4 w-4 mr-2" /> */}
                                                <span>{asset.label}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </form>
                </Form>

                <div className="mt-auto pt-8">
                    <Button
                        type="submit"
                        onClick={form.handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                        className="w-full h-10 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white shadow-md hover:shadow-lg transition-all"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            'Buy Crypto'
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
} 