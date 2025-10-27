// src/components/CardDemandaSkeleton.tsx

import { Skeleton } from "./ui/skeleton";

export default function CardDemandaSkeleton() {
  return (
    <div className="w-full h-[400px] rounded-lg shadow-lg overflow-hidden flex flex-col">
      <Skeleton className="h-48 w-full" />
      <div className="p-4 flex flex-col justify-between h-[208px]">
        <div className="flex flex-col flex-1 items-center">
          <Skeleton className="h-6 w-3/4 mb-3" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-5/6 mb-1" />
          <Skeleton className="h-4 w-full mb-4" />
        </div>
        <Skeleton className="h-12 w-full rounded-md" />
      </div>
    </div>
  );
}
