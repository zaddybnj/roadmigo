import { Skeleton } from "@/components/ui/skeleton";

export const TripCardSkeleton = () => {
  return (
    <div className="bg-card rounded-lg overflow-hidden card-elevated">
      {/* Image skeleton */}
      <div className="relative h-48 overflow-hidden">
        <Skeleton className="w-full h-full" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-6 w-48" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="p-4">
        {/* User info */}
        <div className="flex items-center gap-3 mb-3">
          <Skeleton className="w-8 h-8 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>

        {/* Description */}
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-4" />

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-20" />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-8" />
        </div>
      </div>
    </div>
  );
};
