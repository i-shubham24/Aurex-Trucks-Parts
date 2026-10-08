import React from "react";

export function ProductDetailSkeleton() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <div className="shimmer h-4 w-16 rounded bg-line" />
        <span className="text-faint">/</span>
        <div className="shimmer h-4 w-16 rounded bg-line" />
        <span className="text-faint">/</span>
        <div className="shimmer h-4 w-24 rounded bg-line" />
      </div>

      {/* Main Grid */}
      <div className="mt-4 grid gap-8 md:grid-cols-2">
        {/* Left Column - Product Image & Trust Badges */}
        <div>
          <div className="relative overflow-hidden rounded-md border border-line bg-white shadow-xs">
            <div className="shimmer aspect-[4/3] w-full bg-mist" />
          </div>

          <div className="mt-3 grid grid-cols-3 gap-px border border-line bg-line text-center">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="bg-white p-3 space-y-2">
                <div className="shimmer mx-auto h-3.5 w-20 rounded bg-line" />
                <div className="shimmer mx-auto h-3 w-16 rounded bg-line/60" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Product Info & CTA */}
        <div className="space-y-4">
          <div className="shimmer h-3.5 w-32 rounded bg-line" />
          <div className="shimmer h-9 w-3/4 rounded bg-line" />
          <div className="shimmer h-4 w-5/6 rounded bg-line" />

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="shimmer h-4 w-24 rounded bg-line" />
            <div className="shimmer h-4 w-16 rounded bg-line" />
          </div>

          {/* Price Box */}
          <div className="rounded-md border border-line bg-mist p-5 space-y-4">
            <div className="flex items-baseline justify-between">
              <div className="shimmer h-10 w-36 rounded bg-line" />
              <div className="shimmer h-6 w-24 rounded bg-line" />
            </div>
            <div className="shimmer h-4 w-2/3 rounded bg-line" />
            <div className="flex gap-2">
              <div className="shimmer h-11 w-28 rounded bg-line" />
              <div className="shimmer h-11 flex-1 rounded bg-line" />
            </div>
            <div className="shimmer h-10 w-full rounded bg-line" />
          </div>

          {/* Extra Info Box */}
          <div className="rounded-md border border-line bg-white p-4 space-y-3">
            <div className="shimmer h-4 w-3/4 rounded bg-line" />
            <div className="shimmer h-4 w-1/2 rounded bg-line" />
          </div>
        </div>
      </div>

      {/* Tabs & Specs Skeleton */}
      <div className="mt-8 overflow-hidden rounded-md border border-line">
        <div className="flex border-b border-line bg-mist p-3 gap-3">
          <div className="shimmer h-8 w-32 rounded bg-line" />
          <div className="shimmer h-8 w-32 rounded bg-line" />
          <div className="shimmer h-8 w-32 rounded bg-line" />
        </div>
        <div className="bg-white p-5 space-y-3">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="flex gap-4">
              <div className="shimmer h-6 w-1/3 rounded bg-line" />
              <div className="shimmer h-6 w-2/3 rounded bg-line" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default ProductDetailSkeleton;
