/* Page titles, descriptions, robots, canonicals and JSON-LD (Product, BreadcrumbList, Article), shared by PageMeta
   (in the browser) and the build-time prerender (scripts/prerender.js), so crawlers' raw HTML and the live app agree.
   Node imports this file directly: keep it free of React/Vite code and keep the explicit .js extensions. */
import { NEWS } from "../data/content.js";
import { productImage } from "../data/images.js";
import { CATEGORY_NAMES, subContentFor, subSlug } from "../data/seoContent.js";
import { guideFor } from "../data/guides.js";

export const BASE = "Aurex Truck Parts Australia";
/* The www host is the one Vercel serves; the bare domain 308-redirects to it. */
export const SITE = "https://www.aurextruckparts.com.au";
export const DEFAULT_IMAGE = `${SITE}/logo.jpeg`;

/* What SEO tools accept before flagging a tag: titles of at most 60 characters that also fit Google's title
   width (Screaming Frog flags over 561px), and descriptions of 120 to 155 characters. */
const TITLE_MAX = 60;
const TITLE_PX_MAX = 561;
const DESC_MIN = 120;
const DESC_MAX = 155;

/* Width of a title in Google's results (Arial 20px), from Arial's character widths in 1/1000 em. Capitals and
   digits are wide, so a 60-character title can still be cut off. Anything not listed counts as 556. */
const CHAR_WIDTHS = {
  ...Object.fromEntries([..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"].map((c, i) =>
    [c, [667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611][i]])),
  ...Object.fromEntries([..."abcdefghijklmnopqrstuvwxyz"].map((c, i) =>
    [c, [556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500][i]])),
  " ": 278, "'": 191, ",": 278, ".": 278, ":": 278, ";": 278, "!": 278, "/": 278, "|": 260, "(": 333, ")": 333, "-": 333, "&": 667, "%": 889, "—": 1000,
};
const titleWidth = (t) => [...t].reduce((w, c) => w + (CHAR_WIDTHS[c] ?? 556), 0) / 50;
const titleFits = (t) => t.length <= TITLE_MAX && titleWidth(t) <= TITLE_PX_MAX;

/* "Page | brand" with the longest form of the brand that still fits; a name too long for any keeps no suffix. */
const BRAND_SUFFIXES = [` | ${BASE}`, " | Aurex Truck Parts", " | Aurex", ""];
const branded = (name) => BRAND_SUFFIXES.map((s) => name + s).find(titleFits) || name;

/* Closing sentences for a description that comes out short (a brief article excerpt, say), longest first. */
const DESC_PADDING = [
  "Stocked at our Campbellfield VIC trade counter and shipped Australia-wide.",
  "Stocked in Campbellfield VIC and shipped Australia-wide.",
  "Shipped Australia-wide from Campbellfield VIC.",
  "Aurex Truck Parts, Campbellfield VIC.",
  "Shipped Australia-wide.",
];

/* Brings any description into DESC_MIN..DESC_MAX: a short one gets a closing sentence, a long one is cut at
   its last full sentence (or, failing that, its last whole word). */
function fitDescription(text) {
  let d = String(text || "").replace(/\s+/g, " ").trim();
  if (d.length > DESC_MAX) {
    const head = d.slice(0, DESC_MAX + 1);
    const sentenceEnd = Math.max(head.lastIndexOf(". "), head.lastIndexOf("! "), head.lastIndexOf("? "));
    d = sentenceEnd + 1 >= DESC_MIN ? d.slice(0, sentenceEnd + 1) : `${d.slice(0, d.lastIndexOf(" ", DESC_MAX - 1)).replace(/[\s,;:.-]+$/, "")}…`;
  }
  if (d.length < DESC_MIN) {
    const pad = DESC_PADDING.find((p) => d.length + 1 + p.length <= DESC_MAX);
    if (pad) d = `${/[.!?…]$/.test(d) ? d : `${d}.`} ${pad}`;
  }
  return d;
}

