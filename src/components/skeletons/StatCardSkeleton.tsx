import { Skeleton } from "@/components/ui/skeleton";

export const StatCardSkeleton = () => {
  return (
    <div className="bg-card rounded-xl p-4 card-elevated">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="space-y-1 flex-1">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
};
