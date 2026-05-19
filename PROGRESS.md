# ShopVerse — Build Progress & Continuation Guide

> **For AI / new chat:** Read this file first, then `README.md`. Continue from the first unchecked item in "Next steps".

## Project location

`/home/vishwanath/Desktop/vishwanath/Documents/shopverse`

## Stack

| Layer | Tech |
|-------|------|
| DB | MongoDB 7 |
| API | Node.js, Express 4, TypeScript |
| Auth | JWT (access + refresh in httpOnly cookie) |
| Validation | express-validator, Zod (frontend) |
| Payments | Stripe (checkout session) |
| Client | React 18, Vite, TypeScript, Tailwind |
| State | Zustand (cart/auth UI), TanStack Query (server) |
| Deploy | Docker Compose (local), Render/Railway/Vercel docs in README |

## Completed (Session 2 — cart & checkout fixes)

- [x] Fixed product ID matching when cart items are populated (`getProductId` helper)
- [x] Fixed stale guest session cart re-appearing after checkout (`clearCartsForUser`)
- [x] Cart mutations use unpopulated cart; populate only for API responses
- [x] Guest cart merge only for carts without `user` field
- [x] Frontend: invalidate cart after login, register, checkout
- [x] Login redirects to intended page (`/products` or previous protected route)
- [x] Cart +/- shows API errors via toast

## Completed (Session 1 — May 18, 2026)

- [x] Monorepo scaffold (`backend/`, `frontend/`)
- [x] Backend: User, Product, Category, Order, Review models
- [x] Backend: Auth (register, login, refresh, logout, profile)
- [x] Backend: Products CRUD + search/filter/pagination
- [x] Backend: Cart (guest session + user merge)
- [x] Backend: Orders + Stripe checkout session
- [x] Backend: Admin routes (products, orders, stats)
- [x] Backend: Seed script with sample data
- [x] Frontend: Layout, routing, auth pages
- [x] Frontend: Home, product list/detail, cart, checkout
- [x] Frontend: Admin dashboard (basic)
- [x] Docker Compose for MongoDB
- [x] README with setup & deploy notes

## Completed (Session 3 — admin panel expansion)

- [x] Admin sub-routes: Dashboard, Orders, Products, Users, Active carts
- [x] Product CRUD UI (create, edit, deactivate)
- [x] User management (list, change role)
- [x] Orders table with pagination and status updates
- [x] Read-only active carts view

## Completed (Session 4 — categories & reviews)

- [x] Admin categories CRUD (`/admin/categories` API + UI)
- [x] Product reviews on storefront (list + submit when logged in)
- [x] Admin reviews moderation (`/admin/reviews` — list, delete)

## Completed (Session 6 — responsive layouts)

- [x] Admin mobile sidebar drawer (hamburger open, overlay + X close, Escape key)
- [x] Storefront mobile menu drawer + mobile search bar
- [x] Shared `MobileDrawer` component + body scroll lock
- [x] Admin tables horizontal scroll on small screens (`.table-scroll`)

## Completed (Session 5 — analytics & image upload)

- [x] Admin sales chart (7 / 30 day revenue bar chart, Recharts)
- [x] Low stock widget on dashboard (≤10 units)
- [x] Product image upload via Multer + Cloudinary (`POST /admin/upload`)
- [x] Admin product form: file upload + URL fallback

## Completed (Session 7 — testing)

- [x] API tests: Jest + Supertest + mongodb-memory-server (13 tests)
- [x] E2E tests: Playwright (auth, checkout, admin mobile menu)
- [x] GitHub Actions CI workflow
- [x] `TESTING.md` + root `npm test` scripts

## Completed (Session 8 — email & wishlist)

- [x] Order confirmation email (Resend + SMTP fallback, HTML + plain text)
- [x] Idempotent send via `confirmationEmailSentAt` on Order
- [x] Dev console logging when no email provider configured
- [x] Wishlist API: list, ids, add, remove, clear, move-to-cart
- [x] Wishlist UI: `/account/wishlist`, heart on product cards & detail
- [x] API tests for wishlist (6 tests)

## Next steps (pick up here)

- [ ] **Production deploy:** Follow **[DEPLOY.md](./DEPLOY.md)** — GitHub → Atlas → Render → Vercel
- [ ] Update README live demo + GitHub URLs after deploy

## Default credentials (after seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@shopverse.dev | Admin123! |
| User | demo@shopverse.dev | Demo123! |

## Run locally

```bash
# Terminal 1 — MongoDB
cd shopverse && docker compose up -d

# Terminal 2 — API
cd shopverse/backend && cp .env.example .env && npm i && npm run seed && npm run dev

# Terminal 3 — Client
cd shopverse/frontend && cp .env.example .env && npm i && npm run dev
```

## Key env vars

- Backend: `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `STRIPE_SECRET_KEY`, `CLIENT_URL`, `CLOUDINARY_*` (optional)
- Frontend: `VITE_API_URL`, `VITE_STRIPE_PUBLISHABLE_KEY`

## Folder map

```
shopverse/
├── backend/src/
│   ├── app.ts              # Express app
│   ├── index.ts            # Server entry
│   ├── config/             # DB, env
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Route mounts
│   ├── controllers/        # Request handlers
│   ├── middleware/         # auth, error, validate
│   └── scripts/seed.ts
└── frontend/src/
    ├── api/                # axios client
    ├── components/
    ├── pages/
    ├── store/              # Zustand
    └── hooks/
```

## Resume bullet ideas

- Built full-stack e-commerce platform (MERN, TypeScript) with JWT auth, role-based admin, Stripe checkout, and REST API with pagination/search.
- Implemented cart persistence, order lifecycle, and Dockerized MongoDB for local/production parity.
