# Aurex Truck Parts & Heavy Vehicle Equipment — Storefront & Staff Portal

Enterprise-grade B2B/B2C e-commerce platform and backoffice administration console engineered for **Aurex Panels Pty Ltd / Aurex Truck Parts** (Campbellfield VIC 3061, Australia).

Built on **React 19**, **Vite**, **Tailwind CSS v4**, **TanStack Query**, and **React Router v7**. Integrates directly with the **Fastify v5** REST API backend.

---

## 🚀 Key Features

* **Authoritative 3-Category Architecture**:
  * **Tail Lifts** (`/shop/tail-lifts`): Commercial hydraulic tail lifts (1.5T to 3T, steel and aluminium).
  * **Trailer Parts** (`/shop/trailer-parts`): Heavy hardware, cam locks, door hinges, seals, tracks, and safety signs.
  * **Accessories** (`/shop/accessories`): Rubber buffers, chrome wheel nut covers, **Steel Tool Boxes ($350.00)**, and **composite body panels** (`ATP-ACC-06` to `ATP-ACC-16`).
* **Australian Tax Office (ATO) Compliant Tax Invoices**:
  * Displays Legal Name (*Aurex Panels Pty Limited*), ABN (*84 647 182 931*), Campbellfield address, itemized 10% GST breakdown, and payment status.
  * Instant vector print and PDF download directly from customer profile (`/profile`), order tracking (`/track`), and staff console.
* **Australian Freight & Pricing Engine**:
  * **Tool Box Price Baseline**: $350.00 AUD (inc. GST).
  * **Free Shipping Threshold**: Free delivery automatically applied on all orders with subtotal > $200.00 AUD (standard courier fee applies below $200).
* **Multi-Channel B2B & B2C Payments**:
  * **Stripe Hosted Checkout**: Cards (Visa, MasterCard, Amex), Apple Pay, Google Pay, Link.
  * **Direct Bank Transfer (EFT)**: Direct wire payment with customer receipt reference upload.
  * **30-Day Fleet Trade Account**: Approved commercial credit lines for fleet operators.
  * **Depot Collection (COD)**: Warehouse pickup in Campbellfield VIC.
* **Integrated Staff Admin Console (`/admin`)**:
  * Mounted directly in the application at `/admin` (Dashboard, Orders, Products, Categories, Enquiries, Reviews, Settings).

---

## 🛠️ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Set `VITE_API_URL` to your running Fastify API:
```ini
# Development:
VITE_API_URL=http://localhost:5001/api/v1

# Production:
VITE_API_URL=https://api.aurextruckparts.com.au/api/v1
```

### 3. Run Development Server
```bash
npm run dev
```
Storefront opens on `http://localhost:5173`.
Staff Console opens on `http://localhost:5173/admin`.

### 4. Production Build
```bash
npm run build
```
Generates an optimized bundle in `dist/`, then writes crawler-readable HTML snapshots for every product, category, type page, guide, article and static page, plus the homepage (`scripts/prerender.js`). The snapshots read the live API (`PRERENDER_API_URL` overrides it; `PRERENDER=false` skips them). If the API is unreachable the build still succeeds, just without snapshots. Visitors always get the live app. The API redeploys the storefront through a Vercel Deploy Hook when products, categories or articles change (`STOREFRONT_DEPLOY_HOOK_URL`, plus a daily catch-up cron), so snapshots stay current.

The build always writes `dist/app.html` (the plain app shell, which `vercel.json` rewrites app routes to), `dist/404.html` (the app shell, noindex) and `dist/sitemap-pages.xml` (guides and type pages). `vercel.json` lists the app's routes explicitly, and any other path gets `404.html` with a real 404 status. **A new route in `src/App.jsx` must also be added to the `rewrites` in `vercel.json`.** Until it is, the page still works for visitors but returns a 404 status. Type-page and guide copy lives in `src/data/seoContent.js` and `src/data/guides.js`. A type's `name` there must match the product `sub` value exactly, so renaming a type in the admin needs the matching edit there.

---

## 📂 Project Architecture

```
Aurex-Truck-Parts/
├── src/
│   ├── api/             # Axios API client, endpoints & response normalizers
│   ├── components/      # Header, Footer, CartDrawer, SearchBox, AuthModal, Invoices
│   ├── data/            # Static specs, fallback mock data, company constants
│   ├── hooks/           # TanStack Query custom hooks (useProducts, useCategories)
│   ├── lib/             # React Query client, cache persistence (stale-while-revalidate)
│   ├── pages/           # Storefront pages (Home, Shop, ProductDetail, Checkout, Account, Track)
│   │   └── admin/       # Built-in Staff Backoffice (Dashboard, Orders, Categories, Products, CRM)
│   ├── store/           # Auth, Cart, Site, and Notification state management
│   └── utils/           # Invoice generator, pricing calculations, rating prompts
├── public/              # Static assets, product photos, categories imagery
├── dist/                # Production build output
└── vercel.json          # Vercel deployment and routing rules
```

---

## 🌐 Production Domain & Deployment

* **Production Storefront**: `https://www.aurextruckparts.com.au`
* **Staff Console**: `https://www.aurextruckparts.com.au/admin`
* **Backend API**: `https://api.aurextruckparts.com.au`
* **Depot / Warehouse**: 77 Capital Link Drive, Campbellfield VIC 3061, Australia
