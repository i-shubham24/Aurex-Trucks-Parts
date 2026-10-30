/**
 * Build-time HTML for crawlers that don't run JavaScript (AI answer engines, parts of Bing, link previews).
 * Runs after `vite build` (see vite.config.js) and writes, into dist/:
 *   - app.html: the plain app shell. vercel.json rewrites every app route without its own file to it.
 *   - 404.html: the app shell with a "not found" snapshot, served for any other path with a 404 status.
 *   - sitemap-pages.xml: guides and type pages (the API's sitemap.xml covers the catalogue).
 *   - llms.txt: a plain-text map of the site and the business for AI assistants, from the same data as the pages.
 *   - <path>/index.html snapshots for products, categories, types, guides, articles and static pages, and
 *     index.html for the homepage. Each has the page's real <head> and a plain-HTML copy of its content.
 *
 * The live app is unchanged: index.html hides #seo-snapshot as soon as JavaScript runs, and React replaces
 * #root on load (createRoot, no hydration), so visitors never see it. Pages added after a deploy fall back to
 * app.html until the next build (the API triggers one on catalogue edits).
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getPageMeta, SITE } from "../src/seo/meta.js";
import { normalizeProduct } from "../src/api/normalizers/product.normalizer.js";
import { normalizeCategory } from "../src/api/normalizers/category.normalizer.js";
import { productImage } from "../src/data/images.js";
import { NEWS } from "../src/data/content.js";
import { COMPANY, FAQS } from "../src/data/company.js";
import { formatAUD } from "../src/data/products.js";
import { CATEGORY_CONTENT, CATEGORY_NAMES, HOME_CONTENT, SUB_CONTENT, subSlug } from "../src/data/seoContent.js";
import { GUIDES, guideFor } from "../src/data/guides.js";

const API = (process.env.PRERENDER_API_URL || "https://truck-parts-api.vercel.app/api/v1").replace(/\/$/, "");
const STATIC_PAGES = ["/about", "/contact", "/policies", "/tail-lift-enquiry", "/track"];
const SAFE_SEGMENT = /^[A-Za-z0-9._-]+$/;

const esc = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
const jsonLd = (obj) => JSON.stringify(obj).replace(/</g, "\\u003c");
const priceText = (p) => (p.price == null ? "Price on application: request a quote" : `$${p.price.toFixed(2)} AUD`);
const productLink = (p) => `<a href="/product/${encodeURIComponent(p.sku)}">${esc(p.name)}</a> (${esc(p.sku)}) ${esc(priceText(p))}`;
const linkList = (links) => `<ul>${links.map(([label, to]) => `<li><a href="${esc(to)}">${esc(label)}</a></li>`).join("")}</ul>`;
const crumbs = (trail) => `<nav aria-label="Breadcrumb">${trail.map(([label, to], i) => (i < trail.length - 1 ? `<a href="${esc(to)}">${esc(label)}</a>` : esc(label))).join(" › ")}</nav>`;

/* One retry after a short pause: a busy API (rate limit, cold start) shouldn't cost a page its snapshot. */
async function getJson(url, retries = 1) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`${url} answered ${res.status}`);
    return await res.json();
  } catch (err) {
    if (retries <= 0) throw err;
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return getJson(url, retries - 1);
  }
}

/* Swaps one attribute value in the built shell, failing loudly if the template no longer has the tag. */
function setTagContent(html, attr, key, value) {
  const rx = new RegExp(`(<meta ${attr}="${key}" content=")[^"]*(")`);
  if (!rx.test(html)) throw new Error(`index.html has no <meta ${attr}="${key}">`);
  return html.replace(rx, (_, open, close) => `${open}${esc(value)}${close}`);
}

