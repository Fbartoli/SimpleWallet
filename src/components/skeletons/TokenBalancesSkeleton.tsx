export function TokenBalancesSkeleton() {
    return (
        <div className="p-6 border rounded-lg shadow-md bg-card relative overflow-hidden min-h-[400px]">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-teal-50 opacity-50 pointer-events-none" />
            <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
                    <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
                </div>

                {/* Total value section skeleton */}
                <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-green-100">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                            <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
                        </div>
                        <div className="h-px bg-gray-200" />
                        <div className="h-8 w-full bg-gray-200 rounded animate-pulse" />
                    </div>
                </div>

                {/* Token cards skeleton - consistent with actual content */}
                <div className="grid gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex justify-between items-center p-3 rounded-lg border bg-gray-50 animate-pulse">
                            <div className="flex items-center gap-2">
                                <div className="h-5 w-5 bg-gray-200 rounded" />
                                <div className="flex flex-col gap-1">
                                    <div className="h-4 w-12 bg-gray-200 rounded" />
                                    <div className="h-3 w-16 bg-gray-200 rounded" />
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <div className="h-4 w-16 bg-gray-200 rounded" />
                                <div className="h-3 w-12 bg-gray-200 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

