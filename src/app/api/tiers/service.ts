import { TierType } from '@/app/types/tiers'
import { EARLY_USERS, TIER_CONFIGS } from './config'

export function createTierService() {
  return {
    async getUserTier(userId: string): Promise<TierType> {
      if (!userId) return 'default'
      return EARLY_USERS.includes(userId) ? 'early_user' : 'default'
    },

    async getFeeBps(userId: string): Promise<number> {
      const tier = await this.getUserTier(userId)
      return TIER_CONFIGS[tier].feeBps
    }
  }
}

// Export singleton instance
export const tierService = createTierService() 