function pageHtml(template, pathname, { product = null, body, canonical = true }) {
  const meta = getPageMeta(pathname, { product });
  let html = template.replace(/<title>[^<]*<\/title>/, `<title>${esc(meta.title)}</title>`);
  html = setTagContent(html, "name", "description", meta.desc);
  html = setTagContent(html, "name", "robots", meta.robots);
  html = setTagContent(html, "property", "og:title", meta.title);
  html = setTagContent(html, "property", "og:description", meta.desc);
  html = setTagContent(html, "property", "og:image", meta.image);
  html = setTagContent(html, "name", "twitter:title", meta.title);
  html = setTagContent(html, "name", "twitter:description", meta.desc);
  html = setTagContent(html, "name", "twitter:image", meta.image);
  // The homepage hero is the only page that needs its image preloaded.
  if (pathname !== "/") html = html.replace(/\s*<link rel="preload" as="image" href="\/images\/web\/aurex-tail-lift\.webp"[^>]*>/, "");

  const head = [
    canonical && `<link rel="canonical" href="${esc(meta.canonical)}" />`,
    canonical && `<meta property="og:url" content="${esc(meta.canonical)}" />`,
    // Same ids PageMeta uses, so the app updates these scripts instead of adding second copies.
    ...meta.schemas.map((s) => `<script type="application/ld+json" id="${s.id}">${jsonLd(s.data)}</script>`),
  ].filter(Boolean);
  html = html.replace("</head>", `    ${head.join("\n    ")}\n  </head>`);
  return withSnapshot(html, body);
}

function withSnapshot(html, body) {
  if (!html.includes('<div id="root"></div>')) throw new Error('index.html has no empty <div id="root">');
  return html.replace('<div id="root"></div>', `<div id="root"><div id="seo-snapshot">${body}</div></div>`);
}

function frame(categories, main) {
  const cats = categories
    .map((c) => `<li><a href="/shop/${encodeURIComponent(c.slug)}">${esc(c.name)}</a></li>`)
    .join("");
  return `<header><p><a href="/">${esc(COMPANY.name)}</a></p><nav aria-label="Main"><ul><li><a href="/shop">Shop all parts</a></li>${cats}<li><a href="/guides">Guides</a></li><li><a href="/tail-lift-enquiry">Tail lift enquiry</a></li><li><a href="/about">About</a></li><li><a href="/contact">Contact</a></li></ul></nav></header>`
    + (main ? `<main>${main}</main>` : "")
    + `<footer><p>${esc(COMPANY.name)} (${esc(COMPANY.legalName)}), ABN ${esc(COMPANY.abn)}</p>`
    + `<p>${esc(COMPANY.address)}</p>`
    + `<p>Phone <a href="${esc(COMPANY.phoneHref)}">${esc(COMPANY.phone)}</a> · Email <a href="mailto:${esc(COMPANY.email)}">${esc(COMPANY.email)}</a></p>`
    + `<p>Trading hours: ${esc(COMPANY.hours)}</p></footer>`;
}

/* Notes, FAQs and guide links, as on the category and type pages (ShelfContent in Shop.jsx). */
function shelfHtml(heading, content, typeLinks) {
  if (!content) return "";
  const guides = (content.guides || []).map(guideFor).filter(Boolean);
  return `<h2>${esc(heading)}</h2>${content.notes.map((n) => `<p>${esc(n)}</p>`).join("")}`
    + (content.faqs?.length ? `<h2>Common questions</h2><dl>${content.faqs.map((f) => `<dt>${esc(f.q)}</dt><dd>${esc(f.a)}</dd>`).join("")}</dl>` : "")
    + (guides.length ? `<h2>Guides</h2>${linkList(guides.map((g) => [g.title, `/guides/${g.slug}`]))}` : "")
    + (typeLinks.length ? `<h2>Shop by type</h2>${linkList(typeLinks)}` : "");
}

