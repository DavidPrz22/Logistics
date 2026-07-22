import { Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useOrdenDespachoDetail } from "@/hooks/queries/queries";
import { useUpdateOrdenEstadoMutation } from "../../hooks/mutations/mutations";
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
  const { data: orden, isLoading } = useOrdenDespachoDetail(id);
  const { mutateAsync: updateEstadoMutation} = useUpdateOrdenEstadoMutation();

  if (isLoading) return <div className="p-8">Cargando...</div>;
  if (!orden) throw notFound();

  const detalles = orden.detalles;
  const rechazos = detalles.flatMap((d) => d.rechazos);

  const handleUpdateEstado = async () => {
    await updateEstadoMutation(id);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <PageHeader
        eyebrow={<span className="font-mono">{orden.numeroOrden}</span> as unknown as string}
        title={orden.clienteNombre}
        subtitle={`Chofer: ${orden.choferNombre ?? "—"} · Tránsito: ${orden.almacenTransitoNombre} · Salida: ${new Date(orden.fechaSalida).toLocaleString()}`}
        actions={
          <div className="flex items-center gap-3">
            <EstadoBadge estado={orden.estado} />
            <Link to="/despachos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Lista</Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Líneas" value={detalles.length} />
        <StatCard label="Unidades" value={detalles.reduce((s, d) => s + d.cantidadEnviada, 0)} />
        <StatCard label="Facturado" value={`$${orden.totalFacturadoOriginal.toFixed(2)}`} mono />
        <StatCard label="Neto a cobrar" value={`$${orden.saldoNetoCobrar.toFixed(2)}`} mono highlight />
      </div>

      {orden.estado === "PREPARACION" && <PreparacionPanel ordenId={id} detalles={detalles} onDispatch={handleUpdateEstado} />}
      {orden.estado === "EN_RUTA" && <EnRutaPanel ordenId={id} detalles={detalles} />}
      {orden.estado === "LIQUIDADA" && <LiquidadaPanel detalles={detalles} rechazos={rechazos} />}
    </div>
  );
}
