import { Skeleton } from "@/components/ui/skeleton";

export const UserCardSkeleton = () => {
  return (
    <div className="bg-card rounded-xl p-4 card-elevated flex items-center gap-4">
      <Skeleton className="w-12 h-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-40" />
      </div>
      <Skeleton className="h-9 w-20 rounded-lg" />
    </div>
  );
};
