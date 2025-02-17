import { TierService, TierType } from '../types/tiers'
import { EARLY_USERS, TIER_CONFIGS } from '../config/tiers'

export function createTierService(): TierService {
  return {
    async getUserTier(userId: string): Promise<TierType> {
      if (!userId) return 'default'
      
      // Check if user is in early users list
      if (EARLY_USERS.includes(userId)) {
        return 'early_user'
      }
      
      return 'default'
    },

    async getFeeBps(userId: string): Promise<number> {
      const tier = await this.getUserTier(userId)
      return TIER_CONFIGS[tier].feeBps
    }
  }
}

// Export singleton instance
export const tierService = createTierService() 