const META = [
  [/^\/$/, [branded("Tail Lifts, Trailer Parts & Accessories"), "Tail lifts, trailer parts and truck body accessories from our Campbellfield VIC trade counter. Order by 2pm for same-day dispatch Australia-wide."]],
  [/^\/shop\/tail-lifts$/, [branded("Hydraulic Tail Lifts (1.5T - 3T)"), "Hydraulic tail lifts from 1.5T aluminium to 3T steel for Australian rigids, vans and trailers, quoted to your chassis with fitment advice from our team."]],
  [/^\/shop\/trailer-parts$/, [branded("Commercial Trailer Parts & Hardware"), "Heavy-duty cam locks, door gear, hinges, sliding post bases, coaming rails and cargo tracks, in stock at Campbellfield VIC and shipped Australia-wide."]],
  [/^\/shop\/accessories$/, [branded("Truck & Trailer Fleet Accessories"), "Underbody toolboxes, FRP and XPS body panels, wheel nut covers, rubber buffers and workshop fittings, stocked in Campbellfield VIC for fast dispatch."]],
  [/^\/shop(\/|$)/, [branded("Shop All Commercial Parts"), "Shop tail lifts, trailer parts and truck accessories with live stock from our Campbellfield VIC trade counter and express freight Australia-wide."]],
  [/^\/tail-lift-enquiry$/, [branded("Tail Lift Quote & Fitment Enquiry"), "Request a quote and fitment advice for a hydraulic tail lift. Send your chassis and body details and our Melbourne team replies within 4 business hours."]],
  [/^\/about$/, [branded("About Us"), "Meet the Campbellfield trade counter behind the Aurex catalogue: VIN and fitment checks, exact quotes and fast freight to workshops across Australia."]],
  [/^\/contact$/, [branded("Contact the Counter"), "Call +61 414 730 467 or send your VIN, photos and measurements for an exact price within 4 business hours. Counter open Mon to Fri, 9am to 5pm."]],
  [/^\/checkout$/, [branded("Checkout"), "Secure checkout for Aurex Truck Parts orders, with road and express freight Australia-wide or click-and-collect from our Campbellfield VIC counter."]],
  [/^\/track$/, [branded("Track Your Order"), "Track your Aurex Truck Parts order by order number or consignment ID and see its freight status from dispatch in Campbellfield VIC to delivery."]],
  [/^\/orders$/, [branded("My Orders"), "Your Aurex Truck Parts order history, with dispatch updates and freight tracking for every order placed on your account, all in one place."]],
  [/^\/profile$/, [branded("Trade Account Profile"), "Manage your Aurex Truck Parts trade account: contact and delivery details, fleet information, saved vehicles and your commercial trading terms."]],
  [/^\/login$/, [branded("Login"), "Log in to your Aurex Truck Parts account for faster checkout, order tracking and saved delivery details, plus trade pricing on trade accounts."]],
  [/^\/signup$/, [branded("Create Trade Account"), "Join Aurex Truck Parts free for trade counter pricing, 30-day fleet terms and saved vehicles, plus faster checkout and online order tracking."]],
  [/^\/reset$/, [branded("Reset Password"), "Reset the password for your Aurex Truck Parts trade account securely, then log back in to check your orders, freight tracking and trade pricing."]],
  [/^\/forgot-password$/, [branded("Forgot Password"), "Forgot your password? Enter your email for a secure reset link to your Aurex Truck Parts account and get back to your orders and freight tracking."]],
  [/^\/reset-password$/, [branded("Set New Password"), "Set a new password for your Aurex Truck Parts account, then log back in to check your orders, freight tracking and trade pricing in one place."]],
  [/^\/order-success(\/|$)/, [branded("Order Confirmed"), "Thank you for your order with Aurex Truck Parts Australia. Your commercial truck parts are being prepared for dispatch from Campbellfield VIC."]],
  [/^\/policies$/, [branded("Shipping, Returns & Policies"), "Plain-English policies for Aurex Truck Parts orders in Australia: shipping and freight, returns, warranty claims, terms of sale and privacy."]],
  [/^\/guides$/, [branded("Truck & Trailer Parts Guides"), "Plain-English guides to rear marking plates (VSB 12), truck and trailer door hardware, body panels and choosing a tail lift."]],
];

