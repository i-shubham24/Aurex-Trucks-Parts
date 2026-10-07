# Aurex Truck Parts — Backend & Platform Handover

A complete guide to the Aurex Truck Parts system: what each piece is, how to run it,
how it all connects, and what's left to go live.

---

## 1. The big picture

Three apps make up the platform:

| App | Repo / folder | What it is | Stack |
|---|---|---|---|
| **Storefront** | `Aurex-Truck-Parts` (existing) | Public shop customers use | React 19 + Vite + Tailwind v4 |
| **API** | `truck-parts-api` | Backend REST API + database | Node + Express + MongoDB (Mongoose) |
| **Admin** | `truck-parts-admin` | Staff dashboard | React 19 + Vite + Tailwind v4 |

```
Customer ──▶ Storefront (Vercel) ─┐
                                   ├─▶  API (Render/VPS) ──▶ MongoDB (Atlas)
Staff ─────▶ Admin (Vercel) ──────┘           │
                                              ├─▶ Stripe (hosted checkout + webhook)
                                              └─▶ Resend (transactional email)
```

The storefront was originally a localStorage-only demo. The API moves all of that
(users, orders, catalogue, promos, enquiries, settings) into MongoDB with real auth,
server-validated pricing, payments and email. **The storefront still runs exactly as
the approved demo when `VITE_API_URL` is unset** — the backend only engages when it's set.

---

## 2. Tech stack & key choices

- **Node + Express + MongoDB (Mongoose)** — the stack we agreed on.
- **JWT auth**: short-lived access token (Bearer) + httpOnly refresh cookie. Passwords
  are **bcrypt-hashed**. Admin is a real DB role (`role: "admin"`), enforced by middleware.
- **Zod** validation on every write endpoint.
- **Server-trusted pricing** — the client never dictates order totals. On checkout the
  server looks up each SKU's DB price, rejects enquiry-only (POA) lines, validates the
  promo, and recomputes subtotal / discount / freight / GST / total (`src/utils/pricing.js`).
- **Feature flags** — Stripe and email are optional. With no keys, card orders fall back to
  "Pending payment" and emails are logged, not sent. Nothing breaks without keys.
- **Security**: helmet, CORS allowlist, rate limiting, central error handler.

---

## 3. Running it locally

### Option A — Docker (easiest, no MongoDB install)
```bash
cd truck-parts-api
cp .env.example .env          # set the two JWT secrets (see §5)
docker compose up --build     # Mongo + API, auto-seeded → http://localhost:5000
```

### Option B — Node + your own Mongo / Atlas
```bash
cd truck-parts-api
npm install
cp .env.example .env          # set MONGO_URI + the two JWT secrets
npm run seed                  # loads 36 products, 3 categories, promos, settings, admin user
npm run dev                   # http://localhost:5000  (health: /api/health)
```

### Admin dashboard
```bash
cd truck-parts-admin
npm install
cp .env.example .env          # VITE_API_URL=http://localhost:5000/api
npm run dev                   # http://localhost:5174
```

### Storefront (connect to the API)
```bash
cd Aurex-Truck-Parts
# create .env with:  VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                   # http://localhost:5173
```
Leave `VITE_API_URL` **unset** to run the storefront in its original localStorage-only mode.

**Default admin login:** `admin@aurex.com.au` / `Admin123!` (change via `.env` before seeding).

### Tests
```bash
cd truck-parts-api
MONGO_URI="mongodb://127.0.0.1:27017/aurex_test" npm test   # full end-to-end smoke test
```

---

## 4. Data model (MongoDB collections)

- **User** — name, email (unique), password (bcrypt), phone, company, `role` (customer|admin), reset-token fields.
- **Product** — `sku` (unique), name, category (slug), sub, `price` (nullable = POA/enquiry), brand, rating, reviews, badge, fit, oem, status, lead, desc, specs (map), images[], active.
- **Category** — slug, name, tag, blurb (product counts derived live).
- **Order** — `ref` ("AUX-1234"), user, email, items[{sku,name,price,qty}], subtotal, discount, promoCode, shipping, shippingFee, gst, total, address{}, `status`, `paymentStatus`, statusHistory[], placedAt.
- **Promo** — code (unique), label, pct (1–90), active.
- **Enquiry** — ref ("ENQ-1234"), name, phone, email, topic, message, sku?, status (New|Replied|Closed).
- **Setting** — single doc: store name, phone, email, address, hours, freight fees, ABN, announcement.

Order statuses: `Pending payment` · `Packed in Campbellfield VIC` · `Courier booked` · `In transit` · `Delivered` · `Cancelled` (kept in sync with the storefront).

---

## 5. Environment variables

### `truck-parts-api/.env`
| Var | Required | Purpose |
|---|---|---|
| `MONGO_URI` | ✅ | MongoDB connection string (Atlas or local) |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | ✅ | token signing — `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `PORT` | | API port (default 5000) |
| `CLIENT_ORIGINS` | ✅ (prod) | comma-separated allowed origins (storefront + admin URLs) |
| `APP_URL` | | storefront URL, used in emails + Stripe redirects |
| `COOKIE_SECURE` | prod=`true` | HTTPS-only refresh cookie |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` | | seed admin account |
| `RESEND_API_KEY` / `EMAIL_FROM` / `STORE_INBOX_EMAIL` | optional | email (blank = disabled) |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | optional | payments (blank = disabled) |

