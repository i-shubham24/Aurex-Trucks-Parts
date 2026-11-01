// Local product shots live at public/images/products/<ATP part number>.jpg or .webp
export const imgFor = (sku) => {
  if (!sku) return null;
  if (sku === 'ATP-TP-14') return '/images/products/ATP-TP-14-handle.jpg';
  return `/images/products/${sku}.jpg`;
};

export const MULTI_IMAGES = {
  'ATP-TP-83': ['/images/products/ATP-TP-83.jpg', '/images/products/ATP-TP-83-bar.jpg'],
  'ATP-TP-69': ['/images/products/ATP-TP-69.jpg', '/images/products/ATP-TP-69-back.jpg'],
  'ATP-TP-84': ['/images/products/ATP-TP-84.jpg', '/images/products/ATP-TP-84-back.jpg'],
  'ATP-TP-85': ['/images/products/ATP-TP-85.jpg', '/images/products/ATP-TP-85-back.jpg'],
  'ATP-TP-86': ['/images/products/ATP-TP-86.jpg', '/images/products/ATP-TP-86-back.jpg'],
};

const firstApiImage = (p) => {
  const first = Array.isArray(p?.images) && p.images.length > 0 ? p.images[0] : null;
  return (typeof first === 'string' ? first : first?.url) || p?.imageUrl || null;
};

// The API's default image for a part is the same stock packshot path we keep locally.
// Anything else was uploaded through the admin console.
const isStockImage = (url, sku) => url === `/images/products/${sku}.jpg` || url === imgFor(sku);

/* Main image for a product: an admin-uploaded image wins, the local packshot is the fallback. */
export const productImage = (p) => {
  const api = firstApiImage(p);
  if (api && !isStockImage(api, p?.sku)) return api;
  return imgFor(p?.sku) || api;
};

/* Gallery for the product page: uploaded images when there are any, else the curated local views. */
export const productImages = (p) => {
  const api = (Array.isArray(p?.images) ? p.images : [])
    .map((img) => (typeof img === 'string' ? img : img?.url))
    .filter(Boolean);
  if (api.length > 0 && api.some((url) => !isStockImage(url, p?.sku))) return api;
  return imagesFor(p?.sku);
};

export const imagesFor = (sku) => {
  if (!sku) return [];
  if (MULTI_IMAGES[sku]) return MULTI_IMAGES[sku];
  const primary = imgFor(sku);
  return primary ? [primary] : [];
};

/* Editorial photos (web-sized). */
export const PHOTO = {
  tradeCounter: "/images/web/aurex-trade-counter.webp",
  tailLift: "/images/web/aurex-tail-lift.webp",
  trailerBuild: "/images/web/hero-trailer-parts-yellow.webp",
  trailerCategory: "/images/web/trailer-parts-category.webp",
  fleetAccessories: "/images/web/aurex-fleet-accessories.webp",
};

/* Drawn covers (public/images/covers) for the guides and the launch stock notes, so they don't
   repeat the hero, category and product photos. */
export const GUIDE_COVER = {
  "rear-marking-plates-vsb12": { src: "/images/covers/guide-rear-marking-plates.svg", alt: "Diagram of a trailer rear showing rear marking plates and the DO NOT OVERTAKE TURNING VEHICLE sign" },
  "truck-trailer-door-hardware": { src: "/images/covers/guide-door-hardware.svg", alt: "Diagram of truck rear doors showing cam door gear, keepers, handles, strap hinges and door seals" },
  "frp-honeycomb-vs-plywood-vs-xps-panels": { src: "/images/covers/guide-body-panels.svg", alt: "Cross-sections of FRP honeycomb, FRP plywood and XPS insulated truck body panels" },
  "choosing-a-tail-lift": { src: "/images/covers/guide-tail-lift.svg", alt: "Side view of a rigid truck with a tail lift lowered, showing lift height and load centre" },
};

/* Article covers: a scene that matches the story rather than a product cut-out.
   Known posts are matched by slug; a post with no cover of its own falls back
   to a photo for its topic. Anything else keeps the cover set in the CMS. */
const BLOG_BY_SLUG = {
  "tail-lifts-land-in-vic": "/images/covers/news-tail-lift-range.svg",
  "tracks-caps-fittings-explained": "/images/covers/news-tracks-fittings.svg",
  "stainless-hinges-paddle-latches": "/images/covers/news-hinges-latches.svg",
  "toolbox-door-hardware-refresh": "/images/covers/news-toolbox-hardware.svg",
};
/* The launch posts were seeded in the CMS with the hero and category photos; their drawn cover replaces
   those, while a photo uploaded for the post in the admin still wins. */
const SITE_PHOTO = /\/(aurex-tail-lift|aurex-trade-counter|aurex-fleet-accessories|aurex-trailer-parts|trailer-parts-category|hero-[\w-]+)(-square)?\.(webp|jpe?g|png)$/;
const BLOG_BY_TAG = {
  "Tail Lifts": PHOTO.tailLift,
  "Trailer Parts": PHOTO.trailerCategory,
  "Accessories": PHOTO.fleetAccessories,
  "Tool Boxes": PHOTO.fleetAccessories,
};

export const blogImage = (post) => {
  const backendImg =
    (typeof post?.coverImage === "string" && post.coverImage) ||
    post?.coverImage?.url ||
    (typeof post?.img === "string" && post.img) ||
    post?.img?.url;

  const cover = BLOG_BY_SLUG[post?.slug];
  if (cover && (!backendImg || SITE_PHOTO.test(backendImg))) return cover;
  return backendImg || BLOG_BY_TAG[post?.tag] || PHOTO.tradeCounter;
};
