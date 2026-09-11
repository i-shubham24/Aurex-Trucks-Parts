# AurexTruckParts.com.au: Deep Research and Implementation Blueprint

Prepared as: Principal UX researcher, senior Vite React architect, enterprise e-commerce strategist.
Scope: Australian heavy truck and trailer spares, B2B trade plus B2C retail, ruthless conversion focus.
Aesthetic north star: rugged yet premium, heavily animated, image rich. Orange nav, black footer, Throtl grade motion, header architecture taken from the red reference screenshots (FLEXA, PACCAR, CarParts), catalog realism and AU trade voice from Sunrise International.

Formatting rule honoured throughout: no em dashes, no en dashes, no double hyphens. Separation is done with colons, commas, and bullets.

---

## 0. How this plan maps to what already exists

This is not a greenfield build. The repo already ships a working storefront plus an admin portal. The plan below marks every item as one of: KEEP, EXTEND, or NEW, so no existing work is thrown away.

Current stack (from package.json):
- React 19.2, Vite 8.3, Tailwind v4.3 (token driven via `@theme` in `src/index.css`), framer-motion 13.2, lucide-react, react-router-dom 7.
- Providers already nested in `src/App.jsx`: Auth, Site, Products, Shop, Garage.
- Theme tokens already defined: `--color-primary #E53E00`, `--color-primary-light #FF6B35`, `--color-primary-dark #C23400`, `--color-dark #1A1A2E`, `--color-accent #FFBB00`, plus custom utilities (`shine`, `grid-scrim`, `link-underline`, `animate-marquee`, `animate-floaty`, `shadow-primary`).
- Data model in `src/data/catalog.js`: `CATEGORIES[]` and a flat `PRODUCTS[]` (fields: sku, name, price, oldPrice, cat, brand, rating, reviews, badge, fit, stock, oem, desc, specs[]).
- Garage context in `src/components/garage/GarageContext.jsx`: localStorage backed vehicles plus selected id, but NOT yet wired to filter the catalog.

The four biggest gaps this blueprint closes:
1. Fitment is free text (`fit: "Suits Volvo FH front"`). There is no structured Year, Make, Model, Engine (YMM) data, so the Garage cannot actually filter. Phase 3 fixes this.
2. There is no B2B trade portal (wholesale login, tiered pricing, bulk order pad). Phase 1 and Phase 3 add it.
3. The header is a standard nav, not the bold coloured utility bar plus mega search plus horizontal category rail seen in the red screenshots. Phase 1 and Phase 4 rebuild it.
4. The motion layer is present but light. Phase 2 raises it to Throtl grade without hurting load speed.

Brand asset action item: two real Aurex wordmark files were supplied (an orange version and a black version). They need to be saved into the repo and wired into `src/components/logo.jsx`, replacing the generated SVG `Mark`. Recommended: `public/brand/aurex-logo-orange.png` and `public/brand/aurex-logo-black.png` plus an SVG export of each if available. Usage rule: black logo on light or on the orange nav bar (black on orange is high contrast and on brand), orange logo on black footer and dark hero panels.

---

## 1. Deep research synthesis: what the 35 platforms actually do

The pool splits into four archetypes. Each contributes specific, copyable patterns. This section is the evidence base for every Phase 1 decision.

### 1.1 Australian heavy duty (MaxiPARTS, Truckline, PACCAR Parts Australia, Whites Diesels, Multispares, All States Trailer Spares, Bendix Australia)

What they get right and what Aurex should take:
- Part number first search. PACCAR literally labels its search field "Enter part number to search". The primary retrieval path for trade buyers is the exact SKU or OEM number, not vehicle browse. Aurex search must accept SKU, OEM cross number, and keyword, in that priority.
- Branch and stock reality. MaxiPARTS and Truckline surface a branch network and per branch stock. Aurex catalog already carries `stock: "In stock VIC"`. Elevate this to a stock signal on every card and PDP.
- Category taxonomy is application led, not brand led. PACCAR groups by Braking Systems, Axle and Wheel End, Cab, Chassis, Cleaning, Electrical, Engine, Filtration, Lighting, Lubricants and Fluids. Aurex `CATEGORIES` already mirrors this shape. Keep it.
- Trade account is a first class citizen. Multispares and Truckline gate net pricing and account ordering behind a trade login. This validates the B2B portal in Phase 1.
- ADR and compliance language. Bendix Australia and the trailer spares vendors lean on Australian Design Rule (ADR) compliance and rating callouts (ATM, GTM, kg ratings). The catalog already speaks this ("ADR Tested", "3.5T ATM", "850kg rated"). Amplify it as trust copy.

### 1.2 Australian mainstream (Sparesbox, Automotive Superstore, Supercheap Auto, Repco, ARB 4x4, Fulcrum Suspensions, Ryco Filters, Outback Equipment)

- Sparesbox and Repco are the local benchmark for the YMM "rego or vehicle" selector pinned at the top of the page and persisted as a garage. Repco offers rego lookup by state. Sparesbox drives the whole PLP off the selected vehicle with a persistent "Shopping for: [vehicle]" bar. Aurex should copy the persistent fitment bar pattern exactly.
- Supercheap Auto and Repco show click and collect plus delivery toggles early. For heavy freight this becomes a depot pickup versus freight quote toggle.
- Ryco and Bendix show the "find by vehicle" plus "find by part number" dual entry. Keep both entries visible.
- ARB 4x4 is the local reference for premium rugged aesthetic: full bleed imagery, confident type, build and fit guides. This is the closest AU analogue to the Throtl feel the client wants.

### 1.3 Global heavy duty (FleetPride, FinditParts, Raneys, Iowa 80, Ryder Fleet Products, Vander Haags)

- FinditParts is the master class in cross reference. Every PDP lists interchange or cross reference part numbers in a table, plus "fits these makes and models". Aurex PDP must add a cross reference table driven by the `oem` field expanded into an array.
- Raneys and Iowa 80 prove the emotional, image heavy, chrome and accessories browse works for truckies. Big category tiles, fitment by truck make (Kenworth, Peterbilt, Volvo, Freightliner), and heavy use of "fits" badges.
- FleetPride shows the account driven, quote driven B2B flow: request a quote, bulk order, account manager. Aurex already has `/quote` and an admin `AdminQuotes`. Extend into the trade portal.
- Vander Haags and Ryder show new plus used plus remanufactured condition tags. Aurex can add a `condition` field later (New, Reman, Exchange) for prime mover drivetrain parts.

### 1.4 Global e-commerce leaders (FCP Euro, CarParts.com, RealTruck, ECS Tuning, Throtl, AutoZone, Autodoc, Mishimoto, Summit Racing, JEGS, RockAuto, Advance Auto, O Reilly, Pelican Parts)

