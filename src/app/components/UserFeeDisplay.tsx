'use client'

import { useUserFee } from '../hooks/useUserFee'
import { DEFAULT_FEE_BPS } from '../api/tiers/config'

export function UserFeeDisplay() {
  const { data: feeBps, isLoading, error } = useUserFee()

  if (isLoading) {
    return (
      <div className="p-4 rounded-lg border border-green-100 bg-green-50/50 shadow-sm animate-pulse">
        <div className="h-5 w-32 bg-green-200/50 rounded-md mb-2"></div>
        <div className="h-4 w-48 bg-green-100/50 rounded-md"></div>
      </div>
    )
  }

  if (error || !feeBps) {
    return (
      <div className="p-4 rounded-lg border border-red-100 bg-red-50 shadow-sm">
        <p className="text-sm text-red-600">Error loading fee information</p>
      </div>
    )
  }

  const feePercentage = ((feeBps ?? DEFAULT_FEE_BPS) / 100).toFixed(2)

  return (
    <div className="p-4 rounded-lg border border-green-100 bg-gradient-to-br from-green-50 to-teal-50 shadow-sm">
      <p className="font-medium text-green-800">Your Current Trading Fee Tier: <span className="text-green-700">{feePercentage}</span></p>
    </div>
  )
} 