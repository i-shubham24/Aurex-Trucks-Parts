/* Catalogue images live on Cloudinary, which resizes and re-encodes on request.
   Ask for the width we actually draw at in modern AVIF/WebP, avoiding bloated
   retina double-scaling on mobile devices (e.g. iPhones with DPR=3). */
export function cld(url, width) {
  if (typeof url !== "string") return url;
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  if (/\/upload\/[^/]*(f_auto|q_auto|w_\d+)/.test(url)) return url; // already transformed

  // Bound to sensible viewport widths: 360-480 for mobile cards, up to 1000 for desktop zoom
  const targetWidth = width ? Math.min(1000, Math.round(width)) : 480;
  return url.replace("/upload/", `/upload/f_auto,q_auto:good,c_limit,w_${targetWidth}/`);
}

export default cld;
