import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useCatalog } from "../store/catalog";

const BASE = "Aurex Truck Parts Australia";
const SITE = "https://aurextruckparts.com.au";

const META = [
  [/^\/$/, ["Tail Lifts, Trailer Parts & Accessories | " + BASE, "VIN-matched tail lifts, trailer parts and accessories. Stocked in Campbellfield VIC, freighted Australia-wide."]],
  [/^\/shop(\/|$)/, ["Shop All Parts | " + BASE, "Shop 36 approved lines across tail lifts, trailer parts and accessories with live VIC stock."]],
  [/^\/about$/, ["About Us | " + BASE, "The Campbellfield trade counter behind the catalogue. VIN checks, exact quotes, fast freight."]],
  [/^\/contact$/, ["Contact the Counter | " + BASE, "Call 03 9000 0000 or send VIN, photos and measurements for an exact price within 4 business hours."]],
  [/^\/checkout$/, ["Checkout | " + BASE, "Secure demo checkout with road, express and click-and-collect freight options."]],
  [/^\/track$/, ["Track Your Order | " + BASE, "Live courier status for your Aurex order by order ID."]],
  [/^\/orders$/, ["My Orders | " + BASE, "Order history with inline tracking per order."]],
  [/^\/profile$/, ["My Profile | " + BASE, "Trade account profile and order history."]],
  [/^\/login$/, ["Login | " + BASE, "Log in for faster checkout, order tracking and trade pricing."]],
  [/^\/signup$/, ["Create Trade Account | " + BASE, "Join free for counter pricing, 30-day fleet terms and saved vehicles."]],
  [/^\/policies$/, ["Shipping, Returns & Policies | " + BASE, "Plain-English shipping, returns, warranty, terms and privacy policies."]],
];

export default function PageMeta() {
  const { pathname } = useLocation();
  const { products } = useCatalog();

  useEffect(() => {
    let title = "Shop Truck Parts | " + BASE;
    let desc = "Aurex Truck Parts Australia. Tail lifts, trailer parts and accessories.";

    /* Product pages get their real name + SKU in the title (best SEO win on the site). */
    const pm = pathname.match(/^\/product\/([^/]+)/);
    if (pm) {
      const p = products.find((x) => x.sku === decodeURIComponent(pm[1]));
      if (p) {
        title = `${p.name} (${p.sku}) | ${BASE}`;
        desc = `${p.name} — ${p.fit || "VIN-matched"}. ${p.price == null ? "Priced on enquiry" : "Live VIC stock"} at Aurex Truck Parts Campbellfield.`;
      } else {
        title = "Part Detail | " + BASE;
        desc = "Specifications, fitment, freight and trade pricing for this Aurex line.";
      }
    } else {
      const hit = META.find(([rx]) => rx.test(pathname));
      if (hit) [title, desc] = hit[1];
    }

    document.title = title;
    const tag = document.querySelector('meta[name="description"]');
    if (tag) tag.setAttribute("content", desc);

    /* Keep canonical + OG URL in sync with the route (no duplicate-content signals). */
    const url = SITE + pathname;
    let canon = document.querySelector('link[rel="canonical"]');
    if (canon) canon.setAttribute("href", url);
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute("content", url);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", title);
  }, [pathname, products]);

  return null;
}
