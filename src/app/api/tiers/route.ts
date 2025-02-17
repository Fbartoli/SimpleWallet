import { NextResponse } from 'next/server'
import { tierService } from './service'
import { GetUserTierResponse } from '@/app/types/tiers'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json<GetUserTierResponse>({
      success: false,
      error: {
        code: 'MISSING_USER_ID',
        message: 'User ID is required'
      }
    })
  }

  try {
    const tier = await tierService.getUserTier(userId)
    const feeBps = await tierService.getFeeBps(userId)

    return NextResponse.json<GetUserTierResponse>({
      success: true,
      data: {
        tier,
        feeBps
      }
    })
  } catch (error) {
    console.error('Error getting user tier:', error)
    return NextResponse.json<GetUserTierResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get user tier'
      }
    })
  }
} 