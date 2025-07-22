"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
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

interface GraphQLError {
    message: string
    status?: string
}

interface GraphQLVaultPosition {
    vault: {
        address: string
        name: string
    }
    assets?: string
    assetsUsd?: string
    shares?: string
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
                            state {
                                assets
                                assetsUsd
                                shares
                            }
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
    console.log("data", data)
    // Handle GraphQL errors, but treat "NOT_FOUND" as valid empty result
    if (data.errors) {
        const notFoundError = data.errors.find((error: GraphQLError) =>
            error.message === "No results matching given parameters" &&
            error.status === "NOT_FOUND"
        )

        // If it's just a "NOT_FOUND" error, return empty array (user has no positions)
        if (notFoundError && data.errors.length === 1) {
            return []
        }

        // For other errors, throw
        throw new Error(`GraphQL errors: ${data.errors.map((e: GraphQLError) => e.message).join(", ")}`)
    }

    const positions: GraphQLVaultPosition[] = data.data?.userByAddress?.vaultPositions || []

    return positions.map((position: GraphQLVaultPosition) => ({
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

    // Memoize positions to prevent new array references when data hasn't changed
    const positions = useMemo(() => {
        return query.data || []
    }, [query.data])

    const totalUsdValue = useMemo(() => {
        return positions.reduce((total, position) => {
            return total + Number(position.assetsUsd)
        }, 0)
    }, [positions])

    const refetch = useCallback(() => {
        setError(null)
        return query.refetch()
    }, [query])

    return {
        positions,
        totalUsdValue,
        isLoading: query.isLoading,
        error,
        refetch,
    }
} 