- Throtl (the client favourite): dark, high energy homepage, large circular category browse tiles (Cat Back Exhaust, Coil Over Kits, Cold Air Intakes, Wheels, Clutch Kits, Hoods, Headlights, Lowering Kits, Radiators), a rewards and community hook, and smooth scroll reveals. Aurex adopts the circular category browse and the dark premium band, translated to trucks.
- RockAuto: the definitive exploded catalog tree and cross reference. Deeply nested category to sub category to part type, plus alternate and OEM part tables. Aurex mega menu should feel as complete but far more designed.
- FCP Euro: lifetime warranty as a headline trust weapon, vehicle selector front and centre, kit bundles ("everything you need for this job"). Aurex should ship a "Complete the job" kit bundle module on the PDP (the catalog already has kits like DIYTAE and HTKS).
- Summit Racing and JEGS: faceted PLP with dense, fast filters, and a "your recently viewed" plus "customers also bought" rail. Aurex PLP sidebar should be dense and instant.
- CarParts.com and Autodoc: the "Add Vehicle" pill plus part search combined into one bar, and aggressive fitment guarantee copy ("Guaranteed to fit or your money back"). Aurex adopts a fitment guarantee.
- ECS Tuning and Mishimoto: enthusiast grade PDP with exploded diagrams, install difficulty, torque specs, and "what is in the box". Aurex PDP spec table borrows this structure.
- AutoZone, Advance Auto, O Reilly: store pickup in minutes, loaner tools, and a "vehicle plus part" URL structure good for SEO. Aurex should keep clean `/shop/:category` and `/product/:sku` routes plus fitment query params.

### 1.5 Sunrise International (primary catalog realism reference)

Sunrise is the source of the SKU voice, the three featured application panels (Jockey Wheels, Tipper Kits, Winches), the trust badge row, and the hero headline tone. The catalog already mirrors its SKUs (JW8SSHDEL-90, EB10P-L, HCCZ, EW3000R). Keep Sunrise as the content and taxonomy anchor while lifting the visual bar to Throtl and the header to the red references.

### 1.6 The single synthesis Aurex should build

Header and nav: red reference architecture (coloured utility strip, dominant part number search, horizontal category rail with mega menu, persistent fitment bar).
Homepage browse: Throtl circular category tiles plus dark premium bands plus scroll reveals.
Retrieval: part number first, YMM second, both always visible (Ryco, PACCAR, Sparesbox).
PDP: FinditParts cross reference plus FCP kit bundles plus ECS spec depth plus ADR trust.
B2B: FleetPride and Multispares trade account with tiered net pricing and a bulk order pad.
Voice and SKUs: Sunrise and the existing AU trailer and truck catalog.

---

## PHASE 1: DEEP CONTENT AND UI STRATEGY

Every screen below lists layout, exact micro-copy, and the components involved. Micro-copy is written in Australian voice and is ready to paste. All KEEP or EXTEND references point at real files in the repo.

### 1.1 Global header (NEW build, replacing current nav)

Reference: the red FLEXA and PACCAR and CarParts screenshots. Three stacked rows on desktop, collapsing to a drawer on mobile.

Row 1: utility strip (orange background `--color-primary`, black or white text)
- Left: phone and email as quick contact. Copy: `Trade desk 1300 AUREX1` and `parts@aurextruckparts.com.au`.
- Left secondary: `Ships Australia wide from VIC`.
- Right: `Find a branch`, `Track my order`, `Trade login`, and a small AUD selector reading `AUD $`.
- Right end: social icons (Instagram, Facebook, LinkedIn) matching the red references.

Row 2: brand plus search plus account (white background)
- Left: Aurex logo (black wordmark on white). Component: `LogoFull` in `src/components/logo.jsx` (EXTEND to use the real asset).
- Centre: the dominant search bar. Placeholder cycles copy: `Search part number, OEM number, or keyword`. This is the CarParts and PACCAR pattern. A left side chip inside the bar reads `All categories` and opens a dropdown scope. Component: `SearchBar` (EXTEND).
- Right: three icon actions with labels underneath, matching CarParts (`Account`, `Wishlist`, `Cart`). Cart shows a live count badge fed by `useShop().count`.

Row 3: category rail plus fitment (dark or orange band)
- Left: a bold `Shop by category` button with a grid icon that opens the mega menu.
- Then a horizontal rail of top categories: Braking, Suspension, Engine, Electrical, Filters, Lighting, Towing, Tipper, Body, Fasteners, Load Restraints.
- Right: the Garage pill. Copy when empty: `Add your truck`. Copy when set: `[2019 Kenworth T610]` with a small down chevron. Component: `YMMWidget` plus `GarageContext` (EXTEND to filter).

Sticky behaviour: on scroll down past the hero, Row 1 hides, Rows 2 and 3 condense into one slim sticky bar (logo mark only, search, cart, garage pill). This is the RealTruck and Summit pattern.

Micro-copy bank for the header:
- Empty garage tooltip: `Tell us your truck once. We filter every part to fit.`
- Search empty state hint under the bar: `Try a part number like EB10P-L, an OEM number, or say what you need.`
- Trade login hover: `Net pricing, bulk order pad, and account terms.`

### 1.2 Mega menu (EXTEND `src/components/navigation/MegaMenu.jsx`)

Structure: a three region panel that opens under the category rail, full width, dark surface with orange accents.

Region A (left rail, 22 percent width): the 13 top categories from `CATEGORIES`, each a row with its lucide icon, name, and part count. Hovering a category swaps Regions B and C.

Region B (centre, 48 percent): the selected category expanded into sub categories, taken from the `subs[]` array already in `catalog.js`. Example for Braking: Backing plates, Drum kits, Disc rotors, Brake lines, plus expanded children we should add (Brake controllers, Magnets, Breakaway kits, Brake shoes and pads). Each sub is a link to `/shop/braking?type=backing-plates`.

Region C (right, 30 percent): a visual promo slot. Two stacked cards:
- Top: a featured product or deal image with copy `Fleet pick: DIY Tandem Axle Electric Brake Kit` and a price chip.
- Bottom: a "Shop by truck make" grid of logos (Kenworth, Volvo, Isuzu, Hino, Mack, Scania, Fuso, UD, Freightliner, Iveco). Each links to `/shop?make=kenworth`.

Interaction copy:
- Region header: `Braking systems` with sub line `Drums, discs, plates, controllers, and full DIY kits`.
- A persistent footer strip inside the panel: `Not sure what fits? Add your truck and we filter this menu.`

Full taxonomy to encode (this is the deeply nested hierarchy, expand `CATEGORIES[].subs` and add a `children` level):

- Braking
  - Backing plates: Electric 10 inch, Electric 12 inch, Hydraulic 9 inch, Mechanical 9 inch
  - Drums and shoes: Drum kits, Brake shoes, Magnets
  - Disc and pads: Disc rotors, Pad sets, Calipers
  - Hydraulics and lines: Braided lines, Couplings, Wheel cylinders
  - Control and safety: Brake controllers, Breakaway kits, ABS sensors
- Suspension
  - Shock absorbers: Cab, Axle, Trailer
  - Air suspension: Air springs, Levelling valves, Bags by brand (Hendrickson, BPW)
  - Springs and bushes: Poly bush kits, U bolts, Hangers, Shackles
- Engine
  - Driveline: Clutch kits, Release bearings, Flywheels
  - Cooling: Radiators, Hose kits, Water pumps, Fans
  - Mounts and seals: Engine mounts, Gasket sets
- Air and Electrical
  - Charging and starting: Alternators, Starters, Batteries
  - Air system: Air dryers, Valves, Compressors
  - Sensors and looms: ABS sensors, Wiring looms, Switches, Pumps
- Filters and Service
  - Filters: Oil, Air, Fuel, Water separator
  - Service kits: By make (Hino 500, Isuzu F, Volvo D13)
  - Fluids and grease: Diesel oil, Coolant, Bearing grease
