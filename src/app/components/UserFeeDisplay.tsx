import { useUserFee } from '../hooks/useUserFee'
import { DEFAULT_FEE_BPS } from '../api/tiers/config'

export function UserFeeDisplay() {
  const { data: feeBps, isLoading } = useUserFee()
  
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <h3 className="font-semibold text-lg">Your Fee Tier</h3>
        <p className="text-sm text-muted-foreground">Loading your fee information...</p>
      </div>
    )
  }

  const feePercentage = ((feeBps ?? DEFAULT_FEE_BPS) / 100).toFixed(2)
  
  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="font-semibold text-lg">Your Fee Tier</h3>
      <p className="text-sm text-muted-foreground">Current trading fee rate</p>
      <p className="text-2xl font-bold mt-2">{feePercentage}%</p>
    </div>
  )
} 