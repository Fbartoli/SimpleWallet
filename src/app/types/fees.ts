import { type Address } from 'viem'

export interface FeeRecord {
  userId: string
  timestamp: number
  amount: string
  token: Address
  tokenSymbol: string
  transactionHash: string
}

export interface UserFees {
  [userId: string]: FeeRecord[]
} 