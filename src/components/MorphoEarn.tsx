"use client"

import { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets"
import { useToast } from "@/components/ui/use-toast"
import { SUPPORTED_TOKENS, type TokenSymbol } from "@/config/constants"
import { useTokenBalances } from "@/hooks/useTokenBalances"
import { useActivityRefresh } from "@/contexts/ActivityContext"
import { encodeFunctionData, erc20Abi, formatUnits, parseUnits } from "viem"
import { useReadContract } from "wagmi"
import { ExternalLink, Info, Loader2, TrendingUp } from "lucide-react"
import { useTranslations } from "@/hooks/useTranslations"

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

// Morpho Vault configurations
const MORPHO_VAULTS = {
    USDC: {
        address: "0xc1256Ae5FF1cf2719D4937adb3bbCCab2E00A2Ca" as const,
        asset: "USDC" as TokenSymbol,
        name: "Morpho USDC Vault",
        description: "Earn yield on USDC through Morpho's lending markets",
    },
    EURC: {
        address: "0xBeEF086b8807Dc5E5A1740C5E3a7C4c366eA6ab5" as const,
        asset: "EURC" as TokenSymbol,
        name: "Morpho EURC Vault",
        description: "Earn yield on EURC through Morpho's lending markets",
    },
} as const

// ERC4626 Vault ABI (essential functions)
const VAULT_ABI = [
    {
        name: "asset",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ name: "", type: "address" }],
    },
    {
        name: "totalAssets",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ name: "", type: "uint256" }],
    },
    {
        name: "balanceOf",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "account", type: "address" }],
        outputs: [{ name: "", type: "uint256" }],
    },
    {
        name: "convertToAssets",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "shares", type: "uint256" }],
        outputs: [{ name: "", type: "uint256" }],
    },
    {
        name: "deposit",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
            { name: "assets", type: "uint256" },
            { name: "receiver", type: "address" },
        ],
        outputs: [{ name: "", type: "uint256" }],
    },
    {
        name: "withdraw",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
            { name: "assets", type: "uint256" },
            { name: "receiver", type: "address" },
            { name: "owner", type: "address" },
        ],
        outputs: [{ name: "", type: "uint256" }],
    },
] as const

interface EarnFormValues {
    vault: keyof typeof MORPHO_VAULTS
    amount: string
    action: "deposit" | "withdraw"
}

interface VaultData {
    apy: number
    netApy: number
    netApyWithoutRewards: number
    dailyApy: number
    dailyNetApy: number
    tvlUsd: string
    totalAssets: string
    sharePrice: string
    sharePriceUsd: string
    rewards: Array<{
        asset: {
            address: string
        }
        supplyApr: number
        yearlySupplyTokens: string
    }>
    underlyingYield: number
}

interface AllVaultsData {
    [vaultKey: string]: {
        apy: number
        tvlUsd: string
        loading: boolean
    }
}

interface MorphoVaultPosition {
    vault: {
        address: string
    }
    assets?: string
    assetsUsd?: string
    shares?: string
}

interface MorphoVaultData {
    address: string
    asset?: {
        yield?: {
            apr?: number
        }
    }
    state: {
        apy?: number
        netApy?: number
        netApyWithoutRewards?: number
        dailyApy?: number
        dailyNetApy?: number
        totalAssets?: string
        totalAssetsUsd?: string
        sharePrice?: string
        sharePriceUsd?: string
        rewards?: Array<{
            asset: {
                address: string
            }
            supplyApr: number
            yearlySupplyTokens: string
        }>
    }
}

