import { TierConfig, TierType } from '../types/tiers'

export const DEFAULT_FEE_BPS = 100
export const EARLY_USER_FEE_BPS = 10

export const TIER_CONFIGS: Record<TierType, TierConfig> = {
  default: {
    name: 'default',
    feeBps: DEFAULT_FEE_BPS,
    description: 'Default tier'
  },
  early_user: {
    name: 'early_user',
    feeBps: EARLY_USER_FEE_BPS,
    description: 'Early user tier with reduced fees'
  }
}

// List of early users by their Privy ID
export const EARLY_USERS: string[] = [
  // Add early user Privy IDs here
  // Example: 'did:privy:abc123'
  'did:privy:cm77tgdpw003ciz80v9wgoldq'
] 