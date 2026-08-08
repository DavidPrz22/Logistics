import { createFileRoute } from "@tanstack/react-router";
import { useFacturaDetalle } from "@/features/Facturacion/hooks/queries/queries";
import { DocumentoDetalleView } from "@/features/Facturacion/components/DocumentoDetalleView";

export const Route = createFileRoute("/facturacion/$documentoId/")({
  head: () => ({
    meta: [
      { title: "Detalle de documento — Facturación | Tráfico ERP" },
      { name: "description", content: "Detalle del documento de deuda: montos, saldo pendiente y pagos aplicados." },
      { property: "og:title", content: "Detalle de documento de deuda" },
      { property: "og:description", content: "Montos, saldo pendiente y transacciones de pago vinculadas." },
    ],
  }),
  component: DocumentoDetalle,
});

function DocumentoDetalle() {
  const { documentoId } = Route.useParams();
  const { data: doc } = useFacturaDetalle(Number(documentoId));

  if (!doc) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Cargando documento...
      </div>
    );
  }

  return <DocumentoDetalleView doc={doc} />;
}
