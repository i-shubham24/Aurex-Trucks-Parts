# Aurex Truck Parts Website Rebuild — Revised Implementation Plan

## 1. Goal

Rebuild the Aurex Truck Parts website as a focused Australian truck-parts catalogue/storefront using only the products approved in the client’s three product catalogues. Retain the current Aurex logo, remove the unwanted orange styling, use the navy/silver/white identity shown in the supplied logo image, and use Sunrise International only as a competitor reference for market structure and comparable customer-facing pricing.

The final site should help fleet operators, workshops, transport businesses, and truck owners find the correct part quickly, inspect technical information, and submit a product enquiry or proceed through an approved cart/quote flow.

## 2. Files currently available and their roles

The sandbox currently contains the Aurex logo image, a fetched Sunrise reference page, the Guangzhou Caiyuan supplier quotation, and the newly attached `PI-GLYHM26091414-1_260917_150058.pdf`.

The newly attached document is a **three-page pro forma invoice**, dated 14 August 2026, from Zhejiang Fangze New Energy Technology Co. Ltd. / Jiaxing Ganland Auto Parts Co. Ltd. It contains product references and supplier imagery for hinges, door locking gear, locks, Q track/F track, end caps, retainers, handles, cargo bars, end fittings, a steel toolbox, and a roller. It also contains EXW supplier prices, quantities/MOQs, total cost, deposit/balance/payment conditions, shipping terms, insurance terms, supplier banking information, and other transaction terms.

This PI is useful as **internal procurement evidence and a possible product-reference/image source**, but it is not sufficient by itself to define the approved website inventory. The three requested product catalogues are still not visible in the sandbox-mounted upload/project tree. They must be located through the managed project files or re-attached before catalogue import can begin.

The PI’s supplier cost, EXW pricing, MOQs, order quantities, deposit/balance terms, bank information, supplier contacts, invoice totals, and transaction conditions must never appear in public product pages, client-side JSON, public APIs, metadata, search-indexed content, or customer quotations. The document should be stored/handled as restricted procurement material.

## 3. Product-reference reconciliation

After the three catalogues are available, create a private reconciliation worksheet with one row per PI line item. At minimum capture source document, supplier item number, public candidate name, technical description, quantity/MOQ, supplier cost/currency, EXW terms, image availability, matching catalogue SKU/page, proposed Aurex category, public-approval status, and manual-review notes.

The PI line items should be checked against the catalogues rather than imported automatically. Potential matches include:

| PI reference | Product reference | Likely Aurex area | Public-use rule |
|---|---|---|---|
| GL-13112, GL-13198B, GL-13199SS, GL-23116, GL-13213 | Steel/stainless hinges and rubber buffer | Tool boxes, trailer parts, accessories, or replacement parts | Publish only if present and approved in the catalogues |
| GL-11113, GL-11113S | 27 mm steel/stainless truck door locking gear | Tool boxes or replacement parts | Keep left/right and latch variants distinct |
| GL-12140 | Zinc alloy lock | Tool boxes or accessories | Verify technical fitment before publishing |
| GL-19113H1, GL-19113SH1, GL-19111H1 | Steel/stainless Q track and steel F track | Accessories or tool/other | Preserve material, length, and 4.5 m distinctions |
| GL-19116, GL-19116B | Plastic end caps | Replacement parts or accessories | Do not merge variants without catalogue confirmation |
| GL-16511S, GL-16513 | Stainless-steel/steel door retainers | Tool boxes or replacement parts | Verify mounting/application |
| GL-14175B, GL-14175 | Steel/stainless handles | Tool boxes or replacement parts | Preserve material and mounting-base differences |
| GL-15616 | Steel cargo bar | Accessories or tool/other | Verify whether handle is included |
| GL-19120, GL-19117 | Steel end fittings | Accessories or replacement parts | Preserve strap/inclusion notes |
| GL-25126 | Steel toolbox 1200 × 450 × 400 | Tool boxes | Confirm dimensions and public imagery |
| FZ-26184 | Roller | Tool/other or replacement parts | Require catalogue match and application confirmation |

