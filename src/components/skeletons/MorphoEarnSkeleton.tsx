export function MorphoEarnSkeleton() {
    return (
        <div className="p-6 border rounded-lg shadow-md bg-card relative overflow-hidden min-h-[600px] flex flex-col">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-blue-50 opacity-50 pointer-events-none" />
            <div className="relative flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
                    <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
                </div>

                <div className="space-y-6 flex-1">
                    {/* Vault selection skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                            <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                            <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
                        </div>
                    </div>

                    {/* Vault info card skeleton */}
                    <div className="bg-white/80 rounded-lg p-4 border border-purple-100">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="space-y-1">
                                    <div className="h-3 w-8 bg-gray-200 rounded animate-pulse" />
                                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Amount input skeleton */}
                    <div className="space-y-2">
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                        <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
                    </div>

                    {/* Action button skeleton */}
                    <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />

                    {/* Info section skeleton */}
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                        <div className="space-y-2">
                            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                            <div className="h-3 w-48 bg-gray-200 rounded animate-pulse" />
                            <div className="h-3 w-40 bg-gray-200 rounded animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