- Wheels and Tyres
  - Bearings and hubs: Bearing kits, Hub drums, Seals
  - Wheels: Steel rims, Alloy rims, Wheel nuts and studs
- Lighting
  - Rear: Tail lamp kits, Number plate lamps
  - Marker and clearance: Side markers, Cab markers
  - Front: LED headlamps, Work lamps
  - Wiring: Looms, Plugs, Trailer sockets
- Towing and Winches
  - Couplings: Ball couplings, Override couplings, Pintle
  - Jockey and support: Jockey wheels, Clamps, Stands
  - Winches: Electric, Hand, Accessories
  - Safety: Safety chains, Shackles
- Tipper and Hydraulic
  - Kits: Complete tipper kits
  - Components: Rams, Pumps, Valves, Hoses
- Truck Body
  - Vision: Mirrors, Mirror arms, Glass
  - Panels and guards: Mudguards, Flaps, Hinges
  - Security and caps: Locks, Fuel caps
  - Finishing: Chassis paint, Welding wire
- Fasteners
  - Bolts and nuts: HT bolts, U bolts, Nyloc
  - Assortments: Workshop packs, Marine stainless
- Load Restraints
  - Straps: Ratchet straps, Curtain straps
  - Chains: Transport chain, Grab hooks, Binders
- Workshop
  - Lifting: Jacks, Stands
  - Measuring: Gauges, Torque tools

Mobile equivalent: the same tree becomes an accordion drawer. See 1.3.

### 1.3 Mobile drawer (EXTEND `src/components/navigation/MobileDrawer.jsx`)

Layout: full height slide over from the left, dark surface, orange accents.
- Top: Garage state. Empty copy: `Add your truck` as a full width orange button. Set copy: the vehicle name with a `Change` link.
- Search bar pinned under the garage block, same placeholder as desktop.
- Level 1: the 13 categories as accordion rows with the count on the right and a chevron.
- Level 2: tapping expands sub categories inline (the `subs`), each a link.
- Level 3: sub category children as indented links.
- Utility block at the bottom: `Trade login`, `Track my order`, `Find a branch`, `Call the trade desk`, plus social icons.
- Micro-copy at the very bottom: `Australian owned. Freight Australia wide. ADR compliant parts.`

Animation: staggered reveal of the accordion rows on open (see Phase 2, `drawerStagger`).

### 1.4 Homepage (EXTEND `src/pages/Home.jsx`)

Section order, top to bottom. Each is a component. This blends Throtl energy, Sunrise content, and the red header rigidity.

1. Hero (full bleed, dark, animated)
   - Background: a rugged prime mover or trailer image with a dark scrim and the `grid-scrim` overlay already in CSS.
   - Eyebrow: `AUSTRALIAN TRUCK AND TRAILER SPARES`.
   - Headline: `Parts that keep the fleet moving`.
   - Sub line: `Braking, suspension, tipper and trailer gear. In stock in VIC, freighted Australia wide.`
   - Primary CTA: `Shop parts`. Secondary CTA: `Add your truck`.
   - Overlaid YMM widget card (the FCP and Sparesbox pattern): a compact three field selector floating on the hero. See Phase 2 for its entrance animation.
   - Trust chips floating with `animate-floaty`: `ADR compliant`, `Australian owned`, `Same day dispatch`.

2. Trust badge row (KEEP `src/components/trust/TrustBadges.jsx`, refine copy)
   - Four badges with icon plus title plus sub line:
     - `Free freight over $200` sub `Most orders dispatched same day from VIC`
     - `Fitment guaranteed` sub `Right part or send it back, no restock fee`
     - `Trade pricing` sub `Net rates and account terms for fleets`
     - `Secure checkout` sub `Encrypted payment, your card stays yours`

3. Shop by category (Throtl circular tiles, NEW `CategoryCircles.jsx`)
   - A responsive row of circular tiles, one per top category, each with a cutout image and label under it. Exactly the Throtl browse pattern. Hover lifts and rings in orange.
   - Section header: `Shop by category` with sub `Every system on the truck, one catalogue`.

4. Featured application panels (KEEP the Sunrise three panel idea, EXTEND)
   - Three large panels: `Jockey Wheels`, `Tipper Kits`, `Winches`, each with a strong image, a one line pitch, a price from chip, and `Shop [category]`.
   - Copy examples: Jockey Wheels `Australian made, 850kg rated, built for daily fleet use`. Tipper Kits `Complete ram, pump and valve kits sized for 8x5 to 10x5`. Winches `Electric and hand winches from 1200kg to 1588kg`.

5. Deal of the week strip (EXTEND, ties to `DealsPage`)
   - A horizontal draggable rail of discounted products using the `oldPrice` field. Header: `This week at the trade desk`. Each card shows the percent saved chip.

6. Shop by truck make (NEW `ShopByMake.jsx`)
   - Logo grid: Kenworth, Volvo, Isuzu, Hino, Mack, Scania, Fuso, UD, Freightliner, Iveco, DAF, Western Star. Each links to `/shop?make=...`.
   - Header: `Find parts for your make` sub `We stock for the makes that run Australian roads`.

7. Best sellers rail (EXTEND, uses `badge: "Best Seller"`)
   - Horizontal product rail with scroll reveal and add to cart micro interaction.

8. Brand showcase marquee (KEEP `src/components/trust/BrandShowcase.jsx`)
   - Infinite marquee of stocked brands: Bendix, Narva, Bosch, Koyo, Donaldson, Wabco, KYB, Hendrickson, Exedy, Gulf Western, Century. Uses `animate-marquee`.

9. Fleet and trade band (NEW, dark premium band)
   - Split layout: left copy, right image. Copy: `Run a fleet? Open a trade account.` sub `Net pricing, 30 day terms on approval, a bulk order pad, and a dedicated account manager.` CTA `Apply for a trade account`.

10. Testimonials (KEEP `src/components/trust/Testimonials.jsx`)
    - Three cards from fleet buyers. Copy tone: `Ordered a full tandem brake kit Friday, fitted Monday. Right first time.` attributed to `Workshop manager, regional VIC`.

11. Resources and guides teaser (EXTEND `ResourcesPage`)
    - Three guide cards: `How to pick a jockey wheel`, `Electric vs hydraulic trailer brakes`, `ADR lighting explained`.

12. Footer (see 1.9).

### 1.5 Product listing page, PLP (EXTEND `src/pages/Shop.jsx` plus `src/components/filters/*`)

Layout: left facet sidebar (sticky), right results grid, top bar with count, sort, and the persistent fitment banner.

Top of results:
- Persistent fitment banner (the Sparesbox pattern). When a vehicle is set: an orange tinted bar reading `Showing parts that fit your 2019 Kenworth T610` with a `Clear` and `Change` link. When not set: `Add your truck to see only parts that fit` with an inline mini YMM. Component: NEW `FitmentBanner.jsx` reading `useGarage()`.
- Result count and applied filter chips: `248 parts in Braking` plus removable chips for each active facet.
- Sort dropdown: `Relevance`, `Price low to high`, `Price high to low`, `Top rated`, `Best sellers`, `Newest`. Wired through `useSearchFilters`.
- View toggle: grid or list. List view is denser for trade buyers (the RockAuto and Summit habit).