The exact category assignment must follow the approved catalogues, not the preliminary guesses above. The PI supplier images can be used only if the client confirms rights/permission and the images accurately represent the approved public product. Otherwise, use catalogue imagery or an “Image coming soon” placeholder.

## 4. Category decision

The request says “5 tabs” but enumerates six categories. The working information architecture preserves all six named categories:

1. Tail lifts
2. Tool boxes
3. Trailers parts
4. Accessories
5. Replacement parts
6. Tool and others

Before implementation, confirm whether the client intends five tabs or six. If no correction is supplied, implement six tabs and preserve the client’s wording, or use a grammar-approved label such as “Tools and Others” only after client approval.

## 5. Catalogue ingestion and product governance

Once the three product PDFs are accessible, inventory each file, extract text/tables, render pages where necessary, and build a canonical product register. The register should contain product name, SKU/model, approved category, subcategory, description, dimensions, materials, fitment/application, variants, catalogue page, image availability, and source confidence.

Deduplicate repeated products and retain variant distinctions. Normalize units and spelling without changing technical meaning. Any unreadable or ambiguous value must be flagged for manual review rather than guessed.

The register is the public catalogue’s single source of truth. Existing website products that do not appear in the approved PDFs will be removed from the public experience only after the new register is validated and a reversible backup/checkpoint exists. Sunrise-only products and PI/quotation-only products must not be added automatically.

## 6. Image policy

Use clear product images extracted from the approved catalogues where practical and permitted. The PI includes small supplier images for several products; these should be treated as references pending rights and quality approval, not automatically as final web assets. Crop excess PDF whitespace and standardize image presentation. Where no usable approved image exists, show a deliberate “Image coming soon” placeholder and retain the product name/SKU. Do not substitute unrelated Sunrise images.

All sizeable web media should be uploaded through the project’s managed storage workflow rather than bundled into frontend source directories.

## 7. Sunrise competitor research and pricing

Sunrise will be researched only for products that have a confirmed materially equivalent match in the Aurex product register. Capture the Sunrise URL, observed title, SKU where available, matching variant, displayed Australian price, and capture date in an internal price-audit record. Sunrise content will not be copied wholesale, and prices will not be treated as a live external dependency.

Apply the client’s instruction to price Aurex products AUD $15–$20 below the verified Sunrise reference. The proposed deterministic rule is AUD $20 below for references of AUD $100 or more and AUD $15 below for references under AUD $100, with negative or unusually low results flagged for review. Variant prices should be calculated independently and rounded to a sensible retail increment. If no verified Sunrise match exists, display “Enquire for price” instead of guessing.

The client must approve the exact reduction formula before launch because “$15 to $20” is a range. Supplier EXW costs from either the quotation or PI must not be used as customer-facing prices unless the client separately approves a margin/pricing model; the current instruction is to base customer pricing on Sunrise comparison instead.

## 8. Brand and visual system

Keep the current Aurex logo unchanged for this phase. Sample the supplied logo image to establish CSS design tokens rather than approximating colours manually. The palette should use deep truck-industry navy, darker navy, metallic/cool silver, light silver-grey, white, dark ink, and muted grey. Orange must be removed from the theme, navigation, CTAs, badges, and promotional surfaces except where it occurs inside an approved source image.

Use a contemporary, highly legible sans-serif. Use compact uppercase labels selectively for SKUs and category navigation, but keep technical product titles readable. The design should feel robust, precise, and professional rather than like a generic discount store. Include visible keyboard focus states, accessible labels, responsive layouts, and reduced-motion support.

## 9. Proposed site structure

The global shell should contain a contact/announcement strip, Aurex logo, six-category desktop navigation, mobile navigation drawer, search, enquiry/cart affordance, and a footer with approved contact, policy, and service information.

The home page should include a clear truck-parts hero, Browse Products and Request an Enquiry actions, six category cards, selected verified catalogue products, a concise Aurex value proposition, approved service/trust statements, and an enquiry CTA. Avoid unsupported claims about certification, dispatch times, stock, returns, or Australian manufacture unless the client confirms them.

