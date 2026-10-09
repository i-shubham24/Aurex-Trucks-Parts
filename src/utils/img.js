/* Catalogue images live on Cloudinary, which resizes and re-encodes on request.
   Ask for the width we actually draw at, in the best format the browser takes,
   instead of downloading the full-size original for a thumbnail. */
export function cld(url, width) {
  if (typeof url !== "string" || !width) return url;
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  if (/\/upload\/[^/]*(f_auto|q_auto|w_\d+)/.test(url)) return url; // already transformed
  return url.replace("/upload/", `/upload/f_auto,q_auto,c_limit,w_${width}/`);
}

export default cld;
