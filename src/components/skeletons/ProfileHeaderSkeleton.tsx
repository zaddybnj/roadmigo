import { Skeleton } from "@/components/ui/skeleton";

export const ProfileHeaderSkeleton = () => {
  return (
    <div className="space-y-4">
      {/* Avatar and name */}
      <div className="flex items-center gap-4">
        <Skeleton className="w-20 h-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      {/* Bio */}
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />

      {/* Stats row */}
      <div className="flex gap-6 pt-2">
        <div className="space-y-1">
          <Skeleton className="h-5 w-8" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-5 w-8" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-5 w-8" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
};