function productBody(p, category, related) {
  const img = productImage(p);
  const specs = Object.entries(p.specs || {}).filter(([, v]) => typeof v === "string" || typeof v === "number");
  const sub = category && SUB_CONTENT[`${category.slug}/${subSlug(p.sub)}`];
  const trail = [["Home", "/"], ["Shop", "/shop"]];
  if (category) trail.push([category.name, `/shop/${category.slug}`]);
  if (sub) trail.push([sub.name, `/shop/${category.slug}/${subSlug(p.sub)}`]);
  trail.push([p.name]);
  return crumbs(trail)
    + `<h1>${esc(p.name)}</h1>`
    + `<p>Part number ${esc(p.sku)}${p.sub ? ` · ${esc(p.sub)}` : ""}</p>`
    + (img ? `<img src="${esc(img)}" alt="${esc(p.name)}" loading="lazy" />` : "")
    + `<p><strong>${esc(priceText(p))}</strong> · ${esc(p.stockStatus)}</p>`
    + (p.desc && p.desc !== p.name ? `<p>${esc(p.desc)}</p>` : "")
    + (p.fit ? `<p>Fits: ${esc(p.fit)}</p>` : "")
    + (specs.length ? `<h2>Specifications</h2><table><tbody>${specs.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join("")}</tbody></table>` : "")
    + (related.length ? `<h2>You May Also Need</h2><ul>${related.map((s) => `<li>${productLink(s)}</li>`).join("")}</ul>` : "");
}

function guideBody(g) {
  const block = (b) => {
    if (b.h) return `<h2>${esc(b.h)}</h2>`;
    if (b.p) return `<p>${esc(b.p)}</p>`;
    if (b.list) return `<ul>${b.list.map((li) => `<li>${esc(li)}</li>`).join("")}</ul>`;
    if (b.table) return `<table><thead><tr>${b.table.head.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${b.table.rows.map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th>${esc(c)}</th>` : `<td>${esc(c)}</td>`)).join("")}</tr>`).join("")}</tbody></table>`;
    if (b.note) return `<aside><p>${esc(b.note)}</p></aside>`;
    if (b.links) return linkList(b.links.map((l) => [l.label, l.to]));
    return "";
  };
  return crumbs([["Home", "/"], ["Guides", "/guides"], [g.title]])
    + `<article><h1>${esc(g.title)}</h1><p>Updated ${esc(g.updated)} · Aurex trade counter, Campbellfield VIC</p>`
    + g.body.map(block).join("")
    + (g.sources.length ? `<h2>Source</h2>${linkList(g.sources.map((s) => [s.label, s.url]))}` : "")
    + "</article>";
}

function articleBody(post, category) {
  const sections = (Array.isArray(post.body) ? post.body : []).map((b) =>
    (b.h ? `<h2>${esc(b.h)}</h2>` : "")
    + (b.p ? `<p>${esc(b.p)}</p>` : "")
    + (Array.isArray(b.list) ? `<ul>${b.list.map((li) => `<li>${esc(li)}</li>`).join("")}</ul>` : ""));
  return `<article><h1>${esc(post.title)}</h1>`
    + ((post.summary || post.excerpt) ? `<p>${esc(post.summary || post.excerpt)}</p>` : "")
    + (sections.length ? sections.join("") : post.content ? `<p>${esc(post.content)}</p>` : "")
    + "</article>"
    + (category ? `<p><a href="/shop/${encodeURIComponent(category.slug)}">Shop ${esc(category.name)}</a></p>` : "");
}

