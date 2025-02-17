import { useQuery } from '@tanstack/react-query'
import { usePrivy } from '@privy-io/react-auth'
import { GetUserTierResponse } from '../types/tiers'
import { DEFAULT_FEE_BPS } from '../api/tiers/config'

async function fetchUserFee(userId: string) {
  const response = await fetch(`/api/tiers?userId=${userId}`)
  const data: GetUserTierResponse = await response.json()
  
  if (!data.success || !data.data) {
    console.error('Failed to get user tier:', data.error)
    return DEFAULT_FEE_BPS
  }
  
  return data.data.feeBps
}

export function useUserFee() {
  const { user } = usePrivy()
  
  return useQuery({
    queryKey: ['userFee', user?.id],
    queryFn: () => fetchUserFee(user?.id || ''),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 10, // Keep unused data for 10 minutes
  })
} 