Each category page should show a category-grounded description, relevant filters derived only from real catalogue fields, sorting, responsive product cards, SKU, title, image or placeholder, short technical summary, verified price or enquiry-only state, and a details/enquiry action.

Each product page should show name, SKU, category, image state, verified description, specifications, fitment/application, options or variants, price status, enquiry CTA, and related products from the same approved register. If checkout is enabled, priced products may be added to cart; products without verified prices should use Request a Quote/Enquire instead.

Enquiry forms should capture name, phone, email, state/location, product name, SKU, quantity, and message. Product context should be prefilled. If the existing project supports cart functionality, preserve it only for approved products and prevent internal supplier fields from reaching the client.

## 10. Data architecture

First inspect the existing managed WebDev project type. For a static project, use a typed catalogue data module generated from the validated register. For a full-stack project, use public product/category read models and a controlled import path. Do not expose supplier quotation or PI fields through public APIs or client-side data.

Recommended public records are categories, products, product variants, product media, price audits, and customer enquiries. Supplier quotation/PI records should live in a restricted internal import/audit file or protected administrative data model, separate from public product content.

Reusable UI components should include the header, category navigation, product card, filter controls, specification table, enquiry form/dialog, image placeholder, and footer. Keep colour tokens in the global stylesheet.

## 11. Safe execution sequence

1. Locate the three approved catalogues in the managed project or request re-attachment if they are not available.
2. Identify the project type and create a reversible checkpoint/backup.
3. Extract and validate the complete product register from the three catalogues.
4. Reconcile the Guangzhou quotation and Ganland PI items against that register in a private audit sheet; do not publish procurement costs or banking data.
5. Confirm the five-versus-six category decision and map every approved product.
6. Produce an import preview showing products to keep, remove, merge, flag, and hold for manual review.
7. Research Sunrise matches and record internal price audits.
8. Obtain approval for the deterministic $15/$20 pricing rule.
9. Import verified public product records and approved media.
10. Replace the orange theme with sampled Aurex navy/silver/white tokens and retain the current logo.
11. Rebuild navigation, home, category, detail, search, enquiry, and cart/quote experiences.
12. Remove unsupported public products only after reconciliation passes.
13. Run technical, visual, responsive, accessibility, and content verification.
14. Present the production preview for client review before publishing.

## 12. Verification plan

Every displayed product must have a source catalogue and page reference, an approved category, and no duplicate/incorrectly merged SKU. All displayed prices must have either a verified Sunrise audit or an explicit enquiry-only status. Missing imagery must be visibly marked. Supplier cost, MOQs, EXW pricing, banking information, invoice totals, and procurement conditions from both supplier documents must be absent from public HTML, client-side JSON, APIs, page metadata, and search output.

Verify that all six category links work on desktop and mobile, search finds names and SKUs, filters use only available catalogue fields, variants remain distinct, enquiry forms preserve product context, and priced versus enquiry-only products behave correctly. Check that no orange theme styles remain outside source imagery and that the Aurex logo remains legible and accessible.

Run the project’s typecheck, build, and test commands; check broken image URLs, missing routes, console errors, failed requests, direct URL refreshes, mobile drawer behaviour, keyboard focus, contrast, and reduced-motion behaviour at mobile, tablet, laptop, and wide desktop sizes.

## 13. Open decisions and risks

The three product catalogues remain the main missing prerequisite. The quotation and PI are useful procurement/product-reference evidence but cannot replace them. The tab count remains unresolved. The exact price-reduction formula requires approval. Checkout versus enquiry-only scope must be confirmed. Sunrise content and imagery should not be copied without permission. Competitor prices may change, so imported references require review dates. Supplier documents contain confidential commercial and banking information and must remain restricted. Finally, the managed project type and current product data model must be inspected before any destructive migration.

## 14. Approval gate

Implementation should start after approval of this plan and confirmation of: access to the three product catalogues; five versus six categories; the exact $15/$20 pricing rule; and checkout versus enquiry scope. The quotation and pro forma invoice will be treated as confidential internal procurement material and will not be exposed on the public site.