function sitemapXml(entries) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`
    + entries.map(([p, lastmod]) => `  <url><loc>${esc(SITE + p)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}</url>`).join("\n")
    + "\n</urlset>\n";
}
const guideSitemapEntries = () => [["/guides", GUIDES.map((g) => g.updated).sort().pop()], ...GUIDES.map((g) => [`/guides/${g.slug}`, g.updated])];

async function write(outDir, pathname, html) {
  const dir = path.join(outDir, ...pathname.split("/").filter(Boolean));
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, "index.html"), html);
}

/**
 * Writes the files the routing in vercel.json depends on: app.html (the app shell), 404.html and
 * sitemap-pages.xml (guides only until prerender() adds the type pages). Needs no API, and the build fails if
 * this fails, so a deployment without them is never published. Run before prerender(), on the untouched shell.
 */
export async function writeShellPages(outDir) {
  const template = await readFile(path.join(outDir, "index.html"), "utf8");
  await writeFile(path.join(outDir, "app.html"), template);
  const body = frame([], `<h1>Page not found</h1><p>This page doesn't exist or has moved.</p><p><a href="/shop">Shop all parts</a> · <a href="/contact">Contact the counter</a></p>`);
  // An unknown path gets the same title and noindex the app gives it, and no canonical.
  await writeFile(path.join(outDir, "404.html"), pageHtml(template, "/404-not-found", { body, canonical: false }));
  await writeFile(path.join(outDir, "sitemap-pages.xml"), sitemapXml(guideSitemapEntries()));
  await writeFile(path.join(outDir, "llms.txt"), llmsTxt());
}

/* https://llmstxt.org: what the business is, how to reach it, and where each part of the range lives. */
function llmsTxt() {
  const link = (label, p) => `- [${label}](${SITE}${p}): ${getPageMeta(p).desc}`;
  return [
    `# ${COMPANY.name}`,
    "",
    "> Trade counter in Campbellfield, Melbourne supplying hydraulic tail lifts, truck and trailer body hardware and fleet accessories, shipped Australia-wide.",
    "",
    `- Business: ${COMPANY.legalName}, ABN ${COMPANY.abn}`,
    `- Address: ${COMPANY.address}`,
    `- Hours: ${COMPANY.hours} (closed weekends)`,
    `- Phone: ${COMPANY.phone} · Email: ${COMPANY.email}`,
    "- Prices are in AUD and include GST. Stocked lines ordered by 2pm are dispatched the same business day. Tail lifts and some panels are priced on application.",
    "",
    "## Shop",
    link("All products", "/shop"),
    ...Object.entries(CATEGORY_NAMES).map(([slug, name]) => link(name, `/shop/${slug}`)),
    "",
    "## Part types",
    ...Object.entries(SUB_CONTENT).map(([key, e]) => link(e.title, `/shop/${key}`)),
    "",
    "## Guides",
    ...GUIDES.map((g) => link(g.title, `/guides/${g.slug}`)),
    "",
    "## Help",
    link("Tail lift quote", "/tail-lift-enquiry"),
    link("Contact the counter", "/contact"),
    link("Shipping, returns and policies", "/policies"),
    link("About Aurex", "/about"),
    "",
  ].join("\n");
}

