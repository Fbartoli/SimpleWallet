import { memo } from "react"
import { OnRampUSDCButton } from "@/components/OnRampButton"
import { useTranslations } from "@/hooks/useTranslations"

interface TotalValueDisplayProps {
    totalValue: number
    stablecoinValue: number
    vaultValue?: number // Deprecated: Now included in totalValue and token balances
    isLoading?: boolean
}

export const TotalValueDisplay = memo(({
    totalValue,
    stablecoinValue,
    vaultValue = 0,
    isLoading = false,
}: TotalValueDisplayProps) => {
    const { wallet } = useTranslations()

    // Always render the container to prevent layout shifts
    return (
        <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-green-100 min-h-[120px]">
            {isLoading ? (
                <div className="space-y-3 animate-pulse">
                    <div className="flex justify-between items-center">
                        <div className="h-4 w-20 bg-gray-200 rounded" />
                        <div className="h-6 w-24 bg-gray-200 rounded" />
                    </div>
                    <div className="h-px bg-gray-200" />
                    <div className="h-8 w-full bg-gray-200 rounded" />
                </div>
            ) : (
                <>
                    {/* Always show total balance section, even if zero */}
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{wallet("totalBalance")}</span>
                        <span className="font-semibold text-lg">${totalValue.toFixed(2)}</span>
                    </div>

                    {/* Show breakdown of crypto vs stablecoin positions */}
                    {totalValue !== 0 && (
                        <div className="flex justify-between items-center mt-1" style={{ minHeight: "20px" }}>
                            <span className="text-xs text-gray-500">Crypto positions</span>
                            <span className="text-sm text-gray-600">${(totalValue - stablecoinValue).toFixed(2)}</span>
                        </div>
                    )}

                    {/* Show stablecoin breakdown - now includes vault positions */}
                    <div className="flex justify-between items-center mt-1" style={{ minHeight: "20px" }}>
                        {stablecoinValue > 0 && (
                            <>
                                <span className="text-xs text-gray-500">Stablecoins (wallet + vaults)</span>
                                <span className="text-sm text-gray-600">${stablecoinValue.toFixed(2)}</span>
                            </>
                        )}
                        {stablecoinValue === 0 && (
                            <>
                                <span className="text-xs text-gray-500">Stablecoins</span>
                                <span className="text-sm text-gray-600">${stablecoinValue.toFixed(2)}</span>
                            </>
                        )}
                    </div>

                    <div className="h-px bg-gray-200 my-3" />

                    {/* On-ramp buttons */}
                    <div className="space-y-3">
                        <OnRampUSDCButton
                            variant="outline"
                            size="sm"
                            className="flex-1"
                        />
                    </div>
                </>
            )}
        </div>
    )
})

TotalValueDisplay.displayName = "TotalValueDisplay" 