/* Routes the app actually serves (see App.jsx); anything else renders the 404 page. */
const KNOWN_ROUTES = [
  /^\/$/, /^\/about$/, /^\/contact$/, /^\/tail-lift-enquiry$/, /^\/enquiry\/tail-lift$/,
  /^\/shop(\/[^/]+){0,2}$/, /^\/guides(\/[^/]+)?$/, /^\/policies$/, /^\/product\/[^/]+$/, /^\/news\/[^/]+$/,
  /^\/checkout$/, /^\/order-success\/[^/]+$/, /^\/orders$/, /^\/profile$/, /^\/track$/,
  /^\/login$/, /^\/signup$/, /^\/forgot-password$/, /^\/reset-password$/,
];
/* Private, transactional and sign-in pages stay out of search results. */
const NOINDEX = /^\/(admin|account|orders|profile|checkout|order-success|login|signup|forgot-password|reset-password)(\/|$)/;

/* A malformed escape in the URL (e.g. /product/%E0) must not crash the app. */
export const safeDecode = (value) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};


/* Shorter spellings tried in order, only while a long part name still doesn't fit a title. Each drops filler
   and keeps what tells one part from its neighbours: size, side, rating, pack quantity. */
const NAME_TRIMS = [
  // A quoted sign legend ('ROAD TRAIN') in title case without the quotes: capitals are the widest letters.
  (n) => n.replace(/['"‘’“”]([^'"‘’“”]+)['"‘’“”]/g, (_, w) => w.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase())).replace(/['"‘’“”]/g, ""),
  (n) => n.replace(/\b(Left|Right)\s+(Hand|Side)\b/gi, "$1").replace(/\(Pack of (\d+)\)/gi, "($1 Pack)"),
  (n) => n.replace(/\bHeavy[- ]Duty\s+/gi, ""),
  (n) => n.replace(/\b(?:Commercial|Industrial|Universal)\s+/gi, ""),
  (n) => n.replace(/(\d(?:mm|m)?)\s+(?:Length|Width|Height)\b/gi, "$1"), // "88mm Length": the number says it
  (n) => (/\bClass 1\b/i.test(n) ? n.replace(/\bReflective\s+/i, "") : n), // Class 1 sheeting is reflective by definition
  (n) => n.replace(/\bAluminium\s+(?=(?:\S+\s+){0,5}(?:Plate|Sign)\b)/i, ""), // marker plates and signs are aluminium; stickers say "Sticker"
  (n) => n.replace(/(?<!\b(?:Turning|Long)\s)\bVehicle\s+/i, ""),
  (n) => n.replace(/\s+Assembly\b/gi, "").replace(/\bMulti[- ]Hazard\b/gi, "Hazard"),
  (n) => (n.includes("&") ? n : n.replace(/\s+with\s+/i, " & ")),
  (n) => n.replace(/\bStainless Steel\b/gi, "Stainless").replace(/\bZinc Plated\b/gi, "Zinc"),
  // Last resorts: drop the "& accessory" tail, keeping any size in it; then a leading "3M" (the description keeps it).
  (n) => n.replace(/\s+&\s+([^&]+)$/, (_, tail) => tail.split(" ").filter((w) => /\d/.test(w)).map((w) => ` ${w}`).join("")),
  (n) => n.replace(/^3M\s+/, ""),
];

function productTitle(name) {
  let n = String(name).replace(/\s+/g, " ").trim();
  const fit = () => titleFits(branded(n));
  for (const trim of NAME_TRIMS) {
    if (fit()) break;
    n = trim(n).replace(/\s+/g, " ").trim();
  }
  // Still too long: let the result page truncate it rather than cut a size or side off the end here.
  return branded(n);
}

const sentence = (text) => {
  const s = String(text || "").replace(/\s+/g, " ").trim().replace(/[\s,;:]+$/, "");
  if (!s) return "";
  return s[0].toUpperCase() + s.slice(1) + (/[.!?]$/.test(s) ? "" : ".");
};

/* The first sentence of a written description, skipping the generated "engineered for…" filler and any
   compliance or certification wording, which the counter hasn't verified for search snippets. */
function aboutSentence(p) {
  const text = String(p.desc || "").replace(/\s+/g, " ").trim();
  if (!text || text === p.name || /engineered for Australian commercial truck and trailer bodies/i.test(text)) return "";
  const first = text.match(/^.+?[.!?](?=\s|$)/)?.[0] || text;
  if (/\b(ADR|AS\/?NZS|ISO|certified|complian|approved)\b/i.test(first)) return "";
  return first.toLowerCase().startsWith(p.name.toLowerCase()) ? "" : sentence(first);
}

/**
 * Name, then the most useful facts that still fit in DESC_MAX characters: fitment, price, stock, freight and
 * dispatch or quote times. Each slot lists alternatives, longest first; a slot that can't fit any is left out.
 */
function productDescription(p) {
  const inStock = /in stock/i.test(p.stockStatus || "") && !/week|quote|confirm/i.test(p.lead || "");
  const fitText = p.fit && !/^heavy-duty commercial fitment$/i.test(p.fit) ? sentence(p.fit) : "";
  const slots = [
    { order: 0, options: [sentence(p.name)] },
    { order: 2, options: [fitText] },
    { order: 3, options: p.price == null
      ? ["Price on application: send your vehicle details for a quote.", "Price on application, quoted to your vehicle.", "Price on application."]
      : [`$${p.price.toFixed(2)} inc GST.`] },
    { order: 4, options: inStock
      ? ["In stock in Campbellfield VIC, shipped Australia-wide.", "In stock, shipped Australia-wide.", "Shipped Australia-wide."]
      : ["Supplied from Campbellfield VIC, shipped Australia-wide.", "Shipped Australia-wide."] },
    { order: 1, options: [aboutSentence(p)] },
    { order: 5, options: [p.price == null ? "Quotes within 4 business hours." : inStock ? "Order by 2pm for same-day dispatch." : ""] },
  ];
  const picked = [];
  let length = -1;
  for (const slot of slots) {
    const text = slot.options.find((o) => o && length + 1 + o.length <= DESC_MAX);
    if (!text) continue;
    picked.push([slot.order, text]);
    length += 1 + text.length;
  }
  return picked.sort((a, b) => a[0] - b[0]).map(([, t]) => t).join(" ");
}

const categoryName = (slug) =>
  CATEGORY_NAMES[slug] || String(slug).replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const breadcrumbList = (trail) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": trail.map(([name, path], i) => ({ "@type": "ListItem", "position": i + 1, "name": name, "item": SITE + path })),
});

