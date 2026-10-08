import React from 'react';

export default function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded bg-[#333] ${className}`} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="flex gap-3">
      <Skeleton className="w-[90px] h-[120px] shrink-0" />
      <div className="flex-1 space-y-2 py-1">
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-2 w-2/5" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-2 w-3/4" />
        <Skeleton className="h-4 w-1/4 mt-2" />
        <Skeleton className="h-2 w-1/2" />
      </div>
    </div>
  );
}