/** Writes the snapshots into outDir (the Vite build output). Returns the number of pages written. */
export async function prerender(outDir) {
  const template = await readFile(path.join(outDir, "app.html"), "utf8");
  // Fail before writing anything if the template has drifted from what the helpers expect.
  pageHtml(template, "/about", { body: "" });

  const [productsRes, categoriesRes, blogsRes, settingsRes] = await Promise.allSettled([
    getJson(`${API}/products?limit=500`),
    getJson(`${API}/categories`),
    getJson(`${API}/blogs?limit=100`),
    getJson(`${API}/settings`),
  ]);
  const catalogueOk = productsRes.status === "fulfilled" && categoriesRes.status === "fulfilled";
  if (!catalogueOk) {
    console.warn(`[prerender] catalogue unavailable, skipping shop and product pages: ${(productsRes.reason || categoriesRes.reason)?.message}`);
  }

  const raw = (res, ...keys) => {
    if (res.status !== "fulfilled") return [];
    const j = res.value;
    for (const k of keys) {
      const v = k.split(".").reduce((o, part) => o?.[part], j);
      if (Array.isArray(v)) return v;
    }
    return [];
  };
  const products = raw(productsRes, "data.products", "products", "items")
    .map(normalizeProduct)
    .filter((p) => p && SAFE_SEGMENT.test(p.sku))
    .sort((a, b) => a.sku.localeCompare(b.sku, undefined, { numeric: true }));
  const categories = raw(categoriesRes, "data.categories", "categories", "items")
    .map(normalizeCategory)
    .filter((c) => c && SAFE_SEGMENT.test(c.slug))
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const catBySlug = new Map(categories.map((c) => [c.slug, c]));

  // The app shows a CMS post when there is one and falls back to the built-in NEWS copy.
  const apiPosts = raw(blogsRes, "data.blogs", "blogs").filter((b) => b.slug && SAFE_SEGMENT.test(b.slug));
  const posts = [...apiPosts, ...NEWS.filter((n) => !apiPosts.some((b) => b.slug === n.slug))];
  // Mirrors Article.jsx, which links each story to the shelf it's about.
  const TAG_CAT = { "Tail Lifts": "tail-lifts", "Trailer Parts": "trailer-parts", "Accessories": "accessories", "Tool Boxes": "accessories" };

  let count = 0;
  for (const pathname of STATIC_PAGES) {
    const { title, desc } = getPageMeta(pathname);
    await write(outDir, pathname, pageHtml(template, pathname, {
      body: frame(categories, `<h1>${esc(title.split(" | ")[0])}</h1><p>${esc(desc)}</p>`),
    }));
    count++;
  }

  for (const post of posts) {
    const tag = Array.isArray(post.tags) && post.tags[0] ? post.tags[0] : post.tag;
    const pathname = `/news/${post.slug}`;
    await write(outDir, pathname, pageHtml(template, pathname, {
      body: frame(categories, articleBody(post, catBySlug.get(TAG_CAT[tag] || post.category || "trailer-parts"))),
    }));
    count++;
  }

  // Guides are static content, so they're written even when the catalogue can't be read.
  await write(outDir, "/guides", pageHtml(template, "/guides", {
    body: frame(categories, crumbs([["Home", "/"], ["Guides"]]) + `<h1>Truck &amp; Trailer Parts Guides</h1>`
      + `<ul>${GUIDES.map((g) => `<li><a href="/guides/${g.slug}">${esc(g.title)}</a>: ${esc(g.description)}</li>`).join("")}</ul>`),
  }));
  count++;
  for (const g of GUIDES) {
    await write(outDir, `/guides/${g.slug}`, pageHtml(template, `/guides/${g.slug}`, { body: frame(categories, guideBody(g)) }));
    count++;
  }

  const typePages = [];
  if (catalogueOk && products.length && categories.length) {
    const shopMain = crumbs([["Home", "/"], ["Shop"]]) + `<h1>Shop All Products</h1><p>All commercial lines across tail lifts, trailer parts and accessories.</p>`
      + categories.map((c) => `<h2><a href="/shop/${encodeURIComponent(c.slug)}">${esc(c.name)}</a></h2><ul>${products.filter((p) => p.categorySlug === c.slug).map((p) => `<li>${productLink(p)}</li>`).join("")}</ul>`).join("");
    await write(outDir, "/shop", pageHtml(template, "/shop", { body: frame(categories, shopMain) }));
    count++;

    // Type pages exist for types with their own copy and at least one product on the shelf.
    for (const [key, entry] of Object.entries(SUB_CONTENT)) {
      const [catSlug] = key.split("/");
      const category = catBySlug.get(catSlug);
      const items = products.filter((p) => p.categorySlug === catSlug && p.sub === entry.name);
      if (!category || !items.length) continue;
      const pathname = `/shop/${key}`;
      const siblings = Object.entries(SUB_CONTENT).filter(([k]) => k !== key && k.startsWith(`${catSlug}/`)).map(([k, e]) => [e.name, `/shop/${k}`]);
      const main = crumbs([["Home", "/"], ["Shop", "/shop"], [category.name, `/shop/${catSlug}`], [entry.name]])
        + `<h1>${esc(entry.title)}</h1><p>${esc(entry.intro)}</p>`
        + `<ul>${items.map((p) => `<li>${productLink(p)}</li>`).join("")}</ul>`
        + shelfHtml(`${entry.title}: what to know`, entry, siblings);
      await write(outDir, pathname, pageHtml(template, pathname, { body: frame(categories, main) }));
      typePages.push([pathname, null]); // the public product list carries no updatedAt to date it by
      count++;
    }
    const liveTypes = new Set(typePages.map(([p]) => p));

    for (const c of categories) {
      const pathname = `/shop/${c.slug}`;
      const typeLinks = Object.entries(SUB_CONTENT).filter(([k]) => k.startsWith(`${c.slug}/`) && liveTypes.has(`/shop/${k}`)).map(([k, e]) => [e.name, `/shop/${k}`]);
      const main = crumbs([["Home", "/"], ["Shop", "/shop"], [c.name]])
        + `<h1>${esc(c.name)}</h1>` + (c.blurb ? `<p>${esc(c.blurb)}</p>` : "")
        + `<ul>${products.filter((p) => p.categorySlug === c.slug).map((p) => `<li>${productLink(p)}</li>`).join("")}</ul>`
        + shelfHtml(CATEGORY_CONTENT[c.slug]?.heading || c.name, CATEGORY_CONTENT[c.slug], typeLinks);
      await write(outDir, pathname, pageHtml(template, pathname, { body: frame(categories, main) }));
      count++;
    }

    // Product pages use the detail endpoint, as the app does: the list carries a shorter description.
    const queue = products.map((p) => p.sku);
    let failed = 0;
    const worker = async () => {
      for (let sku = queue.shift(); sku; sku = queue.shift()) {
        try {
          const j = await getJson(`${API}/products/${encodeURIComponent(sku)}`);
          const p = normalizeProduct(j.data?.product || j.product);
          if (!p || p.sku !== sku) throw new Error("unexpected payload");
          const related = (j.data?.relatedProducts || j.relatedProducts || []).map(normalizeProduct).filter((r) => r && SAFE_SEGMENT.test(r.sku));
          const pathname = `/product/${sku}`;
          await write(outDir, pathname, pageHtml(template, pathname, {
            product: p,
            body: frame(categories, productBody(p, catBySlug.get(p.categorySlug), related)),
          }));
          count++;
        } catch {
          failed++; // that page falls back to the plain app shell
        }
      }
    };
    await Promise.all(Array.from({ length: 8 }, worker));
    if (failed) console.warn(`[prerender] ${failed} product page(s) skipped`);
  }

  // Homepage: index.html is only served for "/", since app routes are rewritten to app.html.
  // Same free-freight amount the app puts into the FAQ answers (Home.jsx).
  const settings = settingsRes.status === "fulfilled" ? settingsRes.value?.data?.settings || settingsRes.value?.settings || {} : {};
  const freeOver = formatAUD(settings.freeFreightOver || 200);
  const homeMain = `<h1>${esc(HOME_CONTENT.h1)}</h1><h2>${esc(HOME_CONTENT.heading)}</h2>`
    + HOME_CONTENT.paragraphs.map((p) => `<p>${esc(p.replace("{address}", COMPANY.address))}</p>`).join("")
    + linkList(HOME_CONTENT.links)
    + `<h2>Guides</h2>${linkList(GUIDES.map((g) => [g.title, `/guides/${g.slug}`]))}`
    + `<h2>Straight Answers</h2><dl>${FAQS.map((f) => `<dt>${esc(f.q)}</dt><dd>${esc(f.a.split("$500").join(freeOver))}</dd>`).join("")}</dl>`;
  await writeFile(path.join(outDir, "index.html"), pageHtml(template, "/", { body: frame(categories, homeMain) }));
  count++;
  // The app shell also serves new products and app-only routes, so it gets site-wide content only.
  await writeFile(path.join(outDir, "app.html"), withSnapshot(template, frame(categories, "")));
  await writeFile(path.join(outDir, "sitemap-pages.xml"), sitemapXml([...guideSitemapEntries(), ...typePages]));
  return count;
}
