import { TripCardSkeleton } from "./TripCardSkeleton";
import { StatCardSkeleton } from "./StatCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export const FeedPageSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Stats banner skeleton */}
      <div className="bg-card rounded-xl p-4 card-elevated">
        <Skeleton className="h-5 w-40 mb-3" />
        <div className="grid grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="text-center space-y-1">
              <Skeleton className="h-6 w-12 mx-auto" />
              <Skeleton className="h-3 w-14 mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Filter tabs skeleton */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full flex-shrink-0" />
        ))}
      </div>

      {/* Trip cards skeleton */}
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <TripCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};
