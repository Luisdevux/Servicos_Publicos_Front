// src/components/CardPedidoSkeleton.tsx

import { Skeleton } from "./ui/skeleton";

export default function CardPedidoSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        
        <Skeleton className="h-6 w-24 rounded-full" />
        
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        
        <div className="space-y-1">
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  );
}
