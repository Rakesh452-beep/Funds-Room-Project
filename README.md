# FundsRoom — Mini ERP + CRM

A full-stack operations portal for wholesale businesses: **Customer CRM**, **Product/Stock management**, **Sales Challans**, and **Analytics**, with role-based access for Admin, Sales, Warehouse and Accounts.

- **Frontend:** https://funds-room-project-gamma.vercel.app
- **Backend API:** https://funds-room-project.onrender.com
- **Health check:** https://funds-room-project.onrender.com/api/health
- **Repository:** https://github.com/Rakesh452-beep/Funds-Room-Project

---

## Test login credentials (all roles)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@fundsroom.com` | `password123` |
| Sales | `sales@fundsroom.com` | `password123` |
| Warehouse | `warehouse@fundsroom.com` | `password123` |
| Accounts | `accounts@fundsroom.com` | `password123` |

The login page also exposes a one-click **Test login credentials · all roles** panel.

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, React Router, Axios, Lucide icons, GSAP |
| Backend | Node.js, Express, TypeScript, Prisma ORM, JWT auth (bcrypt), express-validator |
| Database | PostgreSQL (Neon serverless) |
| PDF | PDFKit (invoice generation) |
| Hosting | Vercel (frontend), Render (backend), Neon (database) |
| Tooling | Docker + Docker Compose, GitHub Actions CI |

---

## Architecture

```
Browser (React SPA on Vercel)
        │  HTTPS  /api/*  (vercel.json rewrite)
        ▼
Express API (Render, Node)
        │  Prisma Client
        ▼
PostgreSQL (Neon)
```

- **Frontend** is a single-page app. All API calls use the relative `/api` base URL, so the same build works in dev, single-host Docker, and split Vercel+Render deployments. On Vercel, `frontend/vercel.json` rewrites `/api/*` to the Render backend.
- **Backend** is a modular Express API (`auth`, `customer`, `product`, `challan`, `user`). Each module has `*.routes.ts` + `*.controller.ts`. Cross-cutting concerns live in `middleware/` (JWT auth + role authorization, central error handler) and `utils/` (validation).
- **Database** is modeled in `backend/prisma/schema.prisma` (User, Customer, FollowUp, Product, StockMovement, Challan, ChallanItem) with enums for roles, customer type/status, challan status and stock movement type.
- **Stock integrity** is enforced server-side: confirming a challan runs a Prisma transaction that checks stock for every line, rejects the whole confirm if any line is short, decrements stock and writes `OUT` stock movements. Cancelling a confirmed challan restores stock and writes `IN` movements.
- **Auth** uses short-lived JWT bearer tokens; role checks (`authorize(...)`) guard every mutating route.

---

## Features

- JWT authentication with 4 roles (ADMIN / SALES / WAREHOUSE / ACCOUNTS)
- Customer CRM with follow-up notes and status pipeline (LEAD / ACTIVE / INACTIVE)
- Product catalog with live stock, low-stock alerts and stock movement ledger
- Sales challans with draft → confirmed → cancelled workflow and **PDF invoice export**
- Dashboard with KPIs, revenue, low-stock alerts and recent challans
- Landing page + login page powered by real public stats
- Docker Compose stack and GitHub Actions CI

---

## Local setup

### Prerequisites
- Node.js 18–20
- PostgreSQL (or Docker)

### Backend
```bash
cd backend
cp .env.example .env          # set DATABASE_URL + JWT_SECRET
npm install
npx prisma generate
npx prisma migrate deploy     # or: npx prisma migrate dev
npm run prisma:seed           # optional demo data + users
npm run dev                   # http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev                   # http://localhost:5173 (Vite proxies /api -> :5000)
```

### Docker (single command)
```bash
docker compose up --build
# frontend  -> http://localhost
# backend   -> http://localhost:5000
# postgres  -> localhost:5432
```

---

## API documentation

Base URL: `https://funds-room-project.onrender.com/api`
Import `postman/FundsRoom.postman_collection.json` into Postman. Run **Auth → Login** first; the collection script stores the JWT automatically.

