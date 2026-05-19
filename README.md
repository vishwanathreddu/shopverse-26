# ShopVerse — MERN E-Commerce

A full-stack e-commerce platform built for portfolio and resume use. TypeScript end-to-end, JWT auth, Stripe checkout, admin dashboard, and a polished React storefront.

**Live demo:** [shopverse-26.vercel.app](https://shopverse-26.vercel.app)  
**API:** [shopverse-26-api.onrender.com/api/health](https://shopverse-26-api.onrender.com/api/health)  
**GitHub:** [vishwanathreddu/shopverse-26](https://github.com/vishwanathreddu/shopverse-26)

> Deployed on **Vercel** (frontend) + **Render** (API) + **MongoDB Atlas** (database).  
> Setup guide: **[DEPLOY.md](./DEPLOY.md)** · Quick start: **[START-HERE.md](./START-HERE.md)**

> **Continuing in a new chat?** Open `PROGRESS.md` first — it lists what's done and what's next.

## Tech stack

| Layer | Technologies |
|-------|----------------|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, React Router, TanStack Query, Zustand, React Hook Form, Zod |
| **Backend** | Node.js, Express, TypeScript, Mongoose |
| **Database** | MongoDB 7 |
| **Auth** | JWT access token + httpOnly refresh cookie |
| **Payments** | Stripe Checkout (optional — demo mode works without keys) |
| **DevOps** | Docker Compose (MongoDB) |

## Features

- User registration & login with role-based access (`user` / `admin`)
- Product catalog with search, filters, pagination, categories
- Product detail pages with cart actions
- Persistent cart (guest session + logged-in user)
- Checkout with shipping form, tax & shipping calculation
- Order history & order detail with **order confirmation email** (Resend or SMTP)
- **Wishlist** — save products, move to cart, heart toggle on catalog & detail pages
- Admin dashboard: revenue stats, sales chart, low-stock alerts, order management
- Product image upload (Cloudinary) or URL fallback
- Seed script with sample products and demo accounts

## Quick start

### Prerequisites

- Node.js 18+
- Docker (for MongoDB) or a MongoDB Atlas URI

### 1. Start MongoDB

```bash
cd shopverse
docker compose up -d
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run seed    # creates demo data
npm run dev     # http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev     # http://localhost:5173
```

### Demo accounts (after seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@shopverse.dev | Admin123! |
| User | demo@shopverse.dev | Demo123! |

## API overview

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register |
| POST | `/auth/login` | Login |
| POST | `/auth/refresh` | Refresh access token |
| GET | `/products` | List products (query: page, search, category, sort) |
| GET | `/products/:slug` | Product detail |
| GET | `/cart` | Get cart |
| POST | `/cart/items` | Add to cart |
| POST | `/orders` | Create order / Stripe session |
| GET | `/admin/stats` | Admin stats (auth required) |

## Stripe (optional)

1. Create a [Stripe](https://stripe.com) account
2. Add to `backend/.env`:
   - `STRIPE_SECRET_KEY=sk_test_...`
   - `STRIPE_WEBHOOK_SECRET=whsec_...` (for production webhooks)
3. Add to `frontend/.env`:
   - `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...`

Without Stripe keys, checkout runs in **demo mode** (orders marked paid immediately).

## Email (order confirmation)

Sent automatically when an order is marked **paid** (demo checkout or Stripe confirm).

1. **Resend** (recommended): [resend.com](https://resend.com) — add to `backend/.env`:
   - `RESEND_API_KEY=re_...`
   - `EMAIL_FROM=ShopVerse <orders@yourdomain.com>` (must be a verified domain in Resend)
2. **SMTP fallback** (Gmail, SendGrid, Mailtrap): `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`

Without keys, dev mode **logs the email to the server console** so you can verify templates locally.

## Wishlist API

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/wishlist` | User |
| GET | `/wishlist/ids` | User |
| POST | `/wishlist/items` | User |
| DELETE | `/wishlist/items/:productId` | User |
| POST | `/wishlist/items/:productId/move-to-cart` | User |

## Deployment

Full step-by-step guide: **[DEPLOY.md](./DEPLOY.md)** (MongoDB Atlas + Render + Vercel).

Quick summary:

1. Push repo to GitHub
2. Atlas → `MONGODB_URI` → `npm run seed` once
3. Render: root `backend`, env vars, health check `/api/health`
4. Vercel: root `frontend`, `VITE_API_URL=https://your-api.onrender.com/api`
5. Set Render `CLIENT_URL` to your Vercel URL (CORS + auth cookies)

## Project structure

```
shopverse/
├── backend/src/
│   ├── controllers/   # Route handlers
│   ├── models/        # Mongoose schemas
│   ├── routes/        # Express routers
│   ├── middleware/    # Auth, validation, errors
│   └── scripts/seed.ts
├── frontend/src/
│   ├── api/           # API client
│   ├── components/
│   ├── pages/
│   └── store/         # Zustand auth store
├── docker-compose.yml
├── PROGRESS.md        # Continuation guide for AI/humans
└── README.md
```

## Resume bullets

- Built **ShopVerse**, a production-style MERN e-commerce app with TypeScript, JWT authentication, role-based admin panel, and Stripe payment integration.
- Designed RESTful APIs with pagination, search, input validation, rate limiting, and structured error handling.
- Implemented responsive React UI with TanStack Query, form validation (Zod), and persistent shopping cart.

## Testing

See [TESTING.md](./TESTING.md) for API (Jest) and E2E (Playwright) setup.

```bash
npm run test:api   # backend — no MongoDB needed
npm run test:e2e   # Playwright — requires MongoDB + seed
```

## License

MIT — free to use in your portfolio.
