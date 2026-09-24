import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const BASE = "Aurex Truck Parts Australia";

const META = [
  [/^\/$/, ["Tail Lifts, Trailer Parts & Accessories | " + BASE, "VIN-matched tail lifts, trailer parts and accessories. Stocked in Campbellfield VIC, freighted Australia-wide."]],
  [/^\/shop(\/|$)/, ["Shop All Parts | " + BASE, "Shop 36 approved lines across tail lifts, trailer parts and accessories with live VIC stock."]],
  [/^\/product\//, ["Part Detail | " + BASE, "Specifications, fitment, freight and trade pricing for this Aurex line."]],
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
  useEffect(() => {
    const hit = META.find(([rx]) => rx.test(pathname));
    const [title, desc] = hit ? hit[1] : ["Shop Truck Parts | " + BASE, "Aurex Truck Parts Australia. Tail lifts, trailer parts and accessories."];
    document.title = title;
    let tag = document.querySelector('meta[name="description"]');
    if (tag) tag.setAttribute("content", desc);
  }, [pathname]);
  return null;
}
