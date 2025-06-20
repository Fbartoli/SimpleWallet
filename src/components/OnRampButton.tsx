"use client"

import { useFundWallet, usePrivy } from "@privy-io/react-auth"
import { Button } from "@/components/ui/button"
import { CreditCard, Loader2, Wallet } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { base } from "viem/chains"

interface OnRampButtonProps {
    /**
     * Pre-fill amount for the on-ramp flow
     */
    amount?: string
    /**
     * Asset to buy - 'native-currency' for ETH, 'USDC', or ERC20 token address
     */
    asset?: "native-currency" | "USDC" | { erc20: `0x${string}` }
    /**
     * Button variant
     */
    variant?: "default" | "outline" | "ghost" | "destructive" | "secondary"
    /**
     * Button size
     */
    size?: "default" | "sm" | "lg" | "icon"
    /**
     * Custom class name
     */
    className?: string
    /**
     * Button text override
     */
    children?: React.ReactNode
    /**
     * Whether the button should be full width
     */
    fullWidth?: boolean
    /**
     * Disabled state
     */
    disabled?: boolean
}

export function OnRampButton({
    amount = "50",
    asset = "native-currency",
    variant = "default",
    size = "default",
    className = "",
    children,
    fullWidth = false,
    disabled = false,
}: OnRampButtonProps) {
    const { user, ready } = usePrivy()
    const { fundWallet } = useFundWallet()
    const { toast } = useToast()

    const walletAddress = user?.smartWallet?.address

    const handleOnRamp = () => {
        if (!walletAddress) {
            toast({
                title: "Wallet not connected",
                description: "Please connect your wallet first",
                variant: "destructive",
            })
            return
        }

        try {
            fundWallet(walletAddress, {
                chain: base,
                amount,
                asset,
            })
        } catch (error) {
            console.error("On-ramp error:", error)
            toast({
                title: "On-ramp failed",
                description: "Failed to initiate on-ramp flow. Please try again.",
                variant: "destructive",
            })
        }
    }

    const isDisabled = disabled || !ready || !walletAddress

    const buttonContent = children || (
        <>
            <CreditCard className="mr-2 h-4 w-4" />
            Buy Crypto
        </>
    )

    const loadingContent = (
        <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
        </>
    )

    if (!ready) {
        return (
            <Button
                variant={variant}
                size={size}
                className={`${fullWidth ? "w-full" : ""} ${className}`}
                disabled
            >
                {loadingContent}
            </Button>
        )
    }

    if (!walletAddress) {
        return (
            <Button
                variant="outline"
                size={size}
                className={`${fullWidth ? "w-full" : ""} ${className} border-amber-200 text-amber-700 hover:bg-amber-50`}
                disabled
            >
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet First
            </Button>
        )
    }

    return (
        <Button
            onClick={handleOnRamp}
            variant={variant}
            size={size}
            className={`${fullWidth ? "w-full" : ""} ${className}`}
            disabled={isDisabled}
        >
            {buttonContent}
        </Button>
    )
}

export function OnRampETHButton(props: Omit<OnRampButtonProps, "asset">) {
    return (
        <OnRampButton
            {...props}
            asset="native-currency"
        >
            <CreditCard className="mr-2 h-4 w-4" />
            Buy ETH
        </OnRampButton>
    )
}

export function OnRampUSDCButton(props: Omit<OnRampButtonProps, "asset">) {
    return (
        <OnRampButton
            {...props}
            asset="USDC"
        >
            <CreditCard className="mr-2 h-4 w-4" />
            Get USDC
        </OnRampButton>
    )
}

// Quick buy button with preset amounts
export function QuickBuyButton({
    amount,
    asset = "native-currency",
    ...props
}: { amount: string; asset?: OnRampButtonProps["asset"] } & Omit<OnRampButtonProps, "amount" | "asset">) {
    const assetName = asset === "native-currency" ? "ETH" : asset === "USDC" ? "USDC" : "Token"

    return (
        <OnRampButton
            {...props}
            amount={amount}
            asset={asset}
            size="sm"
            variant="outline"
        >
            <CreditCard className="mr-1 h-3 w-3" />
            ${amount} {assetName}
        </OnRampButton>
    )
} 