// Image paths kept from the old Aurex build.
// Product shots: public/images/products/<SKU>.jpg (36 files).
// Category banners: public/images/*-CAT.jpg.
const SKUS = [
  "TL-20-2450-2400", "TL-20-2450-2200", "TL-20-2450-2600", "TL-15-2450-2400",
  "TL-30-2450-2600-S", "PU-12V-22KW", "GL-25126", "A20-01S-06", "GL-12140",
  "GL-14175", "GL-14175B", "A02-01S-01", "GL-11113", "GL-11113-NL", "GL-11113S",
  "GL-13112", "GL-13198B", "GL-13213", "GL-13195S", "GL-19113H1", "GL-19113SH1",
  "GL-19111H1", "F07-04C-01", "CANVAS-1995-1600", "CANVAS-2045-1600",
  "CANVAS-1250-1600", "GL-15616", "GL-23116", "GL-ASJ04", "GL-19120", "GL-19117",
  "GL-16513", "GL-16511S", "GL-19116", "GL-19116B", "FZ-26184",
];

export const SKU_IMG = Object.fromEntries(SKUS.map((sku) => [sku, `/images/products/${sku}.jpg`]));

export const CAT_IMG = {
  "tail-lifts": "/images/TAIL-LIFTS-CAT.jpg",
  "trailer-parts": "/images/TRAILER-PARTS-CAT.jpg",
  "accessories": "/images/ACCESSORIES-CAT.jpg",
};

export const imgFor = (sku) => SKU_IMG[sku] || null;
