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
