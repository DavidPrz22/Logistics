import { Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/page-header";
import { useEstadosFacturas, useTiposDocumento } from "@/hooks/queries/queries";
import { useFacturas } from "@/features/Facturacion/hooks/queries/queries";
import type { FacturacionSearchParams } from "../../types/types";
import { FacturacionFilters } from "./FacturacionFilters";
import { FacturacionTable } from "./FacturacionTable";
import { FacturacionPagination } from "./FacturacionPagination";

const PAGE_SIZE = 50;

interface FacturacionDashboardProps {
  search: FacturacionSearchParams;
  onSearchChange: (patch: Partial<FacturacionSearchParams>) => void;
  onClearFilters: () => void;
  onRowClick: (id: number) => void;
}

export function FacturacionDashboard({ search, onSearchChange, onClearFilters, onRowClick }: FacturacionDashboardProps) {
  const queryParams = {
    page: search.page,
    limit: PAGE_SIZE,
    ...(search.q ? { q: search.q } : {}),
    ...(search.estado ? { estado: search.estado } : {}),
    ...(search.tipo ? { tipo: search.tipo } : {}),
    ...(search.fecha ? { fecha: search.fecha } : {}),
  };

  const { data: response, isLoading, isFetching, isPlaceholderData } = useFacturas(queryParams);
  const { data: estadosFacturas = [] } = useEstadosFacturas();
  const { data: tiposDocumento = [] } = useTiposDocumento();

  const rows = response?.data ?? [];
  const meta = response?.meta ?? { total: 0, page: 1, limit: PAGE_SIZE, totalPages: 1 };
  const totalMontoPage = rows.reduce((s, d) => s + d.montoTotalBase, 0);

  return (
    <div className="p-8 space-y-6 max-w-375 mx-auto">
      <PageHeader
        eyebrow="Módulo de facturación"
        title="Documentos de deuda"
        subtitle="Facturas y notas de crédito generadas desde rutas liquidadas y ventas de mostrador."
      />

      <FacturacionFilters
        search={search}
        estadosFacturas={estadosFacturas}
        tiposDocumento={tiposDocumento}
        onSearchChange={onSearchChange}
        onClearFilters={onClearFilters}
      />

      <FacturacionTable
        facturas={rows}
        isLoading={isLoading}
        isFetching={isFetching}
        onRowClick={onRowClick}
      />

      <FacturacionPagination
        meta={meta}
        totalMontoPage={totalMontoPage}
        isFetching={isFetching}
        isPlaceholderData={isPlaceholderData}
        onPageChange={(page) => onSearchChange({ page })}
      />

      <p className="text-xs text-muted-foreground">
        ¿Buscas un pago específico? Revisa el <Link to="/pagos" className="underline hover:text-foreground">libro de transacciones</Link>.
      </p>
    </div>
  );
}
