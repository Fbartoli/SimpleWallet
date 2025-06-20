// Monerium API Types
// Based on https://monerium.dev/api-docs/v2#tag/ibans/operation/ibans

export interface IBAN {
    iban: string // ^(?:[A-Z]{2}[0-9]{2}(?:\s?[0-9A-Z]{4}){1,7}\s...
    bic: string // 8 or 11-character Bank Identifier Code
    profile: string // UUID format ^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab...
    address: string // ^0x[0-9a-fA-F]{40}$
    chain: "ethereum" | "gnosis" | "polygon" | "arbitrum" | "sepolia" | "chiado" | "amoy" | "arbitrum-sepolia"
}

export interface IBANsResponse {
    ibans: IBAN[]
}

export interface Profile {
    id: string
    name: string
    kyc: {
        state: "absent" | "pending" | "confirmed" | "rejected"
        outcome: "unknown" | "passed" | "failed"
    }
    accounts: Account[]
}

export interface Account {
    id: string
    address: string
    currency: "eur" | "gbp" | "usd" | "isk"
    chain: "ethereum" | "polygon" | "gnosis" | "linea" | "scroll" | "camino"
    network?: string
    iban?: string
    standard?: "iban"
}

export interface AuthContext {
    userId: string
    email: string
    name: string
    roles: string[]
    auth: {
        method: string
        subject: string
        verified: boolean
    }
    defaultProfile: string
    profiles: AuthProfile[]
}

export interface AuthProfile {
    id: string
    kind: "personal" | "corporate"
    name: string
    perms: ("read" | "write")[]
}

export interface Order {
    id: string
    kind: "redeem" | "issue"
    amount: string
    currency: "eur" | "gbp" | "usd" | "isk"
    totalAmount: string
    fees: Fee[]
    counterpart: Counterpart
    memo?: string
    address: string
    txHash?: string
    chain: "ethereum" | "polygon" | "gnosis" | "linea" | "scroll" | "camino"
    network: string
    accountId: string
    profileId: string
    state: "pending" | "placed" | "rejected" | "processed"
    createdAt: string
    updatedAt: string
}

export interface Fee {
    amount: string
    currency: "eur" | "gbp" | "usd" | "isk"
    description: string
}

export interface Counterpart {
    identifier: {
        standard: "iban" | "scan"
        iban?: string
        scan?: string
    }
    details: {
        firstName?: string
        lastName?: string
        name?: string
        country: string
    }
}

export interface Balance {
    amount: string
    currency: "eur" | "gbp" | "usd" | "isk"
    chain: "ethereum" | "polygon" | "gnosis" | "linea" | "scroll" | "camino"
    network: string
}

export interface Balances {
    [accountId: string]: Balance[]
}

export interface Token {
    currency: "eur" | "gbp" | "usd" | "isk"
    address: string
    chain: "ethereum" | "polygon" | "gnosis" | "linea" | "scroll" | "camino"
    network: string
    decimals: number
    symbol: string
    ticker: string
} 