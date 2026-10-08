export function ProductCardSkeleton({ joined = false }) {
  return (
    <div
      className={`flex h-full flex-col bg-white overflow-hidden ${
        joined ? "" : "rounded-md border border-line"
      }`}
    >
      {/* Product Image Skeleton */}
      <div className="shimmer aspect-[4/3] w-full bg-line/50" />

      {/* Product Details Skeleton */}
      <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Sub / SKU info */}
          <div className="shimmer h-2.5 w-2/4 rounded bg-line" />
          {/* Name / Title */}
          <div className="shimmer h-4 w-11/12 rounded bg-line" />
          <div className="shimmer h-3.5 w-3/4 rounded bg-line" />
          {/* Fitment info */}
          <div className="shimmer h-2.5 w-4/5 rounded bg-line" />
        </div>

        <div className="pt-2 space-y-2">
          {/* Star rating */}
          <div className="shimmer h-3 w-20 rounded bg-line" />
          {/* Price & button */}
          <div className="flex items-center justify-between pt-1">
            <div className="shimmer h-6 w-20 rounded bg-line" />
            <div className="shimmer h-7 w-7 rounded bg-line" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 10 }) {
  return (
    <div className="cap-6 grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-3 lg:grid-cols-5" aria-label="Loading products">
      {Array.from({ length: count }).map((_, idx) => (
        <ProductCardSkeleton key={idx} joined={true} />
      ))}
    </div>
  );
}

export default ProductGridSkeleton;
