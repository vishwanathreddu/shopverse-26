# ShopVerse — Testing

## API tests (Jest + Supertest)

Uses an in-memory MongoDB — no Docker required.

```bash
cd backend
npm test
```

Watch mode:

```bash
npm run test:watch
```

**Coverage:** health, auth, products, cart, admin stats/analytics.

---

## E2E tests (Playwright)

Requires **MongoDB** running (Docker or Atlas) with seed data.

```bash
# 1. Start MongoDB
docker compose up -d

# 2. Install Playwright (first time only)
cd e2e && npm install && npx playwright install chromium

# 3. Run E2E (starts API + frontend automatically)
npm test
```

Interactive UI mode:

```bash
npm run test:e2e:ui
```

From repo root:

```bash
npm run test:api    # API only
npm run test:e2e    # E2E only
npm test            # both
```

**E2E flows:** customer login, admin login + mobile menu, add to cart → checkout → order.

---

## CI

GitHub Actions workflow `.github/workflows/test.yml` runs API tests and E2E (with MongoDB service) on push/PR.

---

## Demo credentials (after seed)

| Role | Email | Password |
|------|-------|----------|
| Customer | demo@shopverse.dev | Demo123! |
| Admin | admin@shopverse.dev | Admin123! |
