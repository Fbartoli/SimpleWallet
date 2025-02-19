export const DEFAULT_FEE_BPS = 25
export const EARLY_USER_FEE_BPS = 10

export const TIER_CONFIGS = {
  default: {
    name: 'default' as const,
    feeBps: DEFAULT_FEE_BPS,
    description: 'Default tier'
  },
  early_user: {
    name: 'early_user' as const,
    feeBps: EARLY_USER_FEE_BPS,
    description: 'Early user tier with reduced fees'
  }
} as const

// List of early users by their Privy ID
export const EARLY_USERS = [
  // Add early user Privy IDs here
  'did:privy:cm77tgdpw003ciz80v9wgoldq'
] 