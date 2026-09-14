import React from 'react';

/**
 * Shimmer skeleton component for loading states.
 * Replaces generic spinners with content-shaped placeholders.
 */

// Base shimmer block
const Shimmer = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-slate-700/50 rounded-lg ${className}`} />
);

// Flight card skeleton
export const FlightCardSkeleton = () => (
  <div className="card-elevated p-6 mb-4">
    <div className="flex items-center gap-4 mb-4">
      <Shimmer className="w-12 h-12 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Shimmer className="h-4 w-32" />
        <Shimmer className="h-3 w-20" />
      </div>
      <div className="text-right space-y-2">
        <Shimmer className="h-6 w-24 ml-auto" />
        <Shimmer className="h-3 w-16 ml-auto" />
      </div>
    </div>
    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
      <div className="space-y-1.5">
        <Shimmer className="h-5 w-16" />
        <Shimmer className="h-3 w-24" />
      </div>
      <Shimmer className="h-4 w-20" />
      <div className="space-y-1.5 text-right">
        <Shimmer className="h-5 w-16 ml-auto" />
        <Shimmer className="h-3 w-24 ml-auto" />
      </div>
    </div>
  </div>
);

// Hotel card skeleton matching HotelCard geometry to eliminate CLS
export const HotelCardSkeleton = () => (
  <div className="card-elevated rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 flex flex-col md:flex-row">
    <Shimmer className="w-full md:w-80 h-48 md:h-auto aspect-[16/10] md:aspect-auto rounded-none shrink-0" />
    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
      <div>
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="space-y-2 flex-1">
            <Shimmer className="h-6 w-3/4 rounded-lg" />
            <Shimmer className="h-3 w-1/2 rounded-md" />
          </div>
          <Shimmer className="w-10 h-10 rounded-2xl shrink-0" />
        </div>
        <div className="flex gap-2 my-4">
          <Shimmer className="h-6 w-24 rounded-lg" />
          <Shimmer className="h-6 w-20 rounded-lg" />
          <Shimmer className="h-6 w-28 rounded-lg" />
        </div>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="space-y-1">
          <Shimmer className="h-4 w-32 rounded-md" />
          <Shimmer className="h-3 w-48 rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <Shimmer className="h-7 w-20 rounded-lg" />
          <Shimmer className="h-10 w-28 rounded-2xl" />
        </div>
      </div>
    </div>
  </div>
);

// Generic list item skeleton
export const ListItemSkeleton = () => (
  <div className="card-elevated p-5 flex items-center gap-4">
    <Shimmer className="w-16 h-16 rounded-xl flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <Shimmer className="h-4 w-3/4" />
      <Shimmer className="h-3 w-1/2" />
      <div className="flex gap-2">
        <Shimmer className="h-5 w-14 rounded-full" />
        <Shimmer className="h-5 w-18 rounded-full" />
      </div>
    </div>
    <div className="space-y-2 text-right">
      <Shimmer className="h-6 w-20 ml-auto" />
      <Shimmer className="h-8 w-24 rounded-xl ml-auto" />
    </div>
  </div>
);

// Results grid skeleton (renders n cards)
export const ResultsGridSkeleton = ({ count = 4, type = 'hotel' }) => {
  const CardComponent = type === 'flight' ? FlightCardSkeleton : 
                        type === 'hotel' ? HotelCardSkeleton : ListItemSkeleton;
  
  return (
    <div className="space-y-4 md:space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardComponent key={i} />
      ))}
    </div>
  );
};

export const FlightSkeletonList = ({ count = 4 }) => (
  <ResultsGridSkeleton count={count} type="flight" />
);

export const HotelSkeletonList = ({ count = 4 }) => (
  <ResultsGridSkeleton count={count} type="hotel" />
);

export default Shimmer;

