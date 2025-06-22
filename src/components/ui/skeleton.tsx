import { cn } from "@/lib/utils"

interface SkeletonProps {
    className?: string
    children?: React.ReactNode
}

function Skeleton({ className, children, ...props }: SkeletonProps & React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-muted", className)}
            {...props}
        >
            {children}
        </div>
    )
}

// Specific skeleton components for common UI patterns
function SkeletonCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn("p-6 border rounded-lg shadow-md bg-card", className)} {...props}>
            <div className="animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-8 bg-gray-200 rounded-full" />
                    <div className="h-6 w-24 bg-gray-200 rounded" />
                </div>
                <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-10 bg-gray-200 rounded" />
                </div>
            </div>
        </div>
    )
}

function SkeletonText({
    lines = 1,
    className,
    lineClassName,
    ...props
}: {
    lines?: number
    lineClassName?: string
} & React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn("space-y-2", className)} {...props}>
            {Array.from({ length: lines }, (_, i) => (
                <div
                    key={i}
                    className={cn(
                        "h-4 bg-gray-200 rounded animate-pulse",
                        i === lines - 1 && lines > 1 ? "w-3/4" : "w-full",
                        lineClassName
                    )}
                />
            ))}
        </div>
    )
}

function SkeletonButton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("h-10 bg-gray-200 rounded animate-pulse", className)}
            {...props}
        />
    )
}

// Layout preservation skeleton for dynamic content
function SkeletonContainer({
    minHeight = "200px",
    children,
    className,
    ...props
}: {
    minHeight?: string
} & React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("w-full", className)}
            style={{ minHeight }}
            {...props}
        >
            {children}
        </div>
    )
}

export {
    Skeleton,
    SkeletonCard,
    SkeletonText,
    SkeletonButton,
    SkeletonContainer,
} 