Facet sidebar (EXTEND `FilterSidebar.jsx`, which already composes Category, Brand, Price, Stock filters):
- Fitment (NEW facet at the top): Make, Model, Year, Engine. Driven by the structured fitment data added in Phase 3.
- Category and sub category tree: `CategoryFilter` (KEEP, EXTEND for sub level).
- Brand: `BrandFilter` (KEEP). Show counts per brand.
- Price range: `PriceFilter` (KEEP). Slider plus min and max inputs.
- Availability: `StockFilter` (KEEP). Options `In stock`, `Low stock`, `Built to order`.
- Rating: NEW simple 4 stars and up filter.
- Deals: NEW toggle `On special` using `oldPrice`.
- ADR: NEW toggle `ADR approved` using a badge or spec flag.

Product card (EXTEND the existing card in `ui.jsx` or `shopwise.jsx`):
- Image with `SafeImg` fallback (KEEP the pattern from `ui.jsx`).
- Badge chip top left (Best Seller, Deal, ADR, Kit) from `badge`.
- Wishlist heart top right.
- Title, brand, SKU line.
- Fitment line when a vehicle is set: a green `Fits your T610` chip, or a grey `Check fit` chip when unknown. This is the CarParts guarantee cue.
- Rating and review count.
- Price block: current price bold, `oldPrice` struck through, percent saved chip.
- Stock line with a coloured dot.
- Primary action: `Add to cart` (B2C) or `Add to order` (when trade logged in). Secondary: `Compare` toggle feeding `CompareDrawer` (KEEP).

Micro-copy bank for PLP:
- Empty results: `No parts match those filters. Try clearing fitment or widening the price range.`
- Fitment guarantee line under the grid: `Every part is checked against your truck. If it does not fit, send it back free.`
- Compare bar: `Compare up to 3 parts` (matches the `.slice(-3)` already in `shop.jsx`).

### 1.6 Product display page, PDP (EXTEND `src/pages/ProductDetail.jsx` plus `src/components/product/*`)

This is the conversion heart. Layout: two column top (gallery left, buy box right), then full width tabbed detail, then related rails.

Top left: gallery (KEEP `ProductGallery.jsx`)
- Main image with zoom on hover, thumbnail strip below, badge overlay. Support multiple angles per SKU (Phase 3 data adds `images[]`).

Top right: buy box
- Breadcrumb above (KEEP `Breadcrumbs.jsx`): `Home / Braking / Backing plates / EB10P-L`.
- Brand line and title.
- SKU and OEM line: `SKU EB10P-L` plus `OEM AX-EB10PL`.
- Rating summary with review count, links to the reviews tab.
- Price block: current, old, percent saved, and a trade price teaser when not logged in: `Trade price from $XX, log in to see your rate`.
- Fitment box (the FinditParts and CarParts anchor): 
  - When vehicle set and it fits: green panel `This fits your 2019 Kenworth T610`.
  - When it does not fit: amber panel `This may not fit your T610. Check the fitment table below.`
  - When no vehicle: a mini YMM `Add your truck to confirm fit`.
- Quantity stepper plus primary CTA `Add to cart`, secondary `Add to quote` (feeds `/quote` and `AdminQuotes`).
- Reassurance list under the button (icons plus copy):
  - `Free freight over $200`
  - `Same day dispatch from VIC on stocked lines`
  - `Fitment guaranteed or send it back free`
  - `12 to 24 month warranty depending on line`
- Stock and delivery estimator: `In stock VIC. Order in the next [countdown] for same day dispatch.` plus a freight estimate teaser `Enter your postcode for a freight quote` (heavy freight, see checkout).

Full width detail (tabbed or stacked sections):

1. Overview: the `desc` expanded into two or three sentences plus a bullet list of key features.

2. Technical specifications table (ECS and Mishimoto depth). Two column table built from an EXTENDED spec model. Example for a backing plate:

   | Specification | Value |
   | --- | --- |
   | Drum size | 10 inch |
   | Actuation | Electric |
   | Side | Left hand |
   | Studs | Pre studded |
   | Rating | Tandem axle |
   | Material | Pressed steel |
   | Warranty | 12 months |
   | Country of origin | Australia |

3. Fitment table (the FinditParts and RockAuto core). Lists every make, model, year range, and engine this part suits. Driven by Phase 3 structured fitment.

   | Make | Model | Years | Notes |
   | --- | --- | --- | --- |
   | Trailer | Tandem electric drum | All | Suits 10 inch electric drums |

4. Cross reference and OEM replacements (FinditParts). A table of interchangeable numbers.

   | Type | Number | Brand |
   | --- | --- | --- |
   | OEM | AX-EB10PL | Aurex |
   | Cross | 23-180-L | Generic |

5. Exploded diagram view (ECS and RockAuto). For assemblies (couplings, tipper kits, hubs), an SVG or image exploded diagram with numbered callouts. Each callout links to the matching component SKU so buyers can order a single part of the assembly. NEW component `ExplodedDiagram.jsx`. For simple parts this section is hidden.

6. What is in the box (FCP kits). A checklist for kit SKUs (DIYTAE, HTKS, filter kits). Example: `Two backing plates, drums, magnets, wiring, and a fitting guide.`

7. Install and resources: linked guides, torque values, and a fitment PDF where relevant.

8. Reviews: rating breakdown bars, verified purchase tags, and a write a review CTA.

9. Q and A: buyer questions with trade desk answers.

Related rails at the bottom:
- `Complete the job` kit bundle (FCP pattern): related parts commonly bought together. For EB10P-L this pulls EB10P-R, AX-MG10, AX-BRKAWAY, AX-BCTRL-12.
- `Fits the same trucks`: other parts matching the fitment.
- `Recently viewed`: from a small history in state or localStorage.

Micro-copy bank for PDP:
- Add to cart success toast: `Added to cart. Keep shopping or check out.`
- Fit confirm: `Confirmed fit for your T610.`
- Trade teaser: `Trade account holders see net pricing. Apply in two minutes.`
- Cross reference note: `Numbers listed for reference only. Always confirm fit against your vehicle.`

### 1.7 B2B trade portal (NEW area, plus EXTEND `Auth.jsx` and `AdminQuotes`)

This is the biggest new surface. Routes: `/trade/apply`, `/trade/login`, `/trade/dashboard`, `/trade/order-pad`, `/trade/invoices`, `/trade/users`.

Trade application (`/trade/apply`):
- Form fields: business name, ABN, trading name, contact name, email, phone, delivery address, estimated monthly spend, and a note. 
- Copy header: `Open an Aurex trade account`. Sub: `Net pricing, 30 day terms on approval, and a bulk order pad for your fleet.`
- Consent line: `By applying you agree to our trade terms and credit terms.`
- On submit: `Application received. Our trade desk will call within one business day.`

Trade dashboard (`/trade/dashboard`):
- Greeting with the account name and tier: `Welcome back, [Company]. Your tier: Gold.`
- Tiles: `Reorder`, `Open order pad`, `Outstanding invoices`, `Statements`, `Manage users`.
- A reorder rail of previously bought SKUs with one tap add.

