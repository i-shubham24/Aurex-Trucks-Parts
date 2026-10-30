import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useProduct } from "../hooks/api/useProducts";
import { getPageMeta, safeDecode, SCHEMA_IDS } from "../seo/meta.js";

function setMetaTag(selector, attr, value) {
  let tag = document.querySelector(selector);
  if (!tag && selector.startsWith("meta[")) {
    tag = document.createElement("meta");
    const nameMatch = selector.match(/name="([^"]+)"/);
    const propMatch = selector.match(/property="([^"]+)"/);
    if (nameMatch) tag.setAttribute("name", nameMatch[1]);
    if (propMatch) tag.setAttribute("property", propMatch[1]);
    document.head.appendChild(tag);
  }
  if (tag) tag.setAttribute(attr, value);
}

export default function PageMeta() {
  const { pathname } = useLocation();
  const skuMatch = pathname.match(/^\/product\/([^/]+)/);
  const { data: productData, error: productError } = useProduct(skuMatch ? safeDecode(skuMatch[1]) : null);
  const metaProduct = productData?.product || null;
  const productMissing = Boolean(skuMatch) && productError?.status === 404;

  useEffect(() => {
    /* Same values the build-time prerender wrote into this page's raw HTML (see src/seo/meta.js). */
    const { title, desc, image: pageImage, robots, canonical: canonicalUrl, schemas } =
      getPageMeta(pathname, { product: metaProduct, productMissing });

    // Title & Description
    document.title = title;
    setMetaTag('meta[name="description"]', "content", desc);
    setMetaTag('meta[name="robots"]', "content", robots);

    // Canonical & Open Graph. index.html ships no canonical: a static one would point every route at the homepage.
    let canon = document.querySelector('link[rel="canonical"]');
    if (!canon) {
      canon = document.createElement("link");
      canon.setAttribute("rel", "canonical");
      document.head.appendChild(canon);
    }
    canon.setAttribute("href", canonicalUrl);

    setMetaTag('meta[property="og:url"]', "content", canonicalUrl);
    setMetaTag('meta[property="og:title"]', "content", title);
    setMetaTag('meta[property="og:description"]', "content", desc);
    setMetaTag('meta[property="og:image"]', "content", pageImage);

    // Twitter Card
    setMetaTag('meta[name="twitter:title"]', "content", title);
    setMetaTag('meta[name="twitter:description"]', "content", desc);
    setMetaTag('meta[name="twitter:image"]', "content", pageImage);

    // JSON-LD blocks for this page (Product, BreadcrumbList, Article); drop any left over from the previous page
    for (const id of SCHEMA_IDS) {
      const schema = schemas.find((s) => s.id === id);
      let scriptTag = document.getElementById(id);
      if (schema) {
        if (!scriptTag) {
          scriptTag = document.createElement("script");
          scriptTag.id = id;
          scriptTag.type = "application/ld+json";
          document.head.appendChild(scriptTag);
        }
        scriptTag.textContent = JSON.stringify(schema.data);
      } else if (scriptTag) {
        scriptTag.remove();
      }
    }
  }, [pathname, metaProduct, productMissing]);

  return null;
}
