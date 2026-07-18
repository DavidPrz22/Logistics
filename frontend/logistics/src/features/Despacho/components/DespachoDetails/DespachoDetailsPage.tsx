import { Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useERP } from "@/lib/erp-store";
import { useAlmacenes, useChoferes, useClientes } from "@/hooks/queries/queries";
import { PageHeader } from "@/components/shared/page-header";
import { EstadoBadge } from "@/components/shared/estado-badge";
import { StatCard } from "../StatCard";
import { PreparacionPanel } from "./PreparacionPanel";
import { EnRutaPanel } from "./EnRutaPanel";
import { LiquidadaPanel } from "./LiquidadaPanel";

interface DespachoDetailsPageProps {
  ordenId: string;
}

export function DespachoDetailsPage({ ordenId }: DespachoDetailsPageProps) {
  const id = Number(ordenId);
  const state = useERP((s) => s);
  const { data: clientes = [] } = useClientes();
  const { data: choferes = [] } = useChoferes();
  const { data: almacenes = [] } = useAlmacenes();
  const orden = state.ordenes.find((o) => o.id === id);
  if (!orden) throw notFound();

  const detalles = state.detalles.filter((d) => d.orden_id === id);
  const rechazos = state.rechazos.filter((r) => detalles.some((d) => d.id === r.detalle_orden_id));

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <PageHeader
        eyebrow={<span className="font-mono">{orden.numero_orden}</span> as unknown as string}
        title={clientes.find((c) => c.id === orden.cliente_id)?.nombre ?? "Cliente"}
        subtitle={`Chofer: ${choferes.find((c) => c.id === orden.chofer_id)?.nombre ?? "—"} · Tránsito: ${almacenes.find((a) => a.id === orden.almacen_transito_id)?.nombre} · Salida: ${new Date(orden.fecha_salida).toLocaleString()}`}
        actions={
          <div className="flex items-center gap-3">
            <EstadoBadge estado={orden.estado} />
            <Link to="/despachos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Lista</Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Líneas" value={detalles.length} />
        <StatCard label="Unidades" value={detalles.reduce((s, d) => s + d.cantidad_enviada, 0)} />
        <StatCard label="Facturado" value={`$${orden.total_facturado_original.toFixed(2)}`} mono />
        <StatCard label="Neto a cobrar" value={`$${orden.saldo_neto_cobrar.toFixed(2)}`} mono highlight />
      </div>

      {orden.estado === "PREPARACION" && <PreparacionPanel ordenId={id} detalles={detalles} />}
      {orden.estado === "EN_RUTA" && <EnRutaPanel ordenId={id} detalles={detalles} />}
      {orden.estado === "LIQUIDADA" && <LiquidadaPanel detalles={detalles} rechazos={rechazos} />}
    </div>
  );
}
