/* Catalogue images live on Cloudinary, which resizes and re-encodes on request.
   Ask for the width we actually draw at, in the best format the browser takes,
   instead of downloading the full-size original for a thumbnail. */
export function cld(url, width) {
  if (typeof url !== "string") return url;
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  if (/\/upload\/[^/]*(f_auto|q_auto|w_\d+)/.test(url)) return url; // already transformed

  // Request high-definition resolution: retina 2x density, best quality tuning, and adaptive edge sharpening
  const targetWidth = width ? Math.min(1400, Math.round(width * 1.5)) : 800;
  return url.replace("/upload/", `/upload/f_auto,q_auto:best,dpr_auto,e_sharpen:60,c_limit,w_${targetWidth}/`);
}

export default cld;
