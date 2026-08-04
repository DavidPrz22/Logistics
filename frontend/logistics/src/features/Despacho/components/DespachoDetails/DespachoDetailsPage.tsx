import { Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Edit } from "lucide-react";
import { useOrdenDespachoDetail } from "../../hooks/queries/queries";
import { useUpdateOrdenEstadoMutation } from "../../hooks/mutations/mutations";
import { PageHeader } from "@/components/shared/page-header";
import { EstadoBadge } from "@/components/shared/estado-badge";
import { StatCard } from "../StatCard";
import { PreparacionPanel } from "./PreparacionPanel";
import { EnRutaPanel } from "./EnRutaPanel";
import { LiquidadaPanel } from "./LiquidadaPanel";
import { AnticiposCard } from "./AnticiposCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";

interface DespachoDetailsPageProps {
  ordenId: string;
}

export function DespachoDetailsPage({ ordenId }: DespachoDetailsPageProps) {
  const id = Number(ordenId);
  const { data: orden, isLoading } = useOrdenDespachoDetail(id);
  const { mutateAsync: updateEstadoMutation } = useUpdateOrdenEstadoMutation();

  const navigate = useNavigate()
  if (isLoading) return <div className="p-8">Cargando...</div>;
  if (!orden) throw notFound();

  const detalles = orden.detalles;
  const rechazos = detalles.flatMap((d) => d.rechazos);
  const isMostrador = orden.tipoOrden === 'VENTA_MOSTRADOR';

  const handleUpdateEstado = async () => {
    await updateEstadoMutation(id);
  };


  const handleUpdateEntireForm = () => {
      navigate({
      to: '/despachos/$ordenId/edit/',
      params: {
        ordenId: String(id)
      }
    })

  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <PageHeader
        eyebrow={<span className="font-mono">{orden.numeroOrden}</span> as unknown as string}
        title={orden.clienteNombre}
        subtitle={`${isMostrador ? '' : `Chofer: ${orden.choferNombre ?? '—'} · `}Tránsito: ${orden.almacenTransitoNombre} · Salida: ${new Date(orden.fechaSalida).toLocaleString()}`}
        actions={
          <div className="flex items-center gap-3">
            {
              orden.estado === "PREPARACION" && (
              <Button className="cursor-pointer" variant="outline" onClick={() => handleUpdateEntireForm()}>
                <Edit className="size-4" />
                Editar
              </Button>
            )}
            <Badge variant={isMostrador ? "default" : "secondary"} className="text-xs">
              {isMostrador ? "Mostrador" : "Ruta"}
            </Badge>
            <EstadoBadge estado={orden.estado} />
            <Link to="/despachos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Lista</Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard label="Líneas" value={detalles.length} />
        <StatCard label="Unidades" value={detalles.reduce((s, d) => s + d.cantidadEnviada, 0)} />
        <StatCard label="Facturado" value={`$${orden.totalOriginal.toFixed(2)}`} mono />
        <StatCard label="Anticipado" value={`$${orden.totalAbonado.toFixed(2)}`} mono />
        <StatCard label="Neto a cobrar" value={`$${orden.saldoNetoCobrar.toFixed(2)}`} mono highlight />
      </div>

      {orden.anticipos.length > 0 && <AnticiposCard anticipos={orden.anticipos} />}

      {orden.estado === "PREPARACION" && <PreparacionPanel ordenId={id} detalles={detalles} tipoOrden={orden.tipoOrden} onDispatch={handleUpdateEstado} />}
      {orden.estado === "EN_RUTA" && !isMostrador && <EnRutaPanel ordenId={id} detalles={detalles} />}
      {orden.estado === "LIQUIDADA" && <LiquidadaPanel detalles={detalles} rechazos={rechazos} documentoDeuda={orden.documentoDeuda} />}
    </div>
  );

}
