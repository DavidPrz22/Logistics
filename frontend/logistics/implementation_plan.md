# Implementation Plan: Unified Balanced Logistics & Treasury Dashboard

Build a comprehensive, modern, and reactive **Unified Balanced Dashboard** for the Logistics ERP on the root route (`/`). This dashboard combines real-time warehouse/fleet operational metrics with multi-currency treasury and billing insights (USD & VES).

## User Review Required

> [!IMPORTANT]
> The dashboard will consume existing TanStack Query hooks (`useOrdenesDespacho`, `useFacturas`, `useTransaccionesPagos`, `useTasasCambioByRegistro`, etc.) to aggregate live operational, billing, and payment data. No backend schema modifications or breaking changes are required.

## Architecture & Component Decomposition

Following the project's **Feature-Based Architecture**:
- **Thin Route Shell:** [src/routes/index.tsx](file:///home/davidprz/projects/Logistics/frontend/logistics/src/routes/index.tsx) will act purely as the router entry point and page header.
- **Feature Layer:** All dashboard logic, stats computations, sub-components, and charts will reside in `src/features/Dashboard/`.

```
src/
├── routes/
│   └── index.tsx                         # Thin Shell Route
└── features/
    └── Dashboard/
        ├── components/
        │   ├── DashboardMain.tsx         # Main Orchestrator View
        │   ├── DashboardStatsCards.tsx   # 4 Responsive Metric KPI Cards
        │   ├── ActiveRoutesSection.tsx   # Live Trucks / Drivers in Transit
        │   ├── PaymentsBreakdownChart.tsx# Recharts Chart for Payment Methods & Currencies
        │   ├── RecentOrdersTable.tsx     # Latest Dispatch Orders with Status Badges
        │   └── OperationalAlerts.tsx     # Alerts (Pending Liquidations, Unpaid Invoices, Rate Spread)
        └── lib/
            └── useDashboardMetrics.ts    # React hook aggregating and computing live KPIs
```

---

## Proposed Changes

### Dashboard Feature Logic & Metrics

#### [NEW] [useDashboardMetrics.ts](file:///home/davidprz/projects/Logistics/frontend/logistics/src/features/Dashboard/lib/useDashboardMetrics.ts)
* Custom reactive hook combining data from `useOrdenesDespacho`, `useFacturas`, `useTransaccionesPagos`, and `useRegistroTasas`.
* Computes:
  * **Operational metrics:** Count of orders in `PREPARACION`, `EN_RUTA`, `LIQUIDADA`, and active driver count.
  * **Billing metrics:** Total invoiced amount in USD and reference VES, pending debt balance, count of pending invoices.
  * **Treasury metrics:** Total approved payments received in USD, breakdown of payments by method (`metodoPago`) for charts.
  * **Active routes:** List of orders currently `EN_RUTA` with driver and transit warehouse info.
  * **Recent orders:** Latest 6-8 orders sorted chronologically with client, driver, total, and status.

---

### UI Components

#### [NEW] [DashboardStatsCards.tsx](file:///home/davidprz/projects/Logistics/frontend/logistics/src/features/Dashboard/components/DashboardStatsCards.tsx)
* Displays 4 high-impact metric cards:
  1. **🚚 Operaciones Hoy:** Active orders (`EN_RUTA`), prepared orders, and settled orders count.
  2. **📑 Facturación Total:** Sum of issued invoices in USD and snapshot in VES.
  3. **💵 Recaudación / Cobrado:** Total incoming payments approved, with transaction count.
  4. **⏳ Cuentas por Cobrar:** Remaining debt balance and number of pending documents.

#### [NEW] [ActiveRoutesSection.tsx](file:///home/davidprz/projects/Logistics/frontend/logistics/src/features/Dashboard/components/ActiveRoutesSection.tsx)
* Shows drivers currently on route (`EN_RUTA`).
* Displays driver name, truck/transit warehouse, destination client, total order value, and quick links to order details and liquidation.

#### [NEW] [PaymentsBreakdownChart.tsx](file:///home/davidprz/projects/Logistics/frontend/logistics/src/features/Dashboard/components/PaymentsBreakdownChart.tsx)
* Uses `recharts` (Pie/Donut and Bar) styled with Tailwind CSS variables (`--color-chart-1` through `--color-chart-5`).
* Shows distribution of received payments by method (`Efectivo USD`, `Pago Móvil`, `Zelle`, `Binance`, `Transferencia`).

#### [NEW] [RecentOrdersTable.tsx](file:///home/davidprz/projects/Logistics/frontend/logistics/src/features/Dashboard/components/RecentOrdersTable.tsx)
* Clean table presenting recent orders with:
  * Order Number & Type (`DESPACHO_RUTA` / `VENTA_MOSTRADOR`)
  * Client & Driver
  * Date
  * Status Badge (`EstadoBadge`)
  * Total in USD ($) and Net Amount
  * Link to order detail `/despachos/$ordenId`

#### [NEW] [OperationalAlerts.tsx](file:///home/davidprz/projects/Logistics/frontend/logistics/src/features/Dashboard/components/OperationalAlerts.tsx)
* Quick operational notices:
  * Route liquidations needing attention
  * Outstanding debt warnings
  * Current exchange rate summary (BCV / Paralelo) with quick update button

#### [NEW] [DashboardMain.tsx](file:///home/davidprz/projects/Logistics/frontend/logistics/src/features/Dashboard/components/DashboardMain.tsx)
* Layout orchestrator assembling the 4 Stats Cards, the 2-column operational/treasury grid, the active routes panel, recent orders, and payment charts.

---

### Route Integration

#### [MODIFY] [index.tsx](file:///home/davidprz/projects/Logistics/frontend/logistics/src/routes/index.tsx)
* Strip raw inline markup and replace with thin shell rendering the header (title, date, `ModalTasasCambio`, `GenerarTasasButton`, `+ Nueva orden`) and mounting `<DashboardMain />`.

---

## Verification Plan

### Automated Verification
* Run TypeScript verification to ensure strict type compliance across all components:
  ```bash
  cd frontend/logistics && pnpm run build --noEmit
  ```

### Visual & Interactive Verification
* Verify that the dashboard loads smoothly on `/`.
* Verify KPI numbers calculate accurately from query data.
* Verify responsiveness on desktop, tablet, and mobile layouts.
* Verify links to `/despachos/$ordenId`, `/despachos/crear`, and `/facturas` work correctly.
