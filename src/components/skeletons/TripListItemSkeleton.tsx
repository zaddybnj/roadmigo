import { Skeleton } from "@/components/ui/skeleton";

export const TripListItemSkeleton = () => {
  return (
    <div className="bg-card rounded-xl p-4 card-elevated flex items-center gap-4">
      <Skeleton className="w-16 h-16 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-28" />
        <div className="flex gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <Skeleton className="h-5 w-5" />
    </div>
  );
};
