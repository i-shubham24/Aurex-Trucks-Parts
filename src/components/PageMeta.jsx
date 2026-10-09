import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useProduct } from "../hooks/api/useProducts";
import { NEWS } from "../data/content";
import { imgFor } from "../data/images";

const BASE = "Aurex Truck Parts Australia";
const SITE = "https://aurextruckparts.com.au";
const DEFAULT_IMAGE = `${SITE}/logo.jpeg`;

const META = [
  [/^\/$/, ["Tail Lifts, Trailer Parts & Accessories | " + BASE, "VIN-matched tail lifts, trailer parts and accessories. Stocked in Campbellfield VIC, freighted Australia-wide."]],
  [/^\/shop\/tail-lifts$/, ["Heavy Duty Hydraulic Tail Lifts (1.5T - 3T) | " + BASE, "Commercial cantilever hydraulic tail lifts for Australian trucks, rigids and trailers. ADR compliant with technical fitment consultation."]],
  [/^\/shop\/trailer-parts$/, ["Commercial Trailer Parts & Hardware | " + BASE, "Heavy-duty cam locks, door gear, hinges, sliding post bases, coaming rails, and cargo tracks in stock in Campbellfield VIC."]],
  [/^\/shop\/accessories$/, ["Truck & Trailer Fleet Accessories | " + BASE, "Underbody toolboxes, load restraint systems, rubber buffers, safety signs, and workshop fittings in stock for immediate dispatch."]],
  [/^\/shop(\/|$)/, ["Shop All Commercial Parts | " + BASE, "Shop 149+ commercial lines across tail lifts, trailer parts and accessories with live VIC stock and express Australia-wide freight."]],
  [/^\/tail-lift-enquiry$/, ["Tail Lift Quotation & Technical Fitment Enquiry | " + BASE, "Request an engineering-grade quote and fitment consultation for commercial hydraulic tail lifts. Fast response from our Melbourne team within 4 business hours."]],
  [/^\/about$/, ["About Us | " + BASE, "The Campbellfield trade counter behind the catalogue. VIN checks, exact quotes, fast freight across Australia."]],
  [/^\/contact$/, ["Contact the Counter | " + BASE, "Call +61 414 730 467 or send VIN, photos and measurements for an exact price within 4 business hours. Trade desk open Mon-Sat."]],
  [/^\/checkout$/, ["Checkout | " + BASE, "Secure checkout with road, express and Campbellfield trade counter click-and-collect freight options."]],
  [/^\/track$/, ["Track Your Order | " + BASE, "Live freight tracking status for your Aurex Truck Parts order by order number or consignment ID."]],
  [/^\/orders$/, ["My Orders | " + BASE, "Order history with dispatch updates and inline tracking per order."]],
  [/^\/profile$/, ["Trade Account Profile | " + BASE, "Trade account profile, fleet details, saved vehicles and commercial terms."]],
  [/^\/login$/, ["Login | " + BASE, "Log in for faster checkout, order tracking and trade pricing."]],
  [/^\/signup$/, ["Create Trade Account | " + BASE, "Join free for counter pricing, 30-day fleet terms and saved vehicles."]],
  [/^\/reset$/, ["Reset Password | " + BASE, "Secure password reset for your Aurex Truck Parts trade account."]],
  [/^\/forgot-password$/, ["Forgot Password | " + BASE, "Reset your trade account password securely."]],
  [/^\/reset-password$/, ["Set New Password | " + BASE, "Set a new password for your Aurex Truck Parts trade account."]],
  [/^\/order-success(\/|$)/, ["Order Confirmed | " + BASE, "Thank you for your order with Aurex Truck Parts Australia. Your commercial truck parts are being prepared for dispatch from Campbellfield VIC."]],
  [/^\/policies$/, ["Shipping, Returns & Policies | " + BASE, "Plain-English shipping, returns, warranty, terms and privacy policies."]],
];

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
  const { data: productData } = useProduct(skuMatch ? decodeURIComponent(skuMatch[1]) : null);
  const metaProduct = productData?.product || null;

  useEffect(() => {
    let title = "Shop Truck Parts | " + BASE;
    let desc = "Aurex Truck Parts Australia. Tail lifts, trailer parts and accessories stocked in Campbellfield VIC.";
    let pageImage = DEFAULT_IMAGE;
    let productSchema = null;

    /* Product pages get their real name + SKU in the title (highest value SEO). */
    const pm = pathname.match(/^\/product\/([^/]+)/);
    if (pm) {
      const p = metaProduct;
      if (p) {
        title = `${p.name} (${p.sku}) | ${BASE}`;
        desc = `${p.name}, ${p.fit || "Heavy-duty commercial fitment"}. ${p.price == null ? "Technical quote on enquiry" : `Live VIC stock at $${p.price.toFixed(2)} AUD`} at Aurex Truck Parts Campbellfield.`;
        const pImg = imgFor(p.sku);
        if (pImg) {
          pageImage = pImg.startsWith("http") ? pImg : `${SITE}${pImg}`;
        }

        // Schema.org Product structured data
        productSchema = {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": p.name,
          "image": [pageImage],
          "description": p.desc || desc,
          "sku": p.sku,
          "mpn": p.sku,
          "brand": {
            "@type": "Brand",
            "name": "Aurex"
          },
          "offers": {
            "@type": "Offer",
            "url": `${SITE}${pathname}`,
            "priceCurrency": "AUD",
            "price": p.price != null ? p.price : "0",
            "priceValidUntil": "2027-12-31",
            "itemCondition": "https://schema.org/NewCondition",
            "availability": p.price != null ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
            "seller": {
              "@type": "AutoPartsStore",
              "name": "Aurex Truck Parts Australia"
            }
          }
        };
      } else {
        title = "Part Detail | " + BASE;
        desc = "Specifications, fitment, freight and trade pricing for this Aurex line.";
      }
    } else {
      /* News articles get their real headline + excerpt. */
      const nm = pathname.match(/^\/news\/([^/]+)/);
      if (nm) {
        const a = NEWS.find((x) => x.slug === decodeURIComponent(nm[1]));
        if (a) {
          title = `${a.title} | ${BASE}`;
          desc = a.excerpt || desc;
          if (a.img) {
            pageImage = a.img.startsWith("http") ? a.img : `${SITE}${a.img}`;
          }
        } else {
          title = "Stock Notes | " + BASE;
        }
      } else {
        const hit = META.find(([rx]) => rx.test(pathname));
        if (hit) [title, desc] = hit[1];
      }
    }

    // Title & Description
    document.title = title;
    setMetaTag('meta[name="description"]', "content", desc);

    // Canonical & Open Graph
    const canonicalUrl = SITE + pathname;
    let canon = document.querySelector('link[rel="canonical"]');
    if (canon) canon.setAttribute("href", canonicalUrl);

    setMetaTag('meta[property="og:url"]', "content", canonicalUrl);
    setMetaTag('meta[property="og:title"]', "content", title);
    setMetaTag('meta[property="og:description"]', "content", desc);
    setMetaTag('meta[property="og:image"]', "content", pageImage);

    // Twitter Card
    setMetaTag('meta[name="twitter:title"]', "content", title);
    setMetaTag('meta[name="twitter:description"]', "content", desc);
    setMetaTag('meta[name="twitter:image"]', "content", pageImage);

    // Manage dynamic Product JSON-LD script
    let scriptTag = document.getElementById("product-jsonld");
    if (productSchema) {
      if (!scriptTag) {
        scriptTag = document.createElement("script");
        scriptTag.id = "product-jsonld";
        scriptTag.type = "application/ld+json";
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(productSchema);
    } else if (scriptTag) {
      scriptTag.remove();
    }
  }, [pathname, metaProduct]);

  return null;
}
