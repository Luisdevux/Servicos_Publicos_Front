// src/components/CardDemandaOperadorSkeleton.tsx

import { Skeleton } from "./ui/skeleton";

export default function CardDemandaOperadorSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
      
      <div className="space-y-1 pt-2">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      
      <Skeleton className="h-40 w-full rounded-md" />
      
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
  );
}