Bulk order pad (`/trade/order-pad`, the FleetPride and Multispares core):
- A fast entry table where a buyer types SKU or OEM plus quantity and the row auto fills name, net price, and line total.
- Paste box: `Paste a list of part numbers and quantities` for CSV style bulk entry.
- Running totals: subtotal, GST, freight estimate, grand total.
- Actions: `Add all to cart`, `Save as template`, `Request a quote`, `Submit order on account`.
- Copy: `Order pad. Type part numbers, we price them at your rate.`

Dynamic pricing tiers (data in Phase 3):
- Tiers: Retail, Bronze, Silver, Gold, Fleet. Each product carries a base price and a tier multiplier or explicit net price.
- On any price display, the shown price is resolved from the logged in account tier. Guests see retail with a `Trade price available` teaser.
- Quantity breaks per SKU: `1 to 4 at $71.50, 5 to 9 at $67.90, 10 plus at $64.20`.

Trade users and permissions:
- Roles within an account: Admin buyer, Standard buyer, Viewer. Admin can add users and set per user order limits.

### 1.8 Checkout flow (EXTEND `src/pages/Checkout.jsx`)

Design principle: one page, progressive sections, no forced account. Support three buyer types: guest, retail account, trade account on terms.

Sections top to bottom:
1. Contact: email plus phone. Copy: `We send order and dispatch updates here.`
2. Delivery method (heavy freight aware, the AU and FleetPride reality):
   - `Freight to my address` with a postcode driven quote.
   - `Depot pickup, VIC` free.
   - `My freight account` for trade (buyer supplies their carrier account, common in trucking).
   - Freight calculator copy: `Heavy and oversized items are quoted by weight, dimensions, and postcode. Enter your postcode for a live estimate.` Oversize flag on items like tipper kits and radiators triggers a `Quoted freight` state rather than a fixed rate.
3. Delivery address with an AU address form (state dropdown of the states and territories, 4 digit postcode validation via `validators.js`).
4. Payment:
   - Guest and retail: card, PayPal, and an `Apply` style pay later option if desired. Do not build real card capture into the demo, use a placeholder gateway step.
   - Trade on approved terms: `Charge to my account, 30 day terms` with a PO number field.
5. Review and place order: full line list, freight, GST shown explicitly (`Prices include GST` where applicable), and the place order button.

Order success (`/order-success/:id`, KEEP `OrderSuccessPage`):
- Copy: `Order [id] confirmed. We are picking it now.` plus dispatch estimate, a tracking teaser, and `Create an account to track and reorder faster` for guests.

Micro-copy bank for checkout:
- Freight estimate loading: `Getting freight rates for [postcode]`.
- Oversize note: `This item ships as freight. Final cost confirmed by our team before dispatch.`
- Terms buyer confirm: `This order will be invoiced to your account on 30 day terms.`

### 1.9 Legal, footer, and compliance (EXTEND `CompliancePage` and the footer)

Footer (black background, orange logo, the client colour rule). Four to five columns:
- Shop: the top categories.
- Trade: Apply for an account, Trade login, Order pad, Bulk enquiries.
- Support: Contact, Track my order, Returns and warranty, Freight and delivery, Fitment help.
- Company: About Aurex, Branches, Careers, Blog and guides.
- Newsletter block: `Deals and new stock, straight to your inbox` with an email field and `Sign up`. Consent: `We handle your details per our Privacy Policy.`

Trust strip above the footer: payment logos, `Australian owned and operated`, `Freight Australia wide`, `ADR compliant parts`.

Legal and compliance pages and copy (the AU specific requirement):
- Returns and refunds: aligned to Australian Consumer Law. Copy: `Your rights under the Australian Consumer Law are not limited by our policy. Change of mind returns accepted within 30 days on unused, resalable parts. Fitment errors on us, we cover return freight.`
- Warranty: per line warranty (12 to 24 months) plus manufacturer terms. Copy: `Warranty covers manufacturing defects. It does not cover wear, misuse, or incorrect fitment.`
- ADR and compliance note: `Parts described as ADR approved meet the relevant Australian Design Rule at time of supply. Fitment to a road registered vehicle must comply with the rules in your state or territory. If in doubt, ask our trade desk.`
- GST note: `All prices are in Australian dollars. Where shown, prices include GST. A tax invoice is issued with every order.`
- Privacy policy, Terms of sale, Trade and credit terms, Shipping policy.
- Business identity in the footer: `Aurex Truck Parts Pty Ltd, ABN XX XXX XXX XXX, Victoria, Australia.`

---

## PHASE 2: ADVANCED ANIMATION AND INTERACTIVITY

Principle: motion serves conversion and hierarchy, never blocks the buy. Use framer-motion 13 (already installed) as the default. Reserve GSAP only for one or two heavy scroll timelines if framer-motion proves limiting. Respect `prefers-reduced-motion` everywhere (the CSS already zeroes marquee and floaty under that query, extend the rule to JS animations by gating with a `useReducedMotion` hook from framer-motion).

Performance guardrails baked into every recipe below:
- Animate only `transform` and `opacity`. Never animate layout properties in scroll paths.
- Use `whileInView` with `viewport={{ once: true, margin: "-80px" }}` so reveals fire once and slightly early.
- Lazy mount heavy sections and defer offscreen images (`loading="lazy"`, `decoding="async"`).
- Keep the hero LCP element static or use a CSS only entrance so it is not JS gated.
- Wrap route level transitions so they do not delay first paint.

### 2.1 YMM Garage widget animation (the signature interaction)

The widget lives on the hero and in the header pill. It should feel like a precise machine.

States and motion:
1. Idle (collapsed pill): the `Add your truck` pill has a subtle orange ring pulse every few seconds to draw the eye. Implement with a keyframed `boxShadow` on a low frequency, or reuse an orange glow.
2. Expand: clicking opens a card. Use a `layout` animation so the pill morphs into the card (shared layout via `layoutId="garage"`). The card scales from the pill origin with `ease-out-expo` (the token already in CSS: `cubic-bezier(0.16, 1, 0.3, 1)`).
3. Field cascade: the three or four selects (Year, Make, Model, Engine) animate in with a stagger of 0.06s, each sliding up 8px and fading in.
4. Progressive enable: Make is disabled until Year is chosen, Model until Make, and so on. When a field unlocks, it does a quick 1.0 to 1.03 to 1.0 scale pop and its border flashes orange.
5. Confirm: on the final selection, a `Confirm fit` button slides in. Pressing it triggers a success state: a green check draws in (SVG path length animation) and the card collapses back into the header pill now showing the vehicle name.
6. Global broadcast: on confirm, a thin orange progress line sweeps across the top of the viewport once, signalling that the whole site is now filtered. This is the moment that sells the Garage.

Framer-motion sketch:

```jsx
const cardVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  show: {
    opacity: 1, scale: 1, y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.06 }
  }
};
const fieldVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 }
};
```

### 2.2 Scroll triggered product and section reveals

- Section headers: rise 16px and fade in on enter, once.
- Product cards in a grid: a stagger where each card rises 12px and fades, delay indexed by column so a wave moves left to right. Cap the per item delay so a full grid never takes more than about 0.4s to settle.
- Category circle tiles (Throtl): scale from 0.9 to 1 with a slight overshoot and a ring that draws in orange.
- Stat or trust counters: count up numbers when in view (parts in stock, brands, years trading).
- Dark bands (fleet and trade): a parallax where the background image moves slower than the foreground copy using `useScroll` plus `useTransform`, kept subtle (a 6 to 10 percent shift).

