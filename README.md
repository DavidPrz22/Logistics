<div align="center">

# LogiERP — Logistics ERP System

**End-to-end dispatch, inventory, and multi-currency payment management for route-based logistics operations.**

![Build](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Version](https://img.shields.io/badge/version-0.1.0-orange)

</div>

---

## Table of Contents

- [About The Project](#about-the-project)
- [Tech Stack](#tech-stack)
- [Software Architecture](#software-architecture)
- [Business Logic](#business-logic)
- [Key Features](#key-features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage & Routes](#usage--routes)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## About The Project

LogiERP is a monorepo-based ERP system designed for logistics companies that manage route dispatches, warehouse inventory, and multi-currency payments. It solves the operational complexity of tracking orders from preparation through delivery, managing batch-level inventory across multiple warehouse types (main, transit, damage), and handling financial settlements in heterogeneous currencies (VES, USD, EUR, USDT) with real-time exchange rate integration.

The system provides role-based access control (Administrator, Manager, Operator), a complete audit trail via inventory Kardex, and a billing module that tracks debt documents from dispatch liquidation and point-of-sale operations.

---

## Tech Stack

### Backend

| Category | Technology |
|---|---|
| Runtime | Node.js, TypeScript (ES Modules) |
| Framework | NestJS 11 |
| ORM | Prisma 7.9 with better-sqlite3 adapter |
| Database | SQLite |
| Auth | Passport.js — JWT (access + refresh), Google OAuth 2.0, Argon2/bcrypt |
| Validation | class-validator + class-transformer |
| Config | @nestjs/config + dotenv |
| Testing | Jest, ts-jest, Supertest |
| Linting | ESLint 9 + Prettier |
| Package Manager | pnpm |

### Frontend

| Category | Technology |
|---|---|
| Framework | React 19 |
| Build Tool | Vite 8 |
| Routing | TanStack Router (file-based) |
| Server State | TanStack React Query 5 |
| Client State | Zustand 5 |
| UI Components | shadcn/ui 4 + Radix primitives |
| Styling | Tailwind CSS v4 (CSS-first config) |
| Forms | React Hook Form 7 + Zod 4 validation |
| Charts | Recharts 3.8 |
| Icons | Lucide React |
| HTTP Client | Axios |
| Compiler | React Compiler (Babel plugin) |
| Package Manager | pnpm |

---

## Software Architecture

### Monorepo Structure

```
Logistics/
├── backend/api/          # NestJS REST API
├── frontend/logistics/   # React SPA
└── AGENTS.md             # AI-assisted development config
```

### Backend Architecture

The API follows a **modular monolith** pattern. Each domain module is self-contained:

```
src/<module>/
├── <module>.module.ts       # NestJS module definition
├── <module>.controller.ts   # Route handlers with decorators
├── <module>.service.ts      # Business logic + Prisma queries
├── ODTs/                    # DTOs with class-validator
└── types/                   # Response type interfaces
```

**Registered modules:**

| Module | Prefix | Responsibility |
|---|---|---|
| `AuthModule` | `/api/auth` | JWT auth, Google OAuth, roles, refresh tokens |
| `CoreModule` | `/api/core` | Shared reference data (warehouses, drivers, clients, currencies, payment methods) |
| `DespachoModule` | `/api/despacho` | Dispatch order CRUD, state transitions, liquidation |
| `FacturacionModule` | `/api/facturacion` | Debt documents, invoicing from liquidated orders |
| `PagosModule` | `/api/pagos` | Multi-currency payment transactions, destination accounts |
| `KardexModule` | `/api/kardex` | Inventory audit trail, stock movements |
| `UsersModule` | `/api/users` | User management, role assignment |
| `PrismaModule` | — | Global Prisma client service |

**API design:** Global prefix `/api`, CORS enabled for frontend origins, cookie-based credential transport, JSON request/response format.

### Frontend Architecture

The SPA uses a **feature-sliced** architecture with TanStack Router file-based routing:

```
src/
├── features/<Feature>/     # Self-contained domain modules
│   ├── api/                # Axios fetch functions
│   ├── schemas/            # Zod validation schemas
│   ├── types/              # TypeScript interfaces
│   ├── hooks/
│   │   ├── queries/        # queryOptions factories + useQuery wrappers
│   │   └── mutations/      # useMutation with cache invalidation
│   ├── components/         # Feature-specific UI
│   ├── store/              # Zustand slices (per-feature)
│   └── lib/                # Pure utility functions
├── routes/                 # TanStack Router file-based routes
├── components/
│   ├── ui/                 # shadcn/ui primitives
│   └── shared/             # Reusable business components
├── hooks/queries/          # Shared query hooks (13 reference data endpoints)
└── api/client.ts           # Axios instance (baseURL: localhost:3000/api/)
```

**Data flow:** `Route → Feature component → Query/Mutation hook → API function → apiClient → Backend controller → Service → Prisma → SQLite`

### Database Design

SQLite via Prisma with 9 schema files defining:

- **Reference entities:** `almacen`, `cliente`, `chofer`, `producto`, `varianteProducto`, `divisa`, `metodoPago`, `motivoRechazo`
- **Operational entities:** `ordenDespacho`, `detalleOrden`, `detalleRechazoOrden`, `lote`, `movimientoInventario`
- **Financial entities:** `documentoDeuda`, `transaccionPago`, `tasaCambio`, `registroTasas`, `cuentaDestino`
- **Auth entities:** `usuario` with role-based access (`ADMINISTRADOR`, `GERENTE`, `OPERADOR`)

---

## Business Logic

### Dispatch Order Lifecycle

```
PREPARACION → EN_RUTA → LIQUIDADA
```

1. **PREPARACION** — Order created with line items (product variants + batch quantities), assigned to a transit warehouse and optionally a driver. Inventory is reserved.
2. **EN_RUTA** — Order dispatched. Driver and route assigned. Goods physically in transit warehouse.
3. **LIQUIDADA** — Order settled. Rejected items recorded with reason codes and re-entry warehouse assignment. Net billed amounts calculated.

**Order types:** `DESPACHO_RUTA` (route delivery) and `VENTA_MOSTRADOR` (counter sale).

### Financial Settlement

Upon liquidation, a `documentoDeuda` (debt document) is generated from the order. The system tracks:

- **Original totals** in base currency (VES) and foreign currency
- **Rejected amounts** from returned/damaged goods
- **Net billed amount** after deductions
- **Running balance** updated by each payment transaction

**Payment flow:**

```
documentoDeuda (PENDIENTE) → transaccionPago[] → (PAGADO_PARCIAL | PAGADO_TOTAL)
```

- Payments support multiple currencies with exchange rate snapshots at time of transaction
- Exchange rates sourced from: BCV, Binance P2P, Bybit P2P, Parallel market, Zelle
- Destination accounts: physical cash register, bank, digital wallet
- Payment types: advance (`ANTICIPO`), invoice collection (`COBRO_FACTURA`), credit balance (`SALDO_A_FAVOR`)

### Inventory Management

- **Batch-level tracking** (`lote`) with expiration dates and unique SKU per variant
- **Three warehouse types:** `PRINCIPAL` (main stock), `TRANSITO` (in-transit), `MERMA` (damaged/waste)
- **Movement types:** `ENTRADA` (inbound) and `SALIDA` (outbound), linked to order details or rejection records
- **Kardex audit trail** — every movement recorded with user, timestamp, reference, and warehouse

### Authentication & Authorization

- JWT access tokens (configurable expiration) + refresh tokens (HTTP-only cookies)
- Google OAuth 2.0 social login
- Role-based access: `ADMINISTRADOR` (full), `GERENTE` (operational), `OPERADOR` (limited)
- Route guards and decorator-based role enforcement on controllers

---

## Key Features

- **Dispatch Management** — Create, track, and liquidate route delivery and counter-sale orders with full detail line items
- **Multi-Currency Payments** — Process payments in VES, USD, EUR, or USDT with real-time exchange rate snapshots from multiple sources
- **Inventory Control** — Batch-level stock tracking across main, transit, and damage warehouses with complete Kardex audit trail
- **Rejection Handling** — Record rejected items with reason codes, automatic re-entry to designated warehouse, and merma flagging
- **Billing & Debt Tracking** — Auto-generated debt documents from liquidated orders with running balance and partial payment support
- **Role-Based Access Control** — Three-tier permission system (Admin/Manager/Operator) with JWT + Google OAuth authentication
- **Dashboard Analytics** — Operational overview with dispatch status breakdowns and financial summaries
- **Responsive UI** — Mobile-first design with shadcn/ui components, dark mode support, and accessible form patterns

---

## Getting Started

### Prerequisites

- **Node.js** >= 20.x
- **pnpm** >= 9.x
- **Git**

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/Logistics.git
cd Logistics

# ─── Backend ───
cd backend/api
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your database path, JWT secrets, and OAuth credentials

# Initialize database
pnpm prisma generate
pnpm prisma migrate dev

# ─── Frontend ───
cd ../../frontend/logistics
pnpm install
```

### Environment Variables

**Backend** (`backend/api/.env`):

```env
DATABASE_URL="file:./prisma/dev.db"
PORT=3000
CORS_ORIGIN="http://localhost:5173"

JWT_SECRET=<your-secret>
JWT_EXPIRATION_TIME=1d
REFRESH_JWT_SECRET=<your-refresh-secret>
REFRESH_JWT_EXPIRATION_TIME=7d
COOKIE_SECURE=false

GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

FRONTEND_URL=http://localhost:5174
```

---

## Usage & Routes

### Development Servers

```bash
# Backend (port 3000)
cd backend/api && pnpm run start:dev

# Frontend (port 5173/5174)
cd frontend/logistics && pnpm run dev
```

### Frontend Routes

| Path | Description |
|---|---|
| `/` | Dashboard — operational overview |
| `/login` | Authentication (credentials + Google OAuth) |
| `/register` | New user registration |
| `/despachos` | Dispatch orders list (filterable by state) |
| `/despachos/crear` | Create new dispatch order |
| `/despachos/:ordenId` | Order detail view |
| `/despachos/:ordenId/edit` | Edit dispatch order |
| `/inventario/stock` | Current stock by warehouse |
| `/inventario/kardex` | Inventory movement audit trail |
| `/kardex/:skuid` | SKU-specific movement history |
| `/facturacion` | Debt documents / invoicing list |
| `/facturacion/:documentoId` | Document detail with payment history |
| `/pagos` | Payment transactions list |
| `/pagos/crear/:pagoTipo` | Create payment (advance / collection / credit) |
| `/pagos/:pagoId` | Payment detail |

### Backend API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate user |
| `POST` | `/api/auth/refresh` | Refresh access token |
| `GET` | `/api/auth/google` | Google OAuth redirect |
| `GET` | `/api/core/*` | Reference data (almacenes, choferes, clientes, divisas, etc.) |
| `GET/POST` | `/api/despacho/ordenes-despacho` | List / create dispatch orders |
| `GET/PATCH` | `/api/despacho/ordenes-despacho/:id` | Detail / update order |
| `GET/POST` | `/api/facturacion/*` | Debt documents CRUD |
| `GET/POST` | `/api/pagos/*` | Payment transactions CRUD |
| `GET` | `/api/kardex/*` | Inventory movement queries |

### Build & Test

```bash
# Backend
cd backend/api
pnpm run build          # Production build
pnpm run test           # Unit tests (Jest)
pnpm run test:e2e       # E2E tests
pnpm run lint           # ESLint with auto-fix

# Frontend
cd frontend/logistics
pnpm run build          # TypeScript check + Vite build
pnpm run lint           # ESLint
pnpm run preview        # Preview production build
```

---

## Roadmap

- [ ] Real-time WebSocket notifications for order state changes
- [ ] PDF export for dispatch orders, invoices, and payment receipts
- [ ] Bulk order import via CSV/Excel
- [ ] Advanced reporting dashboard with Recharts (revenue, delivery times, rejection rates)
- [ ] Multi-warehouse transfer workflow with approval chain
- [ ] Automated exchange rate polling from BCV and crypto P2P APIs
- [ ] Mobile-responsive bottom navigation for field operators
- [ ] Audit log viewer for user action history
- [ ] Docker Compose setup for one-command local development
- [ ] CI/CD pipeline with GitHub Actions (lint, test, build, deploy)

---

## Contributing

1. **Fork** the repository
2. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/<feature-name>
   ```
3. **Make your changes** — follow existing code conventions:
   - Backend: single quotes, trailing commas, TypeScript strict mode
   - Frontend: feature-sliced structure, Zod schemas for validation, TanStack Query for server state
4. **Lint and test** before committing:
   ```bash
   cd backend/api && pnpm run lint && pnpm run test
   cd frontend/logistics && pnpm run lint && pnpm run build
   ```
5. **Commit** with a descriptive message following [Conventional Commits](https://www.conventionalcommits.org/)
6. **Push** to your fork and **open a Pull Request** against `main`
7. Describe your changes clearly in the PR body — include screenshots for UI changes

---

## License

Distributed under the [MIT License](LICENSE). See `LICENSE` for more information.

---

## Contact

**Maintainer:** David Perez
**Project:** [https://github.com/<your-username>/Logistics](https://github.com/<your-username>/Logistics)
**Issues:** [Report a bug or request a feature](https://github.com/<your-username>/Logistics/issues)
