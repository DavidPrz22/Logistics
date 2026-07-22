import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useChoferes } from "@/hooks/queries/queries";
import { useOrdenesDespacho } from "../../hooks/queries/queries";
import { PageHeader } from "@/components/shared/page-header";
import type { OrdenSearchParams } from "../../types/types";
import type { ListOrdenDespacho } from "../../schemas/schema";
import { OrdenTabs } from "./OrdenTabs";
import { OrdenFilters } from "./OrdenFilters";
import { OrdenTable } from "./OrdenTable";

interface DespachoDashboardProps {
  search: OrdenSearchParams;
  onSearchChange: (patch: Partial<OrdenSearchParams>) => void;
  onClearFilters: () => void;
  onRowClick: (ordenId: number) => void;
}

export function DespachoDashboard({ search, onSearchChange, onClearFilters, onRowClick }: DespachoDashboardProps) {
  const { data: ordenes = [] } = useOrdenesDespacho() as { data: ListOrdenDespacho[] };
  const { data: choferes = [] } = useChoferes();

  const filtered = useMemo(() => {
    return ordenes.filter((o) => {
      if (search.tab !== "TODOS" && o.estado !== search.tab) return false;
      if (search.chofer && o.choferNombre !== search.chofer) return false;
      if (search.q) {
        const q = search.q.toLowerCase();
        if (!o.clienteNombre.toLowerCase().includes(q) && !o.numeroOrden.toLowerCase().includes(q)) return false;
      }
      if (search.desde && o.FechaSalida < search.desde) return false;
      if (search.hasta && o.FechaSalida > `${search.hasta}T23:59:59Z`) return false;
      return true;
    });
  }, [ordenes, search]);

  const counts: Record<string, number> = {
    TODOS: ordenes.length,
    PREPARACION: ordenes.filter((o) => o.estado === "PREPARACION").length,
    EN_RUTA: ordenes.filter((o) => o.estado === "EN_RUTA").length,
    LIQUIDADA: ordenes.filter((o) => o.estado === "LIQUIDADA").length,
  };

  return (
    <div className="p-8 space-y-6 max-w-350 mx-auto">
      <PageHeader
        eyebrow="Módulo de tráfico"
        title="Órdenes y despachos"
        subtitle="Todo lo que sale, está rodando o vuelve. Filtros persistidos en la URL — compártela con otro monitor."
        actions={
          <Link to="/despachos/crear" className="inline-flex items-center gap-2 rounded-md bg-accent text-accent-foreground px-4 py-2 text-sm font-semibold shadow-sm hover:brightness-95">
            <Plus className="size-4" /> Nueva orden
          </Link>
        }
      />

      <OrdenTabs search={search} counts={counts} onTabChange={(tab) => onSearchChange({ tab })} />

      <OrdenFilters search={search} choferes={choferes} onSearchChange={onSearchChange} onClearFilters={onClearFilters} />

      <OrdenTable ordenes={filtered} onRowClick={onRowClick} />
    </div>
  );
}
