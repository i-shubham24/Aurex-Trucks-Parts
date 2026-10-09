// Local product shots live at public/images/products/<ATP part number>.jpg and are the
// fallback when a part has no image in the catalogue.
export const imgFor = (sku) => (sku ? `/images/products/${sku}.jpg` : null);

/* Editorial photos (web-sized). */
export const PHOTO = {
  tradeCounter: "/images/web/campbellfield-trade-counter.webp",
  tailLift: "/images/web/hero-tail-lift-yellow.webp",
  trailerBuild: "/images/web/hero-trailer-parts-yellow.webp",
  fleetAccessories: "/images/web/hero-fleet-accessories-yellow.webp",
};

/* Article covers: a scene that matches the story rather than a product cut-out.
   Known posts are matched by slug; a post with no cover of its own falls back
   to a photo for its topic. Anything else keeps the cover set in the CMS. */
const BLOG_BY_SLUG = {
  "tail-lifts-land-in-vic": PHOTO.tailLift,
  "tracks-caps-fittings-explained": PHOTO.trailerBuild,
  "stainless-hinges-paddle-latches": PHOTO.tradeCounter,
  "toolbox-door-hardware-refresh": PHOTO.fleetAccessories,
};
const BLOG_BY_TAG = {
  "Tail Lifts": PHOTO.tailLift,
  "Trailer Parts": PHOTO.trailerBuild,
  "Accessories": PHOTO.fleetAccessories,
  "Tool Boxes": PHOTO.fleetAccessories,
};

export const blogImage = (post) =>
  BLOG_BY_SLUG[post?.slug] || post?.coverImage || post?.img || BLOG_BY_TAG[post?.tag] || PHOTO.tradeCounter;
