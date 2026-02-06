"use client";

import { cn } from "@/lib/utils";

export function ProductSkeleton() {
    return (
        <div className="group relative block overflow-hidden rounded-md bg-card shadow-sm">
            {/* Image Skeleton */}
            <div className="relative aspect-[3/4] overflow-hidden bg-secondary/20 animate-pulse">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 animate-shimmer" />
            </div>

            {/* Info Skeleton */}
            <div className="p-2 pt-1.5 space-y-2">
                {/* Title */}
                <div className="h-4 w-3/4 rounded bg-secondary/30 animate-pulse" />

                {/* SKU/Collection */}
                <div className="h-3 w-1/2 rounded bg-secondary/20 animate-pulse" />

                <div className="mt-1 flex items-center justify-between">
                    {/* Price */}
                    <div className="h-5 w-16 rounded bg-secondary/30 animate-pulse" />

                    {/* Button */}
                    <div className="h-7 w-12 rounded-full bg-secondary/20 animate-pulse" />
                </div>
            </div>
        </div>
    );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 lg:gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <ProductSkeleton key={i} />
            ))}
        </div>
    );
}