/* Ids of the JSON-LD scripts the app keeps in <head>; the prerender writes the same ids. */
export const SCHEMA_IDS = ["product-jsonld", "breadcrumb-jsonld", "article-jsonld"];

/**
 * Everything a page's <head> needs. `product` is the normalized product on a product route (null while it
 * loads); `productMissing` means the API said that SKU doesn't exist. `schemas` lists the JSON-LD blocks
 * as { id, data }.
 */
export function getPageMeta(pathname, { product = null, productMissing = false } = {}) {
  let title = branded("Shop Truck Parts");
  let desc = "Aurex Truck Parts Australia: tail lifts, trailer parts and truck accessories, stocked at our Campbellfield VIC trade counter and shipped Australia-wide.";
  let image = DEFAULT_IMAGE;
  let productSchema = null;
  let trail = null;
  let article = null;
  let thin = false; // a real page, but without enough of its own content to index
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const shopMatch = path.match(/^\/shop(?:\/([^/]+))?(?:\/([^/]+))?$/);
  const guideMatch = path.match(/^\/guides(?:\/([^/]+))?$/);

  /* Product pages get the part's own name in the title and its fitment, price and stock in the description. */
  const pm = pathname.match(/^\/product\/([^/]+)/);
  if (pm) {
    const p = product;
    if (p) {
      title = productTitle(p.name || p.sku);
      desc = productDescription(p);
      const pImg = productImage(p);
      if (pImg) {
        image = pImg.startsWith("http") ? pImg : `${SITE}${pImg}`;
      }

      // Schema.org Product structured data
      productSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": p.name,
        "image": [image],
        "description": p.desc || desc,
        "sku": p.sku,
        "mpn": p.sku,
        "brand": {
          "@type": "Brand",
          "name": "Aurex"
        },
      };
      // Price-on-application parts have no public price; publishing "0" would be wrong.
      if (p.price != null) {
        productSchema.offers = {
          "@type": "Offer",
          "url": `${SITE}${path}`,
          "priceCurrency": "AUD",
          "price": p.price,
          "priceValidUntil": "2027-12-31",
          "itemCondition": "https://schema.org/NewCondition",
          "availability": "https://schema.org/InStock",
          "seller": {
            "@type": "AutoPartsStore",
            "name": "Aurex Truck Parts Australia"
          }
        };
      }
      trail = [["Home", "/"], ["Shop", "/shop"]];
      if (p.categorySlug) {
        trail.push([categoryName(p.categorySlug), `/shop/${p.categorySlug}`]);
        const sub = subContentFor(p.categorySlug, subSlug(p.sub));
        if (sub) trail.push([sub.name, `/shop/${p.categorySlug}/${subSlug(p.sub)}`]);
      }
      trail.push([p.name, path]);
    } else {
      title = branded("Part Detail");
      desc = "Specifications, fitment, freight and pricing for this Aurex Truck Parts line, stocked in Campbellfield VIC and shipped Australia-wide.";
    }
  } else {
    /* News articles get their real headline + excerpt. */
    const nm = pathname.match(/^\/news\/([^/]+)/);
    if (nm) {
      const a = NEWS.find((x) => x.slug === safeDecode(nm[1]));
      if (a) {
        title = branded(a.title);
        desc = a.excerpt || desc;
        if (a.img) {
          image = a.img.startsWith("http") ? a.img : `${SITE}${a.img}`;
        }
      } else {
        title = branded("Stock Notes");
      }
    } else if (shopMatch?.[2]) {
      /* Sub-category pages (/shop/:category/:type) have their own copy; types without it stay out of the index. */
      const [, cat, sub] = shopMatch;
      const entry = subContentFor(cat, sub);
      if (entry) {
        title = branded(entry.title);
        desc = entry.description;
        trail = [["Home", "/"], ["Shop", "/shop"], [categoryName(cat), `/shop/${cat}`], [entry.name, path]];
      } else {
        title = branded(categoryName(cat));
        thin = true;
      }
    } else if (guideMatch?.[1]) {
      const g = guideFor(safeDecode(guideMatch[1]));
      if (g) {
        title = branded(g.metaTitle || g.title);
        desc = g.description;
        trail = [["Home", "/"], ["Guides", "/guides"], [g.title, path]];
        article = {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": g.title,
          "description": g.description,
          "datePublished": g.updated,
          "dateModified": g.updated,
          "author": { "@type": "Organization", "name": BASE, "url": `${SITE}/` },
          "publisher": { "@id": `${SITE}/#store` },
          "mainEntityOfPage": SITE + path,
          "image": [DEFAULT_IMAGE],
        };
      } else {
        title = branded("Guides");
        thin = true;
      }
    } else {
      const hit = META.find(([rx]) => rx.test(path));
      if (hit) [title, desc] = hit[1];
      if (shopMatch) {
        trail = [["Home", "/"], ["Shop", "/shop"]];
        if (shopMatch[1]) trail.push([categoryName(shopMatch[1]), path]);
      } else if (guideMatch) {
        trail = [["Home", "/"], ["Guides", "/guides"]];
      }
    }
  }

  const notFound = productMissing || !KNOWN_ROUTES.some((rx) => rx.test(path));
  const robots = notFound || NOINDEX.test(path) ? "noindex, nofollow" : thin ? "noindex, follow" : "index, follow";

  const schemas = [
    productSchema && { id: "product-jsonld", data: productSchema },
    trail && !notFound && !thin && { id: "breadcrumb-jsonld", data: breadcrumbList(trail) },
    article && { id: "article-jsonld", data: article },
  ].filter(Boolean);

  return { title, desc: fitDescription(desc), image, robots, canonical: SITE + path, schemas };
}
