import { memo } from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslations } from "@/hooks/useTranslations"

interface ErrorDisplayProps {
    error: string
    onRetry: () => void
}

export const ErrorDisplay = memo(({
    error,
    onRetry,
}: ErrorDisplayProps) => {
    const { errors, common } = useTranslations()

    return (
        <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
            <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">{errors("networkError")}</span>
            </div>
            <p className="text-sm mb-3">{error}</p>
            <Button
                size="sm"
                variant="outline"
                onClick={onRetry}
                className="text-red-700 border-red-200 hover:bg-red-100"
            >
                <RefreshCw className="h-3 w-3 mr-1" />
                {common("retry")}
            </Button>
        </div>
    )
})

ErrorDisplay.displayName = "ErrorDisplay" 