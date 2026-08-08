import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { FacturacionDashboard } from "@/features/Facturacion/components/FacturacionList/FacturacionDashboard";

const searchSchema = z.object({
  q: z.string().default(""),
  estado: z.string().default(""),
  tipo: z.string().default(""),
  fecha: z.string().default(""),
  page: z.number().default(1),
});

export const Route = createFileRoute("/facturacion/")({
  validateSearch: (search) => searchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Facturación — Documentos de deuda | Tráfico ERP" },
      { name: "description", content: "Listado de facturas y notas de crédito con saldo pendiente, estado de cobro y pagos aplicados." },
      { property: "og:title", content: "Facturación — Documentos de deuda" },
      { property: "og:description", content: "Consulta facturas, notas de crédito y saldos pendientes por cliente." },
    ],
  }),
  component: FacturacionList,
});

function FacturacionList() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const setSearch = (patch: Partial<typeof search>) =>
    navigate({ search: (prev: typeof search) => ({ ...prev, page: 1, ...patch }) });

  const clearFilters = () =>
    navigate({ search: { q: "", estado: "", tipo: "", fecha: "", page: 1 } });

  const onRowClick = (id: number) =>
    navigate({ to: "/facturacion/$documentoId", params: { documentoId: String(id) } });

  return (
    <FacturacionDashboard
      search={search}
      onSearchChange={setSearch}
      onClearFilters={clearFilters}
      onRowClick={onRowClick}
    />
  );
}
