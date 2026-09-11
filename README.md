# FundsRoom — Mini ERP + CRM

> A full-stack operations portal for wholesale businesses featuring **Customer CRM**, **Product & Stock Management**, **Sales Challans with PDF Invoicing**, **Role-Based Access Control**, and a **Live Analytics Dashboard**.

---

## Quick Links

| | |
|---|---|
| **Frontend (Live)** | https://funds-room-project-gamma.vercel.app |
| **Backend API (Live)** | https://funds-room-project.onrender.com |
| **Health Check** | https://funds-room-project.onrender.com/api/health |
| **GitHub Repository** | https://github.com/Rakesh452-beep/Funds-Room-Project |
| **Postman Collection** | `postman/FundsRoom.postman_collection.json` (in repo) |
| **README / Docs** | This file (`README.md`) |
| **Database** | PostgreSQL via Neon (serverless) |

### Test Credentials (All Roles)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@fundsroom.com` | `password123` |
| Sales | `sales@fundsroom.com` | `password123` |
| Warehouse | `warehouse@fundsroom.com` | `password123` |
| Accounts | `accounts@fundsroom.com` | `password123` |

> The login page also includes a one-click **"Test login credentials · all roles"** panel for instant access.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [System Architecture](#3-system-architecture)
4. [Database Schema](#4-database-schema)
5. [Features](#5-features)
6. [Frontend — Pages & Routing](#6-frontend--pages--routing)
7. [Backend — Modules & Structure](#7-backend--modules--structure)
8. [API Reference](#8-api-reference)
9. [Authentication & Role-Based Access](#9-authentication--role-based-access)
10. [Challan Lifecycle & Stock Workflow](#10-challan-lifecycle--stock-workflow)
11. [PDF Invoice Generation](#11-pdf-invoice-generation)
12. [Local Development Setup](#12-local-development-setup)
13. [Docker Setup](#13-docker-setup)
14. [Deployment](#14-deployment)
15. [CI/CD Pipeline](#15-cicd-pipeline)
16. [Environment Variables](#16-environment-variables)
17. [Project File Structure](#17-project-file-structure)
18. [Known Limitations & Incomplete Parts](#18-known-limitations--incomplete-parts)
19. [Quick Links](#19-quick-links)

---

## 1. Project Overview

**FundsRoom** is a mini ERP + CRM designed for wholesale/retail businesses. It centralizes customer management, product inventory, sales dispatch (challans), and operational analytics into a single portal with four distinct user roles.

### What it solves

- **Customer CRM** — track leads, active customers, and inactive accounts with follow-up notes.
- **Product & Stock Management** — catalog products with SKU, pricing, location, and live stock levels. Automatic low-stock alerts. Full stock movement ledger.
- **Sales Challans** — create dispatch notes (challans) with line items. Workflow: Draft → Confirmed → Cancelled. Stock is atomically decremented on confirm, restored on cancel.
- **PDF Invoicing** — download a branded, print-ready PDF invoice for any challan.
- **Dashboard** — real-time KPIs: total customers, products, revenue, draft/confirmed challans, low-stock alerts, and recent challan activity.
- **Role-Based Access** — four roles (Admin, Sales, Warehouse, Accounts) with fine-grained route permissions.

---

## 2. Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18, TypeScript, Vite | SPA with type safety and fast HMR |
| **Styling** | Tailwind CSS | Utility-first responsive UI |
| **Routing** | React Router v6 | Client-side SPA routing with route guards |
| **HTTP Client** | Axios | API calls with JWT interceptor and 401 auto-logout |
| **Icons** | Lucide React | Consistent vector icon library |
| **Animations** | GSAP | Smooth landing page and scroll animations |
| **Backend** | Node.js, Express, TypeScript | RESTful API with modular architecture |
| **ORM** | Prisma | Type-safe database access, migrations, seeding |
| **Validation** | express-validator | Request body validation middleware |
| **Auth** | JWT (jsonwebtoken) + bcrypt | Stateless token-based authentication |
| **PDF** | PDFKit | Server-side PDF invoice generation |
| **Database** | PostgreSQL (Neon) | Serverless relational database |
| **Hosting** | Vercel (frontend), Render (backend) | Free-tier cloud deployment |
| **Tooling** | Docker, GitHub Actions | Containerization and CI/CD |

---

## 3. System Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     BROWSER (SPA)                        │
│              React + TypeScript + Tailwind                │
│          Hosted on Vercel (free tier)                     │
│                                                          │
│  Pages:  Landing → Login → Dashboard                     │
│          Customers → Products → Challans → Users          │
│                                                          │
│  API calls use relative /api base URL                    │
└──────────────────────┬───────────────────────────────────┘
                       │  HTTPS
                       │  /api/*  (Vercel rewrite via vercel.json)
                       ▼
┌──────────────────────────────────────────────────────────┐
│                  EXPRESS API SERVER                       │
│             Hosted on Render (free tier)                  │
│                                                          │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐  │
│  │  Auth   │  │ Customer │  │ Product  │  │ Challan │  │
│  │ Module  │  │  Module  │  │  Module  │  │ Module  │  │
│  └─────────┘  └──────────┘  └──────────┘  └─────────┘  │
│                                                          │
│  Middleware:  JWT Auth  →  Role Check  →  Validation     │
│  Cross-cut:  Error Handler, CORS, Helmet                 │
│                                                          │
│  ORM: Prisma Client (auto-generated from schema)        │
└──────────────────────┬───────────────────────────────────┘
                       │  Prisma Client (TCP)
                       ▼
┌──────────────────────────────────────────────────────────┐
│                  PostgreSQL DATABASE                      │
│              Hosted on Neon (serverless)                  │
│                                                          │
│  Tables: users, customers, follow_ups, products,         │
│          stock_movements, challans, challan_items         │
└──────────────────────────────────────────────────────────┘
```

### Request Flow

1. User interacts with the React SPA in the browser.
2. Axios sends requests to `/api/*` with a JWT `Authorization: Bearer` header.
3. Vercel rewrites `/api/*` → `https://funds-room-project.onrender.com/api/*`.
4. Express receives the request:
   - **Auth middleware** verifies the JWT and attaches `req.user`.
   - **Role middleware** checks `authorize(roles...)` against `req.user.role`.
   - **Validation middleware** runs `express-validator` checks.
   - **Controller** executes business logic and queries the database via Prisma.
5. Response returns as JSON: `{ success, data?, message?, pagination? }`.
6. On 401 errors, the frontend clears tokens and redirects to `/login`.

---

## 4. Database Schema

Prisma schema at `backend/prisma/schema.prisma`:

```
┌─────────────┐       ┌──────────────────┐       ┌──────────────┐
│    User      │       │    Customer       │       │    Product   │
├─────────────┤       ├──────────────────┤       ├──────────────┤
│ id (PK,uuid)│◄──┐   │ id (PK,uuid)     │◄──┐   │ id (PK,uuid) │◄──┐
│ name         │   │   │ name             │   │   │ name         │   │
│ email (uni)  │   │   │ mobile           │   │   │ sku (uni)    │   │
│ password     │   │   │ email            │   │   │ category     │   │
│ role (enum)  │   │   │ businessName     │   │   │ unitPrice    │   │
│ createdAt    │   │   │ gstNumber?       │   │   │ currentStock │   │
│ updatedAt    │   │   │ customerType     │   │   │ minStockAlert│   │
└─────────────┘   │   │ address          │   │   │ location     │   │
                  │   │ status (enum)    │   │   │ imageUrl?    │   │
                  │   │ followUpDate?    │   │   │ createdBy    │───┘
                  │   │ createdBy ───────│───┘   └──────────────┘
                  │   └──────────────────┘              │
                  │                                     │
          ┌───────┤─── FollowUp                         │
          │       │   id, note, createdAt,              │
          │       │   customerId → Customer             │
          │       │   createdBy → User                  │
          │       ├──────────────────┐                  │
          │       │   StockMovement  │                  │
          │       │   id, quantity   │                  │
          │       │   movementType   │                  │
          │       │   reason         │                  │
          │       │   productId ─────│──────────────────┘
          │       │   createdBy ─────│─── User
          │       └──────────────────┘
          │       ┌──────────────────┐       ┌──────────────┐
          │       │    Challan       │       │ ChallanItem  │
          │       ├──────────────────┤       ├──────────────┤
          └──────►│ id (PK,uuid)     │◄──┐   │ id           │
                  │ challanNumber    │   │   │ productName  │
                  │ totalQuantity    │   │   │ productSku   │
                  │ status (enum)    │   │   │ unitPrice    │
                  │ customerId ──────│───┘   │ quantity     │
                  │ createdBy ───────│─── User│ productId ──│─── Product
                  │ createdAt        │   │   │ challanId ───│─── Challan
                  └──────────────────┘   │   └──────────────┘
                                         │
```

### Enums

| Enum | Values | Used in |
|------|--------|---------|
| `UserRole` | `ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS` | User |
| `CustomerType` | `RETAIL`, `WHOLESALE`, `DISTRIBUTOR` | Customer |
| `CustomerStatus` | `LEAD`, `ACTIVE`, `INACTIVE` | Customer |
| `StockMovementType` | `IN`, `OUT` | StockMovement |
| `ChallanStatus` | `DRAFT`, `CONFIRMED`, `CANCELLED` | Challan |

---

## 5. Features

### Authentication & Authorization
- JWT-based stateless authentication (token stored in `localStorage`)
- Four roles: **ADMIN**, **SALES**, **WAREHOUSE**, **ACCOUNTS**
- Automatic 401 redirect to login on token expiry
- Route-level and button-level role gating

### Customer CRM
- Full CRUD for customers (create, read, update, delete)
- Customer types: Retail, Wholesale, Distributor
- Customer status pipeline: Lead → Active → Inactive
- Follow-up notes with author tracking and timestamps
- Follow-up date scheduling

### Product & Stock Management
- Full CRUD for products with SKU, category, pricing, location
- Live stock level tracking (`currentStock`)
- Low-stock alerts (configurable per-product `minStockAlert`)
- Stock movement ledger (every IN/OUT recorded with reason and user)
- Manual stock adjustment API

### Sales Challans
- Create challans with line items (product selection + quantity)
- Auto-generated challan number (`CH-YYYYMMDD-NNN`)
- Lifecycle: Draft → Confirmed → Cancelled
- **Confirm** atomically checks stock, decrements, and writes OUT movements
- **Cancel** restores stock and writes IN movements
- PDF invoice export (branded, single-page A4)

### Dashboard
- KPI cards: total customers, products, draft challans, revenue
- Low-stock alert banner
- Recent challans list with quick links

### Landing Page & Login
- Public landing page with hero, features, and stats section
- Stats pulled from real database (public API)
- Login page with role-based credential quick-fill panel

---

## 6. Frontend — Pages & Routing

All routes are defined in `frontend/src/main.tsx`:

| Path | Component | Access | Description |
|------|-----------|--------|-------------|
| `/` | `LandingPage` | Public | Hero + features + stats |
| `/login` | `LoginPage` | Public | Email/password login |
| `/dashboard` | `DashboardPage` | Authenticated | KPIs + recent activity |
| `/customers` | `CustomerListPage` | Authenticated | Paginated customer list |
| `/customers/new` | `CustomerFormPage` | ADMIN, SALES | Create customer |
| `/customers/:id` | `CustomerDetailPage` | Authenticated | Detail + follow-ups |
| `/customers/:id/edit` | `CustomerFormPage` | ADMIN, SALES | Edit customer |
| `/products` | `ProductListPage` | Authenticated | Paginated product list |
| `/products/new` | `ProductFormPage` | ADMIN, WAREHOUSE | Create product |
| `/products/:id` | `ProductDetailPage` | Authenticated | Detail + stock movements |
| `/products/:id/edit` | `ProductFormPage` | ADMIN, WAREHOUSE | Edit product |
| `/challans` | `ChallanListPage` | Authenticated | Paginated challan list |
| `/challans/new` | `ChallanFormPage` | ADMIN, SALES | Create challan |
| `/challans/:id` | `ChallanDetailPage` | Authenticated | Detail + PDF download |
| `/users` | `UsersPage` | ADMIN only | User management |
| `*` | Redirect → `/` | — | Catch-all |

### Key UI Components

| Component | File | Purpose |
|-----------|------|---------|
| `Layout` (DashboardLayout) | `components/Layout.tsx` | Sidebar + header + content area |
| `Sidebar` | `components/Sidebar.tsx` | Navigation with role-based visibility |
| `Header` | `components/Header.tsx` | Breadcrumbs, profile dropdown, sticky blur |
| `ProtectedRoute` | `components/ProtectedRoute.tsx` | Auth + role guard wrapper |
| `Pagination` | `components/Pagination.tsx` | Reusable page controls |
| `Modal` | `components/Modal.tsx` | Reusable dialog |
| `Toast` | `components/Toast.tsx` | Notification toasts |
| `MaskedHeading` | `components/landing/MaskedHeading.tsx` | Animated text reveal (GSAP) |
| `HeroSection` | `components/landing/HeroSection.tsx` | Landing hero with CTA |

---

## 7. Backend — Modules & Structure

```
backend/src/
├── index.ts                        # Express app entry point
├── config/
│   ├── env.ts                      # Environment variable loader
│   └── prisma.ts                   # Prisma client singleton
├── middleware/
│   ├── auth.ts                     # JWT verify + role authorize
│   └── errorHandler.ts             # Centralized error handler
├── modules/
│   ├── auth/
│   │   ├── authRoutes.ts           # /login, /register, /profile
│   │   └── authController.ts       # bcrypt + JWT logic
│   ├── customer/
│   │   ├── customerRoutes.ts       # CRUD + follow-ups
│   │   └── customerController.ts   # Customer business logic
│   ├── product/
│   │   ├── productRoutes.ts        # CRUD + stock + low-stock
│   │   └── productController.ts    # Stock movement logic
│   ├── challan/
│   │   ├── challanRoutes.ts        # CRUD + confirm + cancel + invoice
│   │   └── challanController.ts    # Stock atomicity + PDFKit
│   └── user/
│       ├── userRoutes.ts           # User CRUD (admin only)
│       └── userController.ts       # User management logic
└── utils/
    ├── validations.ts              # express-validator rule sets
    └── validateResult.ts           # Validation error handler
```

### Request Lifecycle

```
Incoming Request
    │
    ▼
express.json() / CORS / Helmet
    │
    ▼
Route Matching (router)
    │
    ▼
authenticate() middleware          ← verifies JWT, attaches req.user
    │
    ▼
authorize(roles) middleware        ← checks role against allowed list
    │
    ▼
validation middleware              ← express-validator rules
    │
    ▼
validateResult()                   ← returns 400 with errors if any
    │
    ▼
Controller function                ← business logic + Prisma queries
    │
    ▼
Response: { success, data?, message?, pagination? }
    │
    ▼
errorHandler()                    ← catches unhandled errors, returns 500
```

---

## 8. API Reference

**Base URL:** `https://funds-room-project.onrender.com/api`

**Response format:**
```json
{
  "success": true,
  "message": "optional message",
  "data": { },
  "errors": [{ "field": "...", "message": "..." }],
  "pagination": { "page": 1, "limit": 10, "total": 50, "totalPages": 5, "hasNextPage": true, "hasPrevPage": false }
}
```

### Health Check

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | None | API info JSON |
| GET | `/api/health` | None | `{"status":"ok","timestamp":"..."}` |

### Authentication

| Method | Endpoint | Auth | Body / Description |
|--------|----------|------|---------------------|
| POST | `/auth/login` | None | `{ "email", "password" }` → returns `{ token, user }` |
| POST | `/auth/register` | ADMIN | `{ "name", "email", "password", "role" }` |
| GET | `/auth/profile` | Any | Returns current user profile |

### Customers

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/customers?page=1&limit=10` | Any | Paginated list with search |
| POST | `/customers` | ADMIN, SALES | Create customer |
| GET | `/customers/:id` | Any | Get customer with follow-ups and challans |
| PUT | `/customers/:id` | ADMIN, SALES | Update customer |
| DELETE | `/customers/:id` | ADMIN | Delete customer |
| POST | `/customers/:id/follow-ups` | ADMIN, SALES, ACCOUNTS | Add follow-up note |

### Products

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/products?page=1&limit=10` | Any | Paginated list with search |
| POST | `/products` | ADMIN, WAREHOUSE | Create product |
| GET | `/products/low-stock` | Any | Products below minStockAlert |
| GET | `/products/stock-movements?page=1&limit=10` | Any | Global stock movement ledger |
| GET | `/products/:id` | Any | Product detail with stock movements |
| PUT | `/products/:id` | ADMIN, WAREHOUSE | Update product details |
| POST | `/products/:id/stock` | ADMIN, WAREHOUSE | Log manual stock adjustment |

### Challans

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/challans/public/stats` | None | Public stats for landing page |
| GET | `/challans/dashboard/stats` | Any | Full dashboard KPIs |
| GET | `/challans?page=1&limit=10` | Any | Paginated list with filters |
| POST | `/challans` | ADMIN, SALES | Create challan with line items |
| GET | `/challans/:id` | Any | Challan detail with items |
| GET | `/challans/:id/invoice` | Any | Download PDF invoice |
| PUT | `/challans/:id` | ADMIN, SALES | Update challan (draft only) |
| POST | `/challans/:id/confirm` | ADMIN, SALES, WAREHOUSE | Confirm (decrements stock) |
| POST | `/challans/:id/cancel` | ADMIN, SALES | Cancel (restores stock) |

### Users (Admin Only)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users?page=1&limit=10` | ADMIN | Paginated user list |
| POST | `/users` | ADMIN | Create user |
| PUT | `/users/:id` | ADMIN | Update user |
| DELETE | `/users/:id` | ADMIN | Delete user |

### Using the Postman Collection

1. Import `postman/FundsRoom.postman_collection.json` into Postman.
2. Run **Auth → Login (Admin)** — the test script auto-saves the JWT to `{{token}}`.
3. All other requests inherit the token via the collection-level Bearer auth.
4. Switch roles by running a different Login request.
5. Set `{{customerId}}`, `{{productId}}`, `{{challanId}}` variables manually or from response save scripts.

---

## 9. Authentication & Role-Based Access

### JWT Authentication

- On login, the server returns a signed JWT containing `{ userId, role }`.
- The token is stored in `localStorage` under the key `fundsroom_token`.
- Every authenticated request includes `Authorization: Bearer <token>`.
- Tokens expire after `JWT_EXPIRES_IN` (default: 7 days).
- On 401 responses (non-login), the frontend clears storage and redirects to `/login`.

### Role Permissions Matrix

| Action | ADMIN | SALES | WAREHOUSE | ACCOUNTS |
|--------|:-----:|:-----:|:---------:|:--------:|
| Login | Yes | Yes | Yes | Yes |
| View Dashboard | Yes | Yes | Yes | Yes |
| **Customers** | | | | |
| View customers | Yes | Yes | Yes | Yes |
| Create customer | Yes | Yes | - | - |
| Edit customer | Yes | Yes | - | - |
| Delete customer | Yes | - | - | - |
| Add follow-up | Yes | Yes | - | Yes |
| **Products** | | | | |
| View products | Yes | Yes | Yes | Yes |
| Create product | Yes | - | Yes | - |
| Edit product | Yes | - | Yes | - |
| Log stock movement | Yes | - | Yes | - |
| **Challans** | | | | |
| View challans | Yes | Yes | Yes | Yes |
| Create challan | Yes | Yes | - | - |
| Edit challan | Yes | Yes | - | - |
| Confirm challan | Yes | Yes | Yes | - |
| Cancel challan | Yes | Yes | - | - |
| Download invoice PDF | Yes | Yes | Yes | Yes |
| **Users** | | | | |
| Manage users | Yes | - | - | - |

### Enforcement Points

- **Backend**: `authenticate()` middleware verifies JWT; `authorize('ADMIN', 'SALES')` checks `req.user.role`.
- **Frontend**: `ProtectedRoute` component wraps routes with `allowedRoles` prop; conditional rendering hides buttons/links for unauthorized roles (e.g., "New Challan" button only shown for ADMIN/SALES).

---

## 10. Challan Lifecycle & Stock Workflow

```
                    ┌──────────────────┐
                    │   Create Challan │  (ADMIN, SALES)
                    │  status = DRAFT  │
                    └────────┬─────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
    ┌───────────────────┐        ┌────────────────────┐
    │   Confirm Challan │        │   Cancel Challan   │
    │ (ADMIN,SALES,WH) │        │   (ADMIN, SALES)   │
    └────────┬──────────┘        └────────┬───────────┘
             │                            │
             ▼                            ▼
    ┌───────────────────┐        ┌────────────────────┐
    │ status=CONFIRMED  │        │ status=CANCELLED   │
    │                   │        │                    │
    │ For each item:    │        │ If was CONFIRMED:  │
    │  1. Check stock   │        │  1. Restore stock  │
    │     ≥ quantity?   │        │  2. Write IN move  │
    │  2. If ANY short: │        └────────────────────┘
    │     REJECT ALL    │
    │  3. If all OK:    │
    │     Decrement     │
    │     Write OUT move│
    └───────────────────┘
```

### Stock Atomicity

The confirm operation runs inside a **Prisma interactive transaction**:

1. **Read lock** — re-reads all products within the transaction.
2. **Validation** — checks every line item has sufficient `currentStock`.
3. **Rejection** — if any single line is short, the entire transaction is rolled back and an error lists all insufficient products.
4. **Execution** — if all lines pass, stock is decremented and `StockMovement` records (type `OUT`) are written in the same transaction.

This guarantees **all-or-nothing** stock updates — no partial decrements ever occur.

---

## 11. PDF Invoice Generation

- Endpoint: `GET /api/challans/:id/invoice`
- Returns: `application/pdf` with `Content-Disposition: attachment`
- Generated by **PDFKit** on the server
- Layout: branded header with "FundsRoom" logo, challan metadata (number, date, status), customer details, line-item table (product, SKU, qty, price, subtotal), grand total, and a footer with generation timestamp
- Single-page A4 output
- Accessible to any authenticated user

---

## 12. Local Development Setup

### Prerequisites

- **Node.js** 18–20
- **PostgreSQL** local install, Docker, or Neon cloud
- **Git**

### Step 1 — Clone

```bash
git clone https://github.com/Rakesh452-beep/Funds-Room-Project.git
cd Funds-Room-Project
```

### Step 2 — Backend

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env — set DATABASE_URL and JWT_SECRET

# Generate Prisma client
npx prisma generate

# Run migrations (creates tables)
npx prisma migrate dev

# Seed demo data (optional — creates 4 role-based users + sample data)
npm run prisma:seed

# Start dev server (http://localhost:5000)
npm run dev
```

### Step 3 — Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev
```

The Vite dev server proxies `/api` requests to `localhost:5000` automatically.

### Step 4 — Verify

- Open http://localhost:5173
- Login with `admin@fundsroom.com` / `password123`
- Check dashboard loads with stats

---

## 13. Docker Setup

### Prerequisites

- Docker + Docker Compose installed

### Run

```bash
docker compose up --build
```

This starts three services:

| Service | URL | Description |
|---------|-----|-------------|
| frontend | http://localhost | React SPA served by nginx |
| backend | http://localhost:5000 | Express API |
| postgres | localhost:5432 | PostgreSQL 16 database |

Nginx is configured to proxy `/api/*` requests to the backend service. The frontend build is served as static files.

### Docker Architecture

```
Browser → http://localhost
              │
              ▼ (nginx)
         ┌────────────────────┐
         │  frontend (nginx)  │
         │  Serves SPA files  │
         │  /api/* → backend  │
         └────────┬───────────┘
                  │  proxy_pass
                  ▼
         ┌────────────────────┐
         │  backend (Node)    │
         │  Express API       │
         └────────┬───────────┘
                  │  Prisma
                  ▼
         ┌────────────────────┐
         │  postgres (PG 16)  │
         └────────────────────┘
```

---

## 14. Deployment

### Frontend → Vercel

1. Connect GitHub repo to Vercel.
2. Set **Root Directory** to `frontend`.
3. Framework: **Vite**. Build command: `npm run build`. Output: `dist`.
4. Deploy — Vercel auto-builds on push to `master`.
5. `frontend/vercel.json` handles:
   - **SPA fallback**: all non-file routes → `index.html`
   - **API proxy**: `/api/(.*)` → `https://funds-room-project.onrender.com/api/$1`

### Backend → Render

1. Create a **Web Service** from the GitHub repo.
2. Set **Root Directory** to `backend`.
3. **Build Command**: `npm install && npx prisma generate && npm run build`
4. **Start Command**: `npm start`
5. **Environment**:
   - `DATABASE_URL` — Neon pooled connection string
   - `JWT_SECRET` — strong random string
   - `JWT_EXPIRES_IN` — `7d`
   - `NODE_ENV` — `production`
   - `PORT` — `5000`
   - `FRONTEND_URL` — `https://funds-room-project-gamma.vercel.app`
   - `CORS_ORIGINS` — `https://funds-room-project-gamma.vercel.app,http://localhost:5173`
6. Run `npx prisma migrate deploy` once via Render Shell to create tables.
7. Render free tier: backend sleeps after ~15 min inactivity (cold start ~30-60s).

### Database → Neon

1. Create a Neon PostgreSQL project.
2. Copy the **pooled** connection string.
3. Paste into `DATABASE_URL` on Render.
4. The schema is applied by Prisma migrations (no manual SQL needed).

---

## 15. CI/CD Pipeline

`.github/workflows/ci.yml` runs on every push and PR to `master`:

```yaml
Jobs:
  backend:
    - Checkout
    - Setup Node 20
    - npm ci (backend/)
    - npx prisma generate
    - npx tsc --noEmit (type check)
    - npm run build

  frontend:
    - Checkout
    - Setup Node 20
    - npm ci (frontend/)
    - npx tsc --noEmit (type check)
    - npm run build
```

Both jobs run in parallel. A type error or build failure in either blocks the merge.

---

## 16. Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | `postgresql://user:pass@host:5432/fundsroom` | Neon pooled connection string |
| `JWT_SECRET` | Yes | `your-super-secret-key` | JWT signing secret |
| `JWT_EXPIRES_IN` | No | `7d` | Token lifetime (default: 7d) |
| `PORT` | No | `5000` | Server port (default: 5000) |
| `NODE_ENV` | No | `production` | Environment mode |
| `FRONTEND_URL` | No | `https://...vercel.app` | Allowed CORS origin |
| `CORS_ORIGINS` | No | `https://...,http://...` | Comma-separated CORS origins |

### Frontend (via Vite env or proxy)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `/api` | API base URL (relative works everywhere) |

---

## 17. Project File Structure

```
Funds-Room-Project/
│
├── .github/
│   └── workflows/
│       └── ci.yml                          # GitHub Actions CI pipeline
│
├── backend/
│   ├── .node-version                       # Node 20.11.1 (Render auto-detects)
│   ├── package.json                        # Dependencies + scripts
│   ├── prisma/
│   │   ├── schema.prisma                   # Database schema + enums
│   │   └── seed.ts                         # Seed script (demo users + data)
│   └── src/
│       ├── index.ts                        # Express app entry
│       ├── config/
│       │   ├── env.ts                      # Env variable loader
│       │   └── prisma.ts                   # Prisma client singleton
│       ├── middleware/
│       │   ├── auth.ts                     # JWT authenticate + authorize
│       │   └── errorHandler.ts             # Centralized error handler
│       ├── modules/
│       │   ├── auth/
│       │   │   ├── authRoutes.ts
│       │   │   └── authController.ts
│       │   ├── customer/
│       │   │   ├── customerRoutes.ts
│       │   │   └── customerController.ts
│       │   ├── product/
│       │   │   ├── productRoutes.ts
│       │   │   └── productController.ts
│       │   ├── challan/
│       │   │   ├── challanRoutes.ts
│       │   │   └── challanController.ts
│       │   └── user/
│       │       ├── userRoutes.ts
│       │       └── userController.ts
│       └── utils/
│           ├── validations.ts
│           └── validateResult.ts
│
├── frontend/
│   ├── Dockerfile                          # Multi-stage build (Node → nginx)
│   ├── nginx.conf                          # SPA + /api proxy config
│   ├── vercel.json                         # SPA fallback + /api rewrite
│   ├── package.json
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── src/
│       ├── main.tsx                        # React root + router
│       ├── index.css                       # Global styles + Tailwind
│       ├── vite-env.d.ts
│       ├── types/
│       │   └── index.ts                    # TypeScript interfaces
│       ├── context/
│       │   └── AuthContext.tsx             # Auth state + provider
│       ├── services/
│       │   ├── api.ts                      # Axios instance + interceptors
│       │   └── index.ts                    # Service barrel exports
│       ├── utils/
│       │   ├── env.ts                      # Env config
│       │   └── helpers.ts                  # formatCurrency, formatDate, etc.
│       ├── components/
│       │   ├── Layout.tsx                  # Dashboard shell (sidebar + header)
│       │   ├── Sidebar.tsx                 # Role-aware navigation
│       │   ├── Header.tsx                  # Sticky header with blur
│       │   ├── ProtectedRoute.tsx          # Auth + role guard
│       │   ├── Pagination.tsx              # Reusable page controls
│       │   ├── Modal.tsx                   # Dialog component
│       │   ├── Toast.tsx                   # Toast notifications
│       │   ├── Logo.tsx                    # Brand logo
│       │   ├── Loading.tsx                 # Loading spinner
│       │   └── landing/
│       │       ├── HeroSection.tsx         # Landing hero
│       │       └── MaskedHeading.tsx       # Animated text (GSAP)
│       └── pages/
│           ├── LandingPage.tsx
│           ├── LoginPage.tsx
│           ├── DashboardPage.tsx
│           ├── CustomerListPage.tsx
│           ├── CustomerFormPage.tsx
│           ├── CustomerDetailPage.tsx
│           ├── ProductListPage.tsx
│           ├── ProductFormPage.tsx
│           ├── ProductDetailPage.tsx
│           ├── ChallanListPage.tsx
│           ├── ChallanFormPage.tsx
│           ├── ChallanDetailPage.tsx
│           └── UsersPage.tsx
│
├── postman/
│   └── FundsRoom.postman_collection.json   # Importable API collection
│
├── .gitignore
├── .dockerignore
├── docker-compose.yml
└── README.md                               # ← This file
```

---

## 18. Known Limitations & Incomplete Parts

| # | Limitation | Impact | Potential Fix |
|---|-----------|--------|---------------|
| 1 | **No automated test suite** | Verification relies on CI build + manual testing | Add Vitest (frontend) + Jest (backend) with integration tests |
| 2 | **Render free tier cold starts** | Backend sleeps after ~15 min inactivity; first request takes ~30-60s | Upgrade to paid tier or add keep-alive ping |
| 3 | **No product image upload** | `imageUrl` column exists but upload UI/storage removed | Re-add with S3, Vercel Blob, or Cloudinary |
| 4 | **Single-tenant** | No organization/multi-tenant separation | Add `organizationId` FK to all models |
| 5 | **PDF invoice not GST-compliant** | Print-ready but not e-invoicing/filing ready | Integrate GST API + proper invoice numbering |
| 6 | **Daily challan numbering resets** | `CH-YYYYMMDD-NNN` resets each day; not globally gapless | Use database sequence or UUID-based numbering |
| 7 | **No refresh tokens / password reset** | JWTs valid until expiry; users must re-login | Add refresh token rotation + email-based password reset |
| 8 | **Stats computed on-the-fly** | Dashboard/landing queries run live; not cached | Add Redis cache or materialized views for scale |
| 9 | **Pagination returns one page** | Some list UIs only render the current page | Add "load more" or virtual scrolling for full dataset access |
| 10 | **No role self-service editing** | Users cannot change their own profile/password | Add profile edit endpoint + frontend page |

---

## 19. Quick Links

| Resource | URL |
|----------|-----|
| **Frontend (Live)** | https://funds-room-project-gamma.vercel.app |
| **Backend API (Live)** | https://funds-room-project.onrender.com |
| **Health Check** | https://funds-room-project.onrender.com/api/health |
| **GitHub Repo** | https://github.com/Rakesh452-beep/Funds-Room-Project |
| **Postman Collection** | `postman/FundsRoom.postman_collection.json` |
| **README** | `README.md` (this file) |

### Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@fundsroom.com` | `password123` |
| Sales | `sales@fundsroom.com` | `password123` |
| Warehouse | `warehouse@fundsroom.com` | `password123` |
| Accounts | `accounts@fundsroom.com` | `password123` |

---

**Built with React, Express, Prisma, PostgreSQL — hosted on Vercel + Render + Neon.**

© 2026 FundsRoom. Demo project.