### 2.3 Add to cart micro interaction (conversion critical)

The moment a part is added must feel rewarding and confirm the action.
- Button press: scale to 0.97 then back.
- Fly to cart: a ghost of the product image animates along a curved path from the card to the cart icon in the header, shrinking as it goes. Use a motion element with an animated `x`, `y` along a quadratic path, then remove on complete.
- Cart badge: the count badge does a pop (scale 1 to 1.25 to 1) and the cart icon does a single shake.
- Drawer: the cart drawer (already toggled by `setDrawer(true)` in `shop.jsx`) slides in from the right with the new line highlighted by a brief orange background fade.
- Toast: a slim toast confirms with an undo link.

### 2.4 Layout transitions and shared elements

- Product image continuity: use `layoutId={`img-${sku}`}` so clicking a product card morphs the card image into the PDP hero image (the premium App Store style transition). Guard for reduced motion.
- Mega menu: the promo image in Region C cross fades when the hovered category changes, and the sub category list does a quick stagger swap.
- Filter apply: when a facet is toggled, the results grid uses `AnimatePresence` with `layout` so cards reflow smoothly rather than jumping. Use `mode="popLayout"` to avoid overlap.
- Route changes: a fast top progress bar (orange) plus a 150ms content fade. Keep it short so it never feels slow. The existing `ScrollManager` in `Layout.jsx` handles scroll to top on route change (KEEP).

### 2.5 Hover and cursor polish

- Cards: lift with `shadow-card-hover` (already defined) plus the `shine` sweep (already defined) on hover.
- Links: the `link-underline` orange wipe (already defined).
- Buttons: primary buttons get a subtle gradient shift and `shadow-primary` on hover.
- Optional and tasteful: a custom cursor accent on the dark hero only, a small orange dot that trails slightly. Ship behind a setting and disable on touch.

### 2.6 Loading and skeleton states

- PLP and search: skeleton cards with a shimmer while filtering, so the grid never flashes empty.
- Images: blur up using a tiny placeholder then fade to full via the `SafeImg` component (EXTEND to support a blur placeholder).
- Buttons in async actions (add to quote, submit order): inline spinner and disabled state.

### 2.7 GSAP escape hatch (only if needed)

If a single flagship scroll story is wanted (for example a horizontally scrolling `assembled truck` that highlights each system as you scroll), use GSAP ScrollTrigger for that one section, dynamically imported so it does not enter the main bundle. Everything else stays on framer-motion.

---

## PHASE 3: STATE MANAGEMENT AND DATA ARCHITECTURE

Guiding idea: the Garage vehicle is the master filter for the entire site. Selecting a truck should re-rank and gate parts everywhere: header, mega menu promo, PLP, PDP fit badges, and related rails. Today the Garage stores a vehicle but cannot filter because products have no structured fitment. Phase 3 fixes the data first, then the state flow.

### 3.1 Provider topology (EXTEND `src/App.jsx`)

Keep the existing nesting and add nothing that forces a re-architecture. Current order: Auth, Site, Products, Shop, Garage. Recommended order and responsibilities:

- AuthProvider (KEEP, EXTEND): user identity plus account type (guest, retail, trade) plus trade tier (Retail, Bronze, Silver, Gold, Fleet). This is what price resolution reads.
- SiteProvider (KEEP): global site config, feature flags, currency, toasts, and the route progress bar state.
- ProductsProvider (KEEP, EXTEND): the source of truth for products and categories, merges the static catalog with any admin overrides in localStorage (already partially done via `aurex_products_v1`).
- GarageProvider (EXTEND): move it ABOVE Shop so cart and search can react to the selected vehicle. It exposes the selected vehicle and, critically, a `fitsVehicle(product)` helper.
- ShopProvider (KEEP, EXTEND): cart, wishlist, compare, query, drawer. Cart lines should store the resolved price at add time plus the tier used, so a later tier change does not silently rewrite the cart.

New light context to add:
- FitmentProvider or fold into Garage: exposes the YMM option tree (years, makes, models, engines) and the matching logic. Keeping it inside Garage is simplest.

Suggested final order in `App.jsx`:

```jsx
<AuthProvider>
  <SiteProvider>
    <ProductsProvider>
      <GarageProvider>       {/* moved up */}
        <ShopProvider>
          {/* routes */}
        </ShopProvider>
      </GarageProvider>
    </ProductsProvider>
  </SiteProvider>
</AuthProvider>
```

### 3.2 The structured fitment data model (the core upgrade)

Replace or augment the free text `fit` with structured fitment. Two supported styles so the catalog can mix specific and universal parts.

Extend each product in `catalog.js`:

```js
{
  sku: "ATX-SHOCK-T610",
  // ...existing fields kept...
  fit: "Suits T610 rear air suspension",   // keep for display copy
  fitment: {
    universal: false,
    applications: [
      { make: "Kenworth", model: "T610", yearFrom: 2016, yearTo: 2024, engine: "any", position: "Rear" }
    ]
  },
  crossRefs: [
    { type: "OEM", number: "KY-T610R", brand: "KYB" }
  ],
  images: [ /* multiple angles */ ],
  specsTable: [
    { label: "Type", value: "Gas charged" },
    { label: "Position", value: "Rear" },
    { label: "Sold as", value: "Each" }
  ],
  tierPrice: { retail: 165, bronze: 158, silver: 152, gold: 148, fleet: 142 },
  qtyBreaks: [ { min: 1, price: 165 }, { min: 5, price: 158 }, { min: 10, price: 149 } ],
  oversize: false
}
```

For a universal part (jockey wheel clamp, straps, grease), set `fitment.universal = true`. Universal parts always pass the fit check and show a neutral `Fits all` chip.

Derive the YMM option tree at load time from all `applications` across the catalog. This gives the selects their options without a separate dataset:

```js
// useVehicleFitment.js (EXTEND the existing hook)
export function buildFitmentTree(products) {
  const tree = {}; // make -> model -> Set(years) -> Set(engines)
  for (const p of products) {
    for (const app of p.fitment?.applications ?? []) {
      // populate tree.make[app.make].models[app.model].years, engines
    }
  }
  return tree;
}
```

Seed a realistic AU make and model list so the selects feel complete even where the catalog is thin: Kenworth (T410, T610, T909, K200), Volvo (FH, FM, FE), Isuzu (N, F, FVR, FSR), Hino (300, 500, 700), Mack (Anthem, Trident, Superliner), Scania (R, P, G), Fuso (Canter, Fighter, Shogun), UD (Croner, Quon), Freightliner (Cascadia, Argosy), Iveco (Daily, Eurocargo, Stralis), DAF, Western Star. For trailers, treat `make: "Trailer"` with model as the axle or brake type.

### 3.3 The fit check function (single source of truth)

Put it in the Garage context so every surface uses the same logic:

```js
function fitsVehicle(product, vehicle) {
  if (!vehicle) return "unknown";                 // no truck chosen yet
  if (product.fitment?.universal) return "fits";  // universal
  const apps = product.fitment?.applications ?? [];
  if (apps.length === 0) return "unknown";        // legacy, unmapped
  const hit = apps.some(a =>
    a.make === vehicle.make &&
    a.model === vehicle.model &&
    withinYears(vehicle.year, a.yearFrom, a.yearTo) &&
    (a.engine === "any" || a.engine === vehicle.engine)
  );
  return hit ? "fits" : "no";
}
```

