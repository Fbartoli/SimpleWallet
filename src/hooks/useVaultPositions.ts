"use client"

import { useCallback, useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { BALANCE_REFETCH_INTERVAL } from "@/config/constants"

export interface VaultPosition {
    vaultAddress: string
    vaultName: string
    assets: string
    assetsUsd: string
    shares: string
}

export interface VaultPositionsResponse {
    positions: VaultPosition[]
    totalUsdValue: number
    isLoading: boolean
    error: string | null
    refetch: () => void
}

const fetchVaultPositions = async (userAddress: string): Promise<VaultPosition[]> => {
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

    if (!response.ok) {
        throw new Error(`Failed to fetch vault positions: ${response.status}`)
    }

    const data = await response.json()

    if (data.errors) {
        throw new Error(`GraphQL errors: ${data.errors.map((e: any) => e.message).join(", ")}`)
    }

    const positions = data.data?.userByAddress?.vaultPositions || []

    return positions.map((position: any) => ({
        vaultAddress: position.vault.address.toLowerCase(),
        vaultName: position.vault.name,
        assets: position.assets || "0",
        assetsUsd: position.assetsUsd || "0",
        shares: position.shares || "0",
    }))
}

export function useVaultPositions(userAddress: string): VaultPositionsResponse {
    const [error, setError] = useState<string | null>(null)

    const query = useQuery({
        queryKey: ["vaultPositions", userAddress],
        queryFn: () => fetchVaultPositions(userAddress),
        enabled: Boolean(userAddress),
        refetchInterval: BALANCE_REFETCH_INTERVAL || 30000, // 30 seconds default
        staleTime: 15000, // 15 seconds
        retry: (failureCount, error) => {
            // Don't retry on client errors (4xx), but retry on server errors
            if (error instanceof Error && error.message.includes("status: 4")) {
                return false
            }
            return failureCount < 3
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    })

    useEffect(() => {
        if (query.error) {
            setError(query.error.message)
        } else {
            setError(null)
        }
    }, [query.error])

    const totalUsdValue = query.data?.reduce((total, position) => {
        return total + Number(position.assetsUsd)
    }, 0) || 0

    const refetch = useCallback(() => {
        setError(null)
        return query.refetch()
    }, [query])

    return {
        positions: query.data || [],
        totalUsdValue,
        isLoading: query.isLoading,
        error,
        refetch,
    }
} 