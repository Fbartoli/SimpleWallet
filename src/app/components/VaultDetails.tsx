'use client'

import { EarnProvider, YieldDetails } from '@coinbase/onchainkit/earn'

interface VaultDetailsProps {
  vaultAddress: `0x${string}`
  userAddress: `0x${string}`
}

export function VaultDetails({ vaultAddress }: VaultDetailsProps) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <EarnProvider vaultAddress={vaultAddress}>
        <YieldDetails />
      </EarnProvider>
    </div>
  )
} 