export function MorphoEarn({ userAddress }: { userAddress: string }) {
    const { client } = useSmartWallets()
    const { toast } = useToast()
    const { refreshActivity } = useActivityRefresh()
    const [isLoading, setIsLoading] = useState(false)
    const [vaultData, setVaultData] = useState<VaultData>({
        apy: 0,
        netApy: 0,
        netApyWithoutRewards: 0,
        dailyApy: 0,
        dailyNetApy: 0,
        tvlUsd: "0",
        totalAssets: "0",
        sharePrice: "1.0",
        sharePriceUsd: "1.0",
        rewards: [],
        underlyingYield: 0,
    })
    const [allVaultsData, setAllVaultsData] = useState<AllVaultsData>({})
    const { morpho } = useTranslations()

    const {
        storeBalances,
        refresh,
        optimisticUpdate,
        applyOptimisticSwap,
        revertOptimisticSwap,
        confirmOptimisticSwap,
    } = useTokenBalances(userAddress)

    const [_txHash, setTxHash] = useState<string | null>(null)
    const [isPending, setIsPending] = useState(false)

    const form = useForm<EarnFormValues>({
        defaultValues: {
            vault: "USDC",
            amount: "",
            action: "deposit",
        },
    })

    const { watch, setValue } = form
    const selectedVault = watch("vault")
    const amount = watch("amount")
    const action = watch("action")

    // Get vault data
    const vaultConfig = MORPHO_VAULTS[selectedVault]
    const vaultAddress = vaultConfig.address
    const token = SUPPORTED_TOKENS[vaultConfig.asset]

    // Get totalAssets from GraphQL data instead of blockchain query
    const totalAssets = vaultData.totalAssets ? BigInt(vaultData.totalAssets) : undefined

    // User vault positions from GraphQL API
    const [userVaultPositions, setUserVaultPositions] = useState<Record<string, {
        assets: string
        assetsUsd: string
        shares: string
    }>>({})

    // Fetch user vault positions from Morpho GraphQL API
    const fetchUserVaultPositions = useCallback(async () => {
        try {
            const response = await fetch("https://api.morpho.org/graphql", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    query: `
                        query GetUserVaultPositions($address: String!, $chainId: Int!) {
                            userByAddress(address: $address, chainId: $chainId) {
                                address
                                vaultPositions {
                                    vault {
                                        address
                                        name
                                    }
                                    assets
                                    assetsUsd
                                    shares
                                }
                            }
                        }
                    `,
                    variables: {
                        address: userAddress,
                        chainId: 8453, // Base chain
                    },
                }),
            })

            if (response.ok) {
                const data = await response.json()
                const positions = data.data?.userByAddress?.vaultPositions || []

                // Transform positions into a lookup object by vault address
                const positionsLookup: Record<string, {
                    assets: string
                    assetsUsd: string
                    shares: string
                }> = {}

                positions.forEach((position: MorphoVaultPosition) => {
                    positionsLookup[position.vault.address.toLowerCase()] = {
                        assets: position.assets || "0",
                        assetsUsd: position.assetsUsd || "0",
                        shares: position.shares || "0",
                    }
                })

                setUserVaultPositions(positionsLookup)
            }
        } catch (error) {
            console.error("Error fetching user vault positions:", error)
        }
    }, [userAddress])

    // Get current user position for selected vault
    const currentUserPosition = userVaultPositions[vaultAddress.toLowerCase()]
    const userAssets = currentUserPosition ? BigInt(currentUserPosition.assets) : 0n

    // Check current allowance for the vault
    const { data: currentAllowance } = useReadContract({
        address: token?.address as `0x${string}`,
        abi: erc20Abi,
        functionName: "allowance",
        args: [userAddress as `0x${string}`, vaultAddress],
        chainId: 8453,
        query: {
            enabled: Boolean(token?.address),
        },
    })

    // Fetch all vaults data from Morpho GraphQL API
    const fetchAllVaultsData = useCallback(async () => {
        const addresses = Object.values(MORPHO_VAULTS).map(vault => vault.address.toLowerCase())

        try {
            const response = await fetch("https://api.morpho.org/graphql", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    query: `
                        query GetAllVaults($addresses: [String!]!) {
                            vaults(where: { address_in: $addresses }) {
                                items {
                                    address
                                    asset {
                                        yield {
                                            apr
                                        }
                                    }
                                    state {
                                        apy
                                        netApy
                                        netApyWithoutRewards
                                        dailyApy
                                        dailyNetApy
                                        totalAssets
                                        totalAssetsUsd
                                        sharePrice
                                        sharePriceUsd
                                        rewards {
                                            asset {
                                                address
                                            }
                                            supplyApr
                                            yearlySupplyTokens
                                        }
                                    }
                                }
                            }
                        }
                    `,
                    variables: { addresses },
                }),
            })

            if (response.ok) {
                const data = await response.json()
                const vaults = data.data?.vaults?.items || []

                // Update all vaults data
                const newAllVaultsData: AllVaultsData = {}
                vaults.forEach((vault: MorphoVaultData) => {
                    const vaultKey = Object.entries(MORPHO_VAULTS).find(
                        ([_, config]) => config.address.toLowerCase() === vault.address.toLowerCase()
                    )?.[0]

                    if (vaultKey) {
                        newAllVaultsData[vaultKey] = {
                            apy: (vault.state.dailyApy || vault.state.apy || 0) * 100,
                            tvlUsd: vault.state.totalAssetsUsd || "0",
                            loading: false,
                        }
                    }
                })
                setAllVaultsData(newAllVaultsData)

                // Update selected vault detailed data
                const selectedVault = vaults.find((vault: MorphoVaultData) =>
                    vault.address.toLowerCase() === vaultAddress.toLowerCase()
                )
                if (selectedVault) {
                    setVaultData({
                        apy: selectedVault.state.apy || 0,
                        netApy: selectedVault.state.netApy || 0,
                        netApyWithoutRewards: selectedVault.state.netApyWithoutRewards || 0,
                        dailyApy: selectedVault.state.dailyApy || 0,
                        dailyNetApy: selectedVault.state.dailyNetApy || 0,
                        tvlUsd: selectedVault.state.totalAssetsUsd || "0",
                        totalAssets: selectedVault.state.totalAssets || "0",
                        sharePrice: selectedVault.state.sharePrice || "1.0",
                        sharePriceUsd: selectedVault.state.sharePriceUsd || "1.0",
                        rewards: selectedVault.state.rewards || [],
                        underlyingYield: selectedVault.asset?.yield?.apr || 0,
                    })
                }
            }
        } catch (error) {
            console.error("Error fetching vaults data:", error)
        }
    }, [vaultAddress])


    // Initialize vault data loading states
    useEffect(() => {
        const initialVaultData: AllVaultsData = {}
        Object.keys(MORPHO_VAULTS).forEach(key => {
            initialVaultData[key] = {
                apy: 0,
                tvlUsd: "0",
                loading: true,
            }
        })
        setAllVaultsData(initialVaultData)
    }, [])

    // Fetch data on component mount and vault change
    useEffect(() => {
        fetchAllVaultsData()
        fetchUserVaultPositions()
    }, [selectedVault, userAddress, fetchAllVaultsData, fetchUserVaultPositions])

    const handleMaxClick = () => {
        if (action === "deposit") {
            const balance = storeBalances[vaultConfig.asset]
            if (balance && balance.value > 0n) {
                setValue("amount", balance.formatted)
            }
        } else {
            if (userAssets && userAssets > 0n) {
                const token = SUPPORTED_TOKENS[vaultConfig.asset]
                if (token) {
                    setValue("amount", formatUnits(userAssets, token.decimals))
                }
            }
        }
    }

    const executeTransaction = async () => {
        if (!client) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Smart wallet not connected",
            })
            return
        }

        if (!token) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Unsupported token",
            })
            return
        }

        setIsLoading(true)
        setIsPending(true)
        const amountBigInt = parseUnits(amount, token.decimals)

        try {
            let txHash: string

            if (action === "deposit") {
                // Apply optimistic update
                applyOptimisticSwap(vaultConfig.asset, vaultConfig.asset, amountBigInt, 0n)

                toast({
                    title: morpho("depositProcessing"),
                    description: `${morpho("deposit")} ${amount} ${token.displaySymbol}...`,
                })

                // Prepare transaction calls
                const calls = []

                // Check if approval is needed for deposit
                if ((currentAllowance ?? 0n) < amountBigInt) {
                    calls.push({
                        to: token.address as `0x${string}`,
                        data: encodeFunctionData({
                            abi: erc20Abi,
                            functionName: "approve",
                            args: [vaultAddress, amountBigInt],
                        }),
                        value: 0n,
                    })
                }

                // Add deposit transaction
                calls.push({
                    to: vaultAddress,
                    data: encodeFunctionData({
                        abi: VAULT_ABI,
                        functionName: "deposit",
                        args: [amountBigInt, userAddress as `0x${string}`],
                    }),
                    value: 0n,
                })

                // Execute the transaction(s)
                txHash = await client.sendTransaction({ calls })
            } else {
                toast({
                    title: morpho("withdrawalProcessing"),
                    description: `${morpho("withdraw")} ${amount} ${token.displaySymbol}...`,
                })

                // Withdraw from vault using Privy
                txHash = await client.sendTransaction({
                    to: vaultAddress,
                    data: encodeFunctionData({
                        abi: VAULT_ABI,
                        functionName: "withdraw",
                        args: [
                            amountBigInt,
                            userAddress as `0x${string}`,
                            userAddress as `0x${string}`,
                        ],
                    }),
                })
            }

            setTxHash(txHash)

            // Transaction submitted successfully

            // Refresh data after transaction
            refresh()
            fetchAllVaultsData()
            fetchUserVaultPositions()

            toast({
                title: action === "deposit" ? morpho("depositSuccessful") : morpho("withdrawalSuccessful"),
                description: `Successfully ${action === "deposit" ? "deposited" : "withdrawn"} ${amount} ${token.displaySymbol}`,
            })

            // Clear form
            setValue("amount", "")

            // Confirm optimistic update
            confirmOptimisticSwap()

            // Refresh activity feed
            setTimeout(() => {
                refreshActivity()
            }, 2000)

        } catch (error) {
            // Revert optimistic update on failure
            if (action === "deposit") {
                revertOptimisticSwap()
            }

            const message = error instanceof Error ? error.message : "Transaction failed"
            toast({
                variant: "destructive",
                title: action === "deposit" ? morpho("depositFailed") : morpho("withdrawalFailed"),
                description: message,
            })
        } finally {
            setIsLoading(false)
            setIsPending(false)
        }
    }

    const hasPosition = userAssets && userAssets > 0n
    const isTransacting = isPending || isLoading

    // Format vault data with null checks
    const formattedVaultData = {
        // Use dailyApy to show daily native APY
        // Multiply by 100 to convert from decimal to percentage
        apy: (vaultData.dailyApy || vaultData.apy || 0.052) * 100,
        tvl: totalAssets && token ? formatUnits(totalAssets, token.decimals) : vaultData.totalAssets || "0",
        userPosition: userAssets && token ? formatUnits(userAssets, token.decimals) : "0",
        sharePrice: vaultData.sharePrice || "1.000000",
        sharePriceUsd: vaultData.sharePriceUsd || "1.000000",
    }

    // Get token safely
    if (!token) {
        return (
            <div className="p-6 border rounded-lg shadow-md bg-card">
                <div className="text-red-600">Unsupported token: {vaultConfig.asset}</div>
            </div>
        )
    }

    return (
        <div className="p-6 border rounded-lg shadow-md bg-card relative overflow-hidden min-h-[600px] flex flex-col">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-blue-50 opacity-50 pointer-events-none" />

            <div className="relative flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-8 w-8 bg-purple-500/10 text-purple-600 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-4 w-4" />
                    </div>
                    <h2 className="text-lg font-semibold">{morpho("earn")}</h2>
                </div>

                {/* Vault Selection & Info */}
                <div className="mb-6">
                    <Form {...form}>
                        {/* Vault Selection Grid */}
                        <div className="mb-4">
                            <FormLabel className="text-base font-medium mb-3 block">{morpho("selectVault")}</FormLabel>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                {Object.entries(MORPHO_VAULTS).map(([key, vault]) => {
                                    const vaultData = allVaultsData[key]
                                    const isSelected = selectedVault === key

                                    return (
                                        <div
                                            key={key}
                                            onClick={() => setValue("vault", key as keyof typeof MORPHO_VAULTS)}
                                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${isSelected
                                                ? "border-purple-500 bg-purple-50"
                                                : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/50"
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-semibold text-sm">{vault.name}</h3>
                                                {vaultData && (
                                                    <div className="text-right">
                                                        <div className="text-xs text-gray-500">{morpho("apy")}</div>
                                                        <div className="font-bold text-green-600">
                                                            {vaultData.loading ? "..." : `${vaultData.apy.toFixed(2)}%`}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center text-xs text-gray-600">
                                                <span>{vault.asset}</span>
                                                {vaultData && (
                                                    <span>
                                                        ${Number(vaultData.tvlUsd).toLocaleString()} TVL
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            <FormField
                                name="action"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Action</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="deposit">{morpho("deposit")}</SelectItem>
                                                <SelectItem value="withdraw" disabled={!hasPosition}>
                                                    {morpho("withdraw")} {!hasPosition && "(No position)"}
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </Form>

                    {/* Vault Info Card */}
                    <div className="bg-white/80 rounded-lg p-4 border border-purple-100">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <div className="text-gray-500">{morpho("apy")} (daily native)</div>
                                <div className="font-semibold text-green-600">
                                    {formattedVaultData.apy.toFixed(2)}%
                                </div>
                            </div>
                            <div>
                                <div className="text-gray-500">{morpho("tvl")}</div>
                                <div className="font-semibold">
                                    ${vaultData.tvlUsd ? Number(vaultData.tvlUsd).toLocaleString() : Number(formattedVaultData.tvl).toLocaleString()}
                                </div>
                            </div>
                            <div>
                                <div className="text-gray-500">{morpho("yourPosition")}</div>
                                <div className="font-semibold">
                                    {Number(formattedVaultData.userPosition).toFixed(4)} {token.displaySymbol}
                                </div>
                            </div>
                            <div>
                                <div className="text-gray-500">{morpho("sharePrice")}</div>
                                <div className="font-semibold">
                                    ${Number(formattedVaultData.sharePriceUsd).toFixed(6)}
                                </div>
                            </div>
                        </div>


                    </div>
                </div>

                {/* Amount Input */}
                <Form {...form}>
                    <FormField
                        name="amount"
                        render={({ field }) => (
                            <FormItem className="mb-6">
                                <FormLabel>
                                    {action === "deposit" ? morpho("depositAmount") : morpho("withdrawAmount")}
                                </FormLabel>
                                <div className="relative">
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="any"
                                            min="0"
                                            placeholder="0.00"
                                            {...field}
                                            className="pr-16"
                                        />
                                    </FormControl>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2.5 text-xs font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                        onClick={handleMaxClick}
                                    >
                                        Max
                                    </Button>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </Form>

                {/* Transaction Button */}
                <Button
                    onClick={executeTransaction}
                    disabled={isTransacting || !amount || Number(amount) <= 0}
                    className="mb-6 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all h-10"
                >
                    {isTransacting ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Processing...</span>
                        </div>
                    ) : (
                        `${action === "deposit" ? morpho("deposit") : morpho("withdraw")} ${token.displaySymbol}`
                    )}
                </Button>


                {/* Info Section */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-800">
                            <div className="font-medium mb-1">{morpho("howItWorks")}</div>
                            <ul className="space-y-1 text-blue-700">
                                <li>• Deposit assets into curated Morpho vaults</li>
                                <li>• Earn yield from lending markets automatically</li>
                                <li>• Receive additional reward tokens from various programs</li>
                                <li>• Withdraw anytime with accrued yield</li>
                            </ul>
                            <div className="mt-2">
                                <a
                                    href="https://docs.morpho.org/earn"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    {morpho("learnMore")} <ExternalLink className="h-3 w-3" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Optimistic Update Indicator */}
                {optimisticUpdate.isActive && (
                    <div className="mt-4 flex items-center gap-2 p-3 bg-blue-50 text-blue-800 rounded-lg border border-blue-200">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm font-medium">Transaction pending - updating positions...</span>
                    </div>
                )}
            </div>
        </div>
    )
} 