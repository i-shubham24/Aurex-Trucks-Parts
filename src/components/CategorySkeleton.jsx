export function CategoryCardSkeleton() {
  return (
    <div className="grid grid-cols-2 items-center overflow-hidden rounded-md border border-line bg-mist">
      <div className="p-4 md:p-5 space-y-3">
        {/* Title skeleton */}
        <div className="shimmer h-6 md:h-7 w-4/5 rounded bg-line" />
        {/* Price / Tag skeleton */}
        <div className="shimmer h-4 w-3/5 rounded bg-line" />
        {/* Badge / Lines button skeleton */}
        <div className="shimmer h-6 w-24 rounded bg-line" />
      </div>
      {/* Image container skeleton */}
      <div className="shimmer h-full min-h-[120px] w-full bg-line/60" />
    </div>
  );
}

export function CategoryTilesSkeleton({ count = 3 }) {
  return (
    <section className="mx-auto grid grid-cols-1 max-w-7xl gap-4 px-4 pt-6 md:grid-cols-3" aria-label="Loading categories">
      {Array.from({ length: count }).map((_, idx) => (
        <CategoryCardSkeleton key={idx} />
      ))}
    </section>
  );
}

export default CategoryTilesSkeleton;
