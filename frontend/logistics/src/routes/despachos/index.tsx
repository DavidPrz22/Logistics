import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { DespachoDashboard } from "@/features/Despacho/components/DespachoList/DespachoDashboard";

const searchSchema = z.object({
  tab: z.string().catch("TODOS").default("TODOS"),
  q: z.string().catch("").default(""),
  chofer: z.string().catch("").default(""),
  desde: z.string().catch("").default(""),
  hasta: z.string().catch("").default(""),
});

export const Route = createFileRoute("/despachos/")({
  validateSearch: (search) => searchSchema.parse(search),
  component: DespachosList,
});

function DespachosList() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const setSearch = (patch: Partial<typeof search>) => navigate({ search: (prev: typeof search) => ({ ...prev, ...patch }) });
  const clearFilters = () => navigate({ search: { tab: search.tab, q: "", chofer: "", desde: "", hasta: "" } });
  const onRowClick = (ordenId: number) => navigate({ to: "/despachos/$ordenId", params: { ordenId: String(ordenId) } });

  return <DespachoDashboard search={search} onSearchChange={setSearch} onClearFilters={clearFilters} onRowClick={onRowClick} />;
}