Three valued result: `fits`, `no`, `unknown`. This drives the green, amber, and grey chips across the UI. Never hard hide non fitting parts by default. Instead re-rank (fits first) and show a clear `may not fit` state, because trade buyers often order across vehicles. Offer a `Only show parts that fit` toggle in the fitment banner for those who want a hard filter.

### 3.4 Global filtering flow (how one selection cascades)

1. User confirms a vehicle in the YMM widget. `GarageProvider.addVehicle` plus `selectVehicle` run (KEEP), persisting to localStorage (already implemented).
2. `selectedVehicle` updates in context. Every consumer re-renders.
3. Header pill shows the vehicle (EXTEND `YMMWidget`).
4. `FitmentBanner` on PLP switches to the `Showing parts that fit` state (NEW).
5. `useSearchFilters` (EXTEND) reads `selectedVehicle` and computes a `fitStatus` for each product, then sorts fits first, and applies the hard filter only if `onlyFits` is on.
6. Product cards and PDP read `fitStatus` for their chips.
7. Mega menu promo and related rails prefer parts that fit the vehicle.
8. On `clearSelectedVehicle`, everything reverts to the unfiltered, unranked state.

### 3.5 Price resolution flow (retail versus trade)

A single selector resolves the price to show anywhere:

```js
function resolvePrice(product, { accountType, tier }, qty = 1) {
  const base = product.tierPrice?.retail ?? product.price;
  if (accountType !== "trade") return { price: base, label: null };
  const tierPrice = product.tierPrice?.[tier] ?? base;
  const breakPrice = pickQtyBreak(product.qtyBreaks, qty) ?? tierPrice;
  return { price: Math.min(tierPrice, breakPrice), label: `${tier} price` };
}
```

- Guests and retail see retail price plus a `Trade price available` teaser.
- Trade accounts see their tier price, with quantity breaks applied on the order pad and cart.
- Cart lines snapshot the resolved price and tier at add time (EXTEND `shop.jsx` `add`), so switching context does not silently mutate an in progress order. Recompute only on explicit refresh.

### 3.6 Search and query state

- Search input state already lives in `shop.jsx` (`query`, `setQuery`). EXTEND search to match across name, sku, oem, crossRefs numbers, brand, and category, with SKU and OEM exact matches ranked first (the trade priority from PACCAR and RockAuto).
- Keep a small `recentSearches` and `recentlyViewed` list in localStorage for the PDP rails and the empty search state.
- Debounce the search suggestions dropdown, show grouped results: `Parts`, `Categories`, `Brands`.

### 3.7 Persistence map (what lives where)

- localStorage `aurex_garage_v1` and `_selected`: vehicles and selection (KEEP).
- localStorage `aurex_products_v1`: admin product overrides (KEEP).
- localStorage `aurex_cart_v1`: NEW, persist the cart so a refresh does not lose it.
- localStorage `aurex_recent_v1`: NEW, recently viewed and searched.
- Auth and trade session: in memory for the demo, structured so a real API can slot in later.
- Site settings and content: `SiteProvider`, editable via the admin `AdminContent` and `AdminSettings` (KEEP).

### 3.8 API integration seams (future proofing)

Structure data access behind a thin service layer so the static catalog can be swapped for a real backend without touching components:

- `src/services/catalog.js`: `getProducts`, `getProduct`, `search`, `getFitmentTree`.
- `src/services/account.js`: `login`, `applyTrade`, `getPricing`.
- `src/services/orders.js`: `createOrder`, `getFreightQuote`, `submitOnAccount`.
- Each currently returns from the local catalog and localStorage, wrapped in promises, so moving to fetch later is a one file change.

---

## PHASE 4: COMPONENT TREE AND FILE STRUCTURE

Legend: [K] keep as is, [E] keep and extend, [N] new. The tree reflects the current repo plus every addition this plan requires.

