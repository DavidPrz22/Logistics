# AGENTS.md

## Project Overview

Monorepo for a logistics ERP system with dispatch, inventory, and payment modules. Spanish-language domain.

## Structure

```
backend/api/     # NestJS + Prisma (SQLite)
frontend/logistics/  # React + Vite + TanStack Router + shadcn/ui
```

## Commands

### Backend (backend/api/)

```bash
pnpm install              # Install dependencies
pnpm run start:dev        # Dev server with watch
pnpm run build           # Production build
pnpm run test            # Unit tests (Jest)
pnpm run test:e2e        # E2E tests
pnpm run lint            # ESLint with auto-fix
pnpm run format          # Prettier formatting
```

### Frontend (frontend/logistics/)

```bash
pnpm install             # Install dependencies
pnpm run dev             # Vite dev server
pnpm run build           # TypeScript check + Vite build
pnpm run lint            # ESLint
pnpm run preview         # Preview production build
```

## Database

- **Backend**: SQLite via Prisma with better-sqlite3 adapter
- **Schema location**: `backend/api/prisma/schema/` (split across multiple .prisma files)
- **Database file**: `backend/api/prisma/dev.db`
- **Migrations**: `backend/api/prisma/migrations/`

**Prisma commands** (run from `backend/api/`):
```bash
pnpm prisma generate     # Regenerate client after schema changes
pnpm prisma migrate dev  # Create and apply migrations
pnpm prisma studio       # Open database GUI
```

## Architecture Notes

### Backend

- **Modules**: `core/` (shared endpoints), `prisma/` (database service)
- **Prisma service**: Extends PrismaClient with better-sqlite3 adapter
- **ES modules**: Package uses `"type": "module"`
- **CORS**: Configured in `main.ts`, defaults to `*` origin
- **Port**: 3000 (configurable via PORT env var)

### Frontend

- **Routing**: TanStack Router with file-based routing in `src/routes/`
- **Route tree**: Auto-generated at `src/routeTree.gen.ts` (do not edit manually)
- **State**: Zustand store at `src/lib/erp-store.ts` with seed data
- **API client**: Axios instance at `src/api/client.ts` pointing to `http://localhost:8000/api/`
- **Components**: shadcn/ui at `src/components/ui/`, shared components at `src/components/shared/`
- **Features**: Domain logic grouped in `src/features/` (Dashboard, Despacho, Movimientos, Stock)
- **Path alias**: `@/` maps to `src/`

## Key Conventions

### Backend

- **Prettier**: Single quotes, trailing commas everywhere
- **ESLint**: TypeScript with type-checking, Prettier integration
- **Testing**: Jest with ts-jest, spec files alongside source (`*.spec.ts`)

### Frontend

- **TypeScript**: Strict mode, path aliases enabled
- **React Compiler**: Enabled via Babel plugin (impacts build performance)
- **Tailwind CSS**: v4 with CSS-first configuration in `src/index.css`
- **shadcn/ui**: base-nova style, neutral base color, CSS variables enabled
- **TanStack Query**: Used for server state, query options at `src/hooks/queries/queryOptions.ts`
- **Zod**: Used for validation schemas

## Environment Variables

### Backend (backend/api/.env)

```bash
DATABASE_URL="file:./prisma/dev.db"
PORT=3000                    # Optional
CORS_ORIGIN="*"              # Optional
```

### Frontend

No `.env` file present. API URL defaults to `http://localhost:8000/api/` in `src/api/client.ts`.

Set via Vite env vars if needed:
```bash
VITE_API_URL=http://localhost:3000/api/
```

## Domain Models (Spanish)

Core entities: `ordenDespacho` (dispatch orders), `detalleOrden` (order details), `lote` (inventory batches), `varianteProducto` (product variants with SKU), `almacen` (warehouses: PRINCIPAL/TRANSITO/MERMA), `cliente`, `chofer`, `movimientoInventario` (inventory movements), `documentoDeuda` (debts), `transaccionPago` (payments), `divisa` (currencies), `tasaCambio` (exchange rates).

Order states: `PREPARACION` → `EN_RUTA` → `LIQUIDADA`

## Common Tasks

### Add a new API endpoint

1. Add Prisma model in `backend/api/prisma/schema/`
2. Run `pnpm prisma generate` in `backend/api/`
3. Add service method in appropriate module (e.g., `core.service.ts`)
4. Add controller method in corresponding controller
5. Define Zod schema in `frontend/logistics/src/types/zodType.ts`
6. Add API call in `frontend/logistics/src/api/client.ts`
7. Create TanStack Query hooks in `frontend/logistics/src/hooks/queries/`

### Add a new frontend route

1. Create file in `frontend/logistics/src/routes/` following TanStack Router conventions
2. Route tree auto-generates on dev server restart
3. For dynamic routes, use `$paramName.tsx` syntax