### `truck-parts-admin/.env` and `Aurex-Truck-Parts/.env`
| Var | Purpose |
|---|---|
| `VITE_API_URL` | API base, e.g. `http://localhost:5000/api`. Storefront: unset = localStorage mode. |

---

## 6. API reference

Base path `/api`. Responses are `{ ok, ... }`; errors `{ ok:false, error, details? }`.
Auth = `Authorization: Bearer <accessToken>` + httpOnly refresh cookie.

**Auth** — `POST /auth/register` · `POST /auth/login` · `POST /auth/refresh` · `POST /auth/logout` · `POST /auth/forgot-password` · `POST /auth/reset-password` · `GET /auth/me`

**Products** — `GET /products` (filters: category, q, brand, status, minPrice, maxPrice, buyable, sort, page, limit) · `GET /products/:sku` · `POST/PUT/DELETE` (admin)

**Categories** — `GET /categories` · `POST/PUT/DELETE` (admin)

**Promos** — `GET /promos/active` (public) · `POST /promos/validate` (public) · `GET/POST/PUT/DELETE` (admin)

**Orders** — `POST /orders` (guest/auth, server recomputes totals) · `GET /orders/mine` (auth) · `GET /orders/track/:ref` (public) · `GET /orders` (admin) · `GET /orders/:ref` (admin) · `PATCH /orders/:ref/status` (admin)

**Enquiries** — `POST /enquiries` (public) · `GET /enquiries` (admin) · `PATCH /enquiries/:ref/status` (admin)

**Settings** — `GET /settings` (public) · `PUT /settings` (admin)

**Admin** — `GET /admin/stats` · `GET /admin/customers`

**Uploads** — `POST /uploads` (admin, multipart field `image`) → `{ url }`; served at `/uploads/<file>`

**Payments** — `POST /payments/create-checkout-session` (card → Stripe hosted URL) · `POST /payments/create-intent` · `POST /payments/webhook` (Stripe → marks order paid)

---

## 7. How the storefront connects (dual-mode stores)

`src/lib/api.js` holds the fetch client and the `API_ON` flag (`= !!VITE_API_URL`).
The three stores branch on it:
- `store/auth.jsx` — API login/signup/logout/placeOrder + loads orders; mirrors orders into
  localStorage so the existing Account/Track/OrderSuccess pages work **unchanged**.
- `store/catalog.jsx` — products/categories from the API (seeded first = no flash); admin edits optimistic.
- `store/site.jsx` — settings + active promos from the API; enquiries POST to the API.

Only two call-sites were touched for async (`Auth` login/signup, `Checkout` placeOrder). Everything
else — Home, Shop, ProductDetail, cart, compare, promo popup, notifications — is untouched. Card
orders redirect to Stripe hosted checkout when Stripe is live, else the normal confirmation flow.

---

## 8. Deployment

- **API** → Render (use `render.yaml` blueprint, Docker) + **MongoDB Atlas**, or Docker/compose on a VPS.
  Set env vars in the dashboard; `COOKIE_SECURE=true`; run `npm run seed` once against prod.
  Add the Stripe webhook endpoint `https://<api>/api/payments/webhook` in the Stripe dashboard and
  paste the signing secret into `STRIPE_WEBHOOK_SECRET`.
- **Storefront** → Vercel (existing `vercel.json`). Set `VITE_API_URL` to the live API.
- **Admin** → Vercel (`vercel.json` added). Set `VITE_API_URL` to the live API.
- **CI** → GitHub Actions in each repo (`.github/workflows/ci.yml`): API runs the smoke test against a
  Mongo service; admin runs a build.

---

## 9. Status

**Done & validated (builds + syntax + no-DB checks pass):**
auth + password reset, catalogue, orders with anti-tamper totals, tracking, promos, enquiries,
settings, admin dashboard, image uploads, Stripe hosted payments, email, storefront integration,
brand-matched admin app, Docker, deploy config, CI.

**Pending — account setup (no code needed):**
1. **MongoDB** connection string (Atlas or Docker)
2. **Resend** API key + verified `aurex.com.au` sending domain (for email)
3. **Stripe** secret key + webhook signing secret (for card payments)
4. Hosting + live URLs for `APP_URL` / `CLIENT_ORIGINS`

Everything runs today with zero paid keys; each integration activates the moment its key is added.

---

## 10. Security notes
- Never commit `.env` (already in `.gitignore`).
- Change the seed admin password before going live.
- The old demo frontend had a Google API key committed in `config.json` — rotate/remove it.
- `COOKIE_SECURE=true` and HTTPS in production.

---

*Questions: the per-folder `README.md` in `truck-parts-api` and `truck-parts-admin` has the same
setup detail plus the full endpoint list.*