```
src/
  main.jsx                         [K] entry, mounts <App/>
  App.jsx                          [E] provider order, add /trade routes, /shop/:category
  index.css                        [E] theme tokens (add trade and fit chip colours), keep utilities

  assets/
    hero.png                       [K]
    brand/
      aurex-logo-orange.(svg|png)  [N] supplied orange wordmark, for dark backgrounds
      aurex-logo-black.(svg|png)   [N] supplied black wordmark, for light and orange nav

  components/
    Layout.jsx                     [E] header + footer wrapper, ScrollManager (keep scroll to top)
    logo.jsx                       [E] use real brand assets, drop generated Mark, add variant prop
    ui.jsx                         [E] SafeImg (add blur placeholder), Button, Chip, Badge, Rating,
                                       Price, Skeleton, Toast primitives
    shopwise.jsx                   [E] product card, wire fitStatus chip and resolved price

    layout/
      Header/
        Header.jsx                 [N] three row header shell, sticky condense logic
        UtilityBar.jsx             [N] row 1 orange strip: contact, branch, trade login, socials
        BrandSearchBar.jsx         [E] row 2: logo, scoped search, account, wishlist, cart
        CategoryRail.jsx           [N] row 3: category buttons + garage pill
      Footer/
        Footer.jsx                 [N] black footer, orange logo, columns, newsletter, legal strip
        TrustStrip.jsx             [N] payment logos, Australian owned, ADR compliant

    navigation/
      MegaMenu.jsx                 [E] three region panel, category tree + promo slot
      MegaMenuColumn.jsx           [N] a category column of subs and children
      MegaMenuPromo.jsx            [N] Region C featured deal + shop by make
      MobileDrawer.jsx             [E] accordion category tree, garage block, utility block
      SearchBar.jsx                [E] input + suggestions dropdown (grouped results)
      SearchSuggestions.jsx        [N] debounced grouped suggestions
      Breadcrumbs.jsx              [K]

    garage/
      GarageContext.jsx            [E] add fitsVehicle, fitment tree, onlyFits toggle
      YMMWidget.jsx                [E] the animated selector (hero + header pill variants)
      VehicleSelector.jsx          [E] the Year/Make/Model/Engine selects with progressive enable
      VINChecker.jsx               [K] optional VIN entry path
      GaragePill.jsx               [N] collapsed header state, shared layoutId with the widget
      FitmentBanner.jsx            [N] PLP persistent fitment bar with Only show parts that fit

    filters/
      FilterSidebar.jsx            [E] compose facets, add Fitment, Rating, Deals, ADR
      CategoryFilter.jsx           [E] add sub category level
      BrandFilter.jsx              [K] show counts
      PriceFilter.jsx              [K]
      StockFilter.jsx              [K]
      FitmentFilter.jsx            [N] make/model/year facet reading the fitment tree
      RatingFilter.jsx             [N]
      ActiveFilters.jsx            [N] removable chip row above results

    product/
      ProductGallery.jsx           [E] multi image, zoom, shared layoutId to card
      ProductBuyBox.jsx            [N] price, fit box, qty, add to cart, add to quote, reassurance
      ProductSpecs.jsx             [E] render specsTable as a two column table
      FitmentTable.jsx             [N] applications table
      CrossReferenceTable.jsx      [N] OEM and interchange numbers
      ExplodedDiagram.jsx          [N] SVG or image with numbered callouts linking to SKUs
      WhatsInTheBox.jsx            [N] kit checklist
      Reviews.jsx                  [N] rating breakdown + list + write review
      QandA.jsx                    [N] questions and trade desk answers
      RelatedRail.jsx              [N] Complete the job, Fits the same trucks, Recently viewed
      CompareDrawer.jsx            [K] up to 3 compare (matches shop.jsx slice(-3))
      ProductCard.jsx              [N or fold into shopwise.jsx] the reusable grid card

    cart/
      CartItem.jsx                 [K]
      CartSummary.jsx              [K]
      CartDrawer.jsx               [N] slide over drawer (drawer state already in shop.jsx)
      FlyToCart.jsx                [N] the add to cart flight animation helper

    trust/
      TrustBadges.jsx              [K] refine copy per Phase 1.4
      BrandShowcase.jsx            [K] marquee of stocked brands
      Testimonials.jsx             [K]

    home/
      Hero.jsx                     [N] full bleed hero with overlaid YMM
      CategoryCircles.jsx          [N] Throtl circular browse tiles
      FeaturedPanels.jsx           [N] Jockey Wheels, Tipper Kits, Winches (Sunrise pattern)
      DealStrip.jsx                [N] draggable deal rail using oldPrice
      ShopByMake.jsx               [N] truck make logo grid
      BestSellers.jsx              [N] product rail
      TradeBand.jsx                [N] dark fleet and trade CTA band
      ResourcesTeaser.jsx          [N] guide cards

    motion/
      RevealOnScroll.jsx           [N] wrapper: whileInView rise and fade, once
      Stagger.jsx                  [N] parent stagger container
      PageTransition.jsx           [N] route fade + top progress bar
      variants.js                  [N] shared framer-motion variants (card, field, drawer)

  pages/
    Home.jsx                       [E] compose the home/* sections
    Shop.jsx                       [E] PLP: sidebar + results + FitmentBanner + sort
    ProductDetail.jsx              [E] PDP: gallery + buy box + tabs + rails
    Extra.jsx                      [E] Categories, Brands, Deals, Resources, Contact, Quote,
                                       Track, Compliance (keep the grouped exports)
    Auth.jsx                       [E] Login, Signup, Account (add trade awareness)
    Checkout.jsx                   [E] guest/retail/trade, heavy freight calculator
    trade/                         [N] the B2B portal
      TradeApply.jsx               [N] /trade/apply
      TradeLogin.jsx               [N] /trade/login
      TradeDashboard.jsx           [N] /trade/dashboard
      OrderPad.jsx                 [N] /trade/order-pad bulk entry table
      TradeInvoices.jsx            [N] /trade/invoices and statements
      TradeUsers.jsx               [N] /trade/users roles and limits
    admin/                         [K] existing admin portal
      AdminLayout.jsx              [K]
      Dashboard.jsx                [K]
      AdminOrders.jsx              [K]
      AdminProducts.jsx            [E] add fitment, tierPrice, crossRefs, images fields to editor
      AdminCategories.jsx          [K]
      AdminRest.jsx                [E] AdminCustomers, AdminQuotes, AdminDeals, AdminContent,
                                       AdminSettings (add trade accounts and tiers)

  store/
    auth.jsx                       [E] accountType, tier, trade session, resolvePrice consumer
    site.jsx                       [K] settings, toasts, route progress
    products.jsx                   [E] merge overrides, expose fitment tree, search index
    shop.jsx                       [E] persist cart, snapshot resolved price, wishlist, compare

  hooks/
    useCartCalculations.js         [E] GST, freight estimate, tier and qty break totals
    useSearchFilters.js            [E] facet filtering + fit ranking + onlyFits
    useVehicleFitment.js           [E] buildFitmentTree, fitsVehicle helpers
    useResolvedPrice.js            [N] price by account tier and qty
    useFreightQuote.js             [N] postcode + weight + oversize estimate
    useRecentlyViewed.js           [N] localStorage recently viewed
    useReducedMotionSafe.js        [N] wrap framer useReducedMotion for gating
    useScrollCondense.js           [N] header condense on scroll

  services/                        [N] thin data access seam for future API
    catalog.js                     [N] getProducts, getProduct, search, getFitmentTree
    account.js                     [N] login, applyTrade, getPricing
    orders.js                      [N] createOrder, getFreightQuote, submitOnAccount

  data/
    catalog.js                     [E] add fitment, crossRefs, tierPrice, qtyBreaks, images
    fitment.js                     [N] AU make and model seed tree (optional if derived)
    makes.js                       [N] truck make list + logo map for ShopByMake and mega menu

  utils/
    formatters.js                  [E] AUD currency, GST line, percent saved
    helpers.js                     [K]
    validators.js                  [E] AU postcode, ABN, email, phone
```

### 4.1 Routing additions in App.jsx

Add these routes inside the `Layout` wrapped block:
- `/shop/:category` and keep `/shop` for all. Read `?make`, `?model`, `?year`, `?type`, `?brand`, `?sort` from the query string so filters and fitment are shareable and SEO friendly.
- `/trade/apply`, `/trade/login`, `/trade/dashboard`, `/trade/order-pad`, `/trade/invoices`, `/trade/users`, guarded by a `RequireTrade` wrapper for the account pages.

### 4.2 Build and performance notes

- Code split the admin and the trade portal with `React.lazy` so the storefront bundle stays lean.
- Dynamically import `ExplodedDiagram` and any GSAP timeline.
- Keep framer-motion tree shaken by importing only what is used.
- Preload the hero image and the black logo, lazy load everything below the fold.
- Use `SafeImg` everywhere for the broken image protection the project already relies on, and verify every image URL loads before shipping (project rule).

---

## 5. Recommended build order (so value ships fast)

1. Brand and header first: save the real logos, build the three row Header, UtilityBar, CategoryRail, and the Footer. This instantly delivers the red reference look and the orange nav plus black footer the client asked for.
2. Fitment data upgrade: extend `catalog.js` with structured `fitment`, then wire `fitsVehicle` and the YMM tree. This unlocks the Garage as a real filter.
3. YMM widget animation and the persistent FitmentBanner: the signature interaction and the Sparesbox style fitment bar.
4. PLP facets and fit ranking, then the PDP depth (specs, fitment table, cross reference, kit bundle).
5. Homepage Throtl sections: CategoryCircles, FeaturedPanels, DealStrip, ShopByMake, TradeBand, plus the scroll reveals and add to cart flight.
6. B2B trade portal: apply, login, dashboard, order pad, tiered pricing.
7. Checkout heavy freight flow and the AU legal and compliance pages.
8. Motion polish pass and a performance and reduced motion audit.

## 6. Definition of done for each surface

- No em dashes, en dashes, or double hyphens anywhere in copy or code strings. Audit with a unicode dash grep before every commit (project rule).
- Every image loads (SafeImg fallback in place, URLs verified).
- Pages scroll to top on route change (ScrollManager, already present).
- Fit chips resolve correctly for fits, no, and unknown states.
- Prices resolve by account tier, cart snapshots price at add time.
- Reduced motion respected on every animated surface.
- Mobile drawer mirrors the full desktop taxonomy.
- Trade pricing never leaks to guests, retail teaser shown instead.
```