### Update database schema

1. Edit `.prisma` files in `backend/api/prisma/schema/`
2. Run `pnpm prisma migrate dev --name migration_name` from `backend/api/`
3. Run `pnpm prisma generate` to update client

## Implementation Patterns

### Backend Module Pattern

Each domain module (`despacho`, `pagos`, `core`) follows this structure:

```
src/<module>/
├── <module>.module.ts       # Imports PrismaModule, registers controller + service
├── <module>.controller.ts   # @Controller('<prefix>') with route handlers
├── <module>.service.ts      # @Injectable(), injects PrismaService, business logic
├── ODTs/
│   └── <module>.odts.ts     # DTOs with class-validator + class-transformer
└── types/
    └── <module>.types.ts    # Plain TS interfaces for response shapes
```

**Steps to add a new backend module:**
1. Create module folder with the structure above
2. Define Prisma model in `prisma/schema/`
3. Run `pnpm prisma generate`
4. Create ODTs (DTOs) with validation decorators
5. Implement service methods with Prisma queries
6. Add controller endpoints
7. Register module in `app.module.ts` imports array

### Frontend Feature Structure

Each feature (`Despacho`, `Dashboard`, `Stock`, `Movimientos`) is self-contained:

```
src/features/<Feature>/
├── api/
│   └── api.ts               # Async functions using shared apiClient
├── schemas/
│   └── schema.ts            # Zod schemas + z.infer types
├── types/
│   └── types.ts             # Plain TS interfaces for UI state
├── hooks/
│   ├── queries/
│   │   ├── queryOptions.ts  # queryOptions() factories
│   │   └── queries.ts       # useQuery() wrappers
│   └── mutations/
│       └── mutations.ts     # useMutation() with invalidateQueries
├── components/              # Feature-specific UI, grouped by sub-view
├── store/
│   └── store.ts             # Zustand slice (if needed)
└── lib/
    └── helpers.ts           # Pure utility functions
```

**Steps to add a new feature:**
1. Create feature folder with structure above
2. Define Zod schemas in `schemas/schema.ts`
3. Create API functions in `api/api.ts`
4. Build queryOptions and query hooks
5. Build mutation hooks with cache invalidation
6. Create components that consume hooks

### Shared/Global Layer

Cross-feature resources live in `src/`:

- `api/client.ts` → Axios instance (base URL, headers, credentials)
- `api/api.ts` → Shared fetch functions for core endpoints (almacenes, choferes, clientes, etc.)
- `hooks/queries/queryOptions.ts` → Shared queryOptions factories
- `hooks/queries/queries.ts` → Shared useQuery wrappers
- `types/zodType.ts` → Shared Zod schemas for common entities
- `components/ui/` → shadcn/ui primitives (button, dialog, table, etc.)
- `components/shared/` → Reusable business components (combobox, date-picker, badges)
- `lib/erp-store.ts` → Global Zustand store with seed data

### Route Conventions

TanStack Router uses file-based routing in `src/routes/`:

```
routes/
├── __root.tsx               # Root layout with sidebar, QueryClientProvider
├── index.tsx                # Home route (/)
├── <module>/
│   ├── route.tsx            # Layout wrapper with <Outlet />
│   ├── index.tsx            # List/default view (uses validateSearch for URL params)
│   ├── crear.tsx            # Create view
│   └── $paramName/
│       ├── index.tsx        # Detail view (dynamic route)
│       └── edit.tsx         # Edit view
```

**Key patterns:**
- Routes are thin — delegate rendering to feature components
- Use `validateSearch` with Zod schemas for URL search params
- Dynamic routes use `$paramName` syntax
- Layout routes use `<Outlet />` to render child routes
- Route tree auto-generates at `src/routeTree.gen.ts` on dev server restart

### Data Flow

**API call chain:**
```
Route → Feature component → Query/Mutation hook → API function → apiClient → Backend controller → Service → Prisma
```

**Example flow (fetching dispatch orders):**
1. Route `/despachos` renders `DespachoDashboard` component
2. Component calls `useOrdenesDespacho()` hook
3. Hook uses `useQuery()` with `ordenesDespachoQueryOptions`
4. QueryOptions calls `fetchOrdenesDespacho()` API function
5. API function uses `apiClient.get('despacho/ordenes-despacho')`
6. Backend `DespachoController.getAllDespachos()` handles request
7. `DespachoService.getAllDespachos()` queries Prisma
8. Response flows back through the chain

**Cache invalidation pattern:**
- Mutations call `queryClient.invalidateQueries({ queryKey: [...] })` in `onSuccess`
- Use specific query keys (e.g., `['ordenDespachoDetail', id]`) for targeted invalidation
- Use general query keys (e.g., `['ordenesDespacho']`) to refresh lists