### Auth
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/auth/login` | Public |
| POST | `/auth/register` | ADMIN |
| GET | `/auth/profile` | Authenticated |

### Customers
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/customers` | Authenticated |
| POST | `/customers` | ADMIN, SALES |
| GET | `/customers/:id` | Authenticated |
| PUT | `/customers/:id` | ADMIN, SALES |
| DELETE | `/customers/:id` | ADMIN |
| POST | `/customers/:id/follow-ups` | ADMIN, SALES, ACCOUNTS |

### Products
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/products` | Authenticated |
| POST | `/products` | ADMIN, WAREHOUSE |
| GET | `/products/low-stock` | Authenticated |
| GET | `/products/stock-movements` | Authenticated |
| GET | `/products/:id` | Authenticated |
| PUT | `/products/:id` | ADMIN, WAREHOUSE |
| POST | `/products/:id/stock` | ADMIN, WAREHOUSE |

### Challans
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/challans/public/stats` | Public |
| GET | `/challans/dashboard/stats` | Authenticated |
| GET | `/challans` | Authenticated |
| POST | `/challans` | ADMIN, SALES |
| GET | `/challans/:id` | Authenticated |
| GET | `/challans/:id/invoice` | Authenticated (returns PDF) |
| PUT | `/challans/:id` | ADMIN, SALES |
| POST | `/challans/:id/confirm` | ADMIN, SALES, WAREHOUSE |
| POST | `/challans/:id/cancel` | ADMIN, SALES |

### Users
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/users` | ADMIN |
| POST | `/users` | ADMIN |
| PUT | `/users/:id` | ADMIN |
| DELETE | `/users/:id` | ADMIN |

All responses follow `{ success: boolean, message?: string, data?: T, errors?: [] }`.

---

## Deployment

### Frontend → Vercel
1. Import the repo, set **Root Directory** to `frontend`.
2. Framework preset: Vite. Build: `npm run build`. Output: `dist`.
3. `frontend/vercel.json` rewrites `/api/*` to the Render backend and provides SPA fallback.

### Backend → Render
1. New **Web Service** from the repo, **Root Directory** `backend`.
2. Build: `npm install && npx prisma generate && npm run build`. Start: `npm start`.
3. Environment variables:
   - `DATABASE_URL` — PostgreSQL (Neon) connection string
   - `JWT_SECRET` — strong random string
   - `JWT_EXPIRES_IN` — e.g. `7d`
   - `FRONTEND_URL` — deployed frontend origin
   - `CORS_ORIGINS` — comma-separated allowed origins
4. Run `npx prisma migrate deploy` once (Render shell or a one-off job) to create tables.

### Database → Neon
Create a Neon PostgreSQL project, copy the pooled connection string into `DATABASE_URL` on Render.

### CI
`.github/workflows/ci.yml` runs typecheck + build for backend and frontend on every push/PR to `master`.

---

## Environment variables (`backend/.env`)

```
DATABASE_URL="postgresql://user:password@host:5432/fundsroom?schema=public"
JWT_SECRET="change-me"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
CORS_ORIGINS="http://localhost:5173,https://funds-room-project-gamma.vercel.app"
```

---

## Known limitations / incomplete parts

- **No automated test suite** — verification is via GitHub Actions build/typecheck and manual API testing (Postman).
- **Render free tier cold starts** — the backend sleeps after inactivity, so the first request can take ~30–60s.
- **Product image upload is not enabled** — the `imageUrl` column exists in the schema but the upload endpoint/UI were removed (no cloud storage configured). Easily re-added with an S3-compatible or Vercel Blob integration.
- **Single-tenant** — no organization/multi-tenant separation.
- **PDF invoice** is a generated, print-ready document; it is not e-invoicing/GST-filing compliant and has no email delivery.
- **Invoice numbering** resets per calendar day (`CH-YYYYMMDD-NNN`); not a global gapless sequence.
- **No refresh tokens / password reset flow** — JWTs are valid for their lifetime and users must re-login.
- **Landing/dashboard stats are computed on the fly** (not cached), fine for demo scale but not for high traffic.
- **Pagination is API-supported** but some list pages render the returned page only.

---

© 2026 FundsRoom. Demo project.
