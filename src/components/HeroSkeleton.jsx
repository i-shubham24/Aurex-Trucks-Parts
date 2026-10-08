export function HeroSkeleton() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-4" aria-label="Loading carousel">
      <div className="relative grid overflow-hidden rounded-lg bg-mist md:grid-cols-2 md:items-center">
        {/* Left text skeleton */}
        <div className="px-6 py-12 md:px-12 md:py-16 space-y-4">
          <div className="shimmer h-10 md:h-14 w-11/12 rounded bg-line" />
          <div className="shimmer h-10 md:h-14 w-3/4 rounded bg-line" />
          <div className="pt-2 space-y-2 max-w-sm">
            <div className="shimmer h-4 w-full rounded bg-line" />
            <div className="shimmer h-4 w-4/5 rounded bg-line" />
          </div>
          <div className="pt-4 flex gap-3">
            <div className="shimmer h-12 w-36 rounded bg-line" />
            <div className="shimmer h-12 w-28 rounded bg-line" />
          </div>
          <div className="pt-4 flex gap-1.5">
            <div className="shimmer h-1.5 w-8 rounded-sm bg-line" />
            <div className="shimmer h-1.5 w-2.5 rounded-sm bg-line" />
            <div className="shimmer h-1.5 w-2.5 rounded-sm bg-line" />
          </div>
        </div>

        {/* Right image box skeleton */}
        <div className="shimmer relative min-h-[260px] md:min-h-[380px] h-full w-full rounded-r-lg bg-line/50" />
      </div>
    </section>
  );
}

export default HeroSkeleton;
