# 📦 Kardex Search Feature Plan

## 🎯 Objective
Implement an end-to-end asynchronous, fuzzy search system for products and SKU variants in the Kardex module, including TanStack Query caching, debounced input, Zustand-backed persistent recent searches, keyboard navigation, and robust error/loading handling.

---

## 🖥️ FRONTEND

### 1. Data Layer & API Integration
- [ ] **API Client** (`features/Kardex/api/api.ts`):
  - Add `searchKardex(query: string, signal?: AbortSignal): Promise<KardexSearch[]>` using `ky` / `axios` / `fetch`.
  - Pass the AbortSignal to cancel pending requests on rapid typing.
- [ ] **Zod Validation** (`features/Kardex/schemas/schemas.ts`):
  - Validate backend payload using `kardexSearchSchema.array()`.
- [ ] **TanStack Query Options** (`features/Kardex/hooks/queries/queryoptions.ts`):
  - Define `kardexSearchQueryOptions(query: string)`:
    - `queryKey: ['kardex', 'search', query]`
    - `enabled: query.trim().length >= 3`
    - `staleTime: 1000 * 60 * 2` (2 minutes)
    - `placeholderData: (prev) => prev` (smoother transitions between keystrokes)
- [ ] **Custom Hook** (`features/Kardex/hooks/queries/queries.ts`):
  - Expose `useKardexSearch(debouncedQuery: string)`.

### 2. State & Recent Searches Store
- [ ] **Zustand Store** (`features/Kardex/store/zustandstore.ts`):
  - Store structure:
    ```typescript
    interface RecentSearchItem {
      id: number;
      sku: string;
      nombre: string;
      productName: string;
      timestamp: number;
    }
    ```
  - Implement `persist` middleware with `localStorage` (key: `kardex-recent-searches`).
  - Actions:
    - `addRecentSearch(item: Omit<RecentSearchItem, 'timestamp'>)`: Deduplicate (by SKU/ID), move to index `0`, and cap at top 5–10 items.
    - `removeRecentSearch(sku: string)`: Allow removing single items.
    - `clearRecentSearches()`: Clear history.

### 3. Search UI Component (`features/Kardex/components/KardexSearch.tsx`)
- [ ] **State & Debouncing**:
  - Integrate a `useDebounce(searchTerm, 300)` hook (300ms delay).
  - Manage dropdown open/close states (open on input focus / click, close on outside click or ESC).
- [ ] **UX / Interaction States**:
  - **Recent Searches State**: Display recent searches when input is focused and query is empty (< 3 chars).
  - **Loading State**: Show subtle spinner / skeleton inside dropdown while fetching.
  - **Empty Results**: Friendly empty state (`Sin resultados para "${query}"`).
  - **Error State**: Non-blocking inline error alert with retry button.
  - **Exact Match Badge**: Highlight exact SKU matches (`SKU exacto`).
- [ ] **Keyboard & Accessibility (a11y)**:
  - Global shortcut listener (`Ctrl + K` / `Cmd + K`) to focus the search input.
  - Keyboard navigation within the dropdown (Arrow Up/Down, Enter to select, Escape to close).
- [ ] **Navigation**:
  - On selecting a variant, save to recent searches and navigate to `/kardex/$skuId` (e.g. `navigate({ to: '/kardex/$skuId', params: { skuId: variant.sku } })`).

---

## ⚙️ BACKEND

### 1. API Endpoint Specification
- [ ] **Route**: `GET /api/kardex/search?q={query}`
- [ ] **Validation & Constraints**:
  - Validate `q`: string, trimmed, min length 1 (recommended trigger at ≥ 3 chars from client).
  - Cap results with `LIMIT 15` or `LIMIT 20` to guarantee high responsiveness.

### 2. Query & Matching Logic (Fuzzy / Multi-field)
- [ ] **Search Criteria**:
  - Case-insensitive search across:
    1. Product Name (`producto.nombre`)
    2. Variant Name (`variante.nombre`)
    3. Exact & Prefix SKU (`variante.sku`)
- [ ] **Fuzzy / Trigram Indexing**:
  - Use PostgreSQL `pg_trgm` (e.g., `similarity()`, `ILIKE '%query%'`, or `word_similarity()`) or full-text search indexing on `(sku, nombre)`.
  - Prioritize ranking: Exact SKU > SKU prefix > Exact Product/Variant Name > Fuzzy Matches.

### 3. Response Structure & Serialization
- [ ] Group variants by product to match `kardexSearchSchema`:
  ```json
  [
    {
      "nombre": "Mayonesa Kraft",
      "variantes": [
        { "id": 101, "sku": "MAYO-350-REG", "nombre": "Mayonesa 350g Regular" },
        { "id": 102, "sku": "MAYO-500-LGT", "nombre": "Mayonesa 500g Light" }
      ]
    }
  ]
