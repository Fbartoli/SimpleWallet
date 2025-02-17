import { ActionResponse } from '@/types/actions'

export interface UserTier {
  id: string // did:privy:userID
  tier: TierType
  createdAt: Date
}

export type TierType = 'default' | 'early_user'

export interface TierConfig {
  name: TierType
  feeBps: number
  description: string
}

export interface GetUserTierResponse extends ActionResponse {
  data?: {
    tier: TierType
    feeBps: number
  }
}

export interface UpdateUserTierRequest {
  userId: string
  tier: TierType
}

export interface UpdateUserTierResponse extends ActionResponse {
  data?: {
    updated: boolean
  }
}

export interface TierService {
  getUserTier: (userId: string) => Promise<TierType>
  getFeeBps: (userId: string) => Promise<number>
} 