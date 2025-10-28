export function SendSkeleton() {
    return (
        <div className="p-6 border rounded-lg shadow-md bg-card relative overflow-hidden min-h-[500px] flex flex-col">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-50 pointer-events-none" />
            <div className="relative flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
                    <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                </div>

                <div className="space-y-5 flex-1">
                    {/* Form fields skeleton */}
                    <div className="space-y-2">
                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                        <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
                    </div>

                    <div className="space-y-2">
                        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                        <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
                    </div>

                    <div className="space-y-2">
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                        <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
                    </div>

                    <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
                </div>
            </div>
        </div>
    )
}

