import { Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HandCoins } from "lucide-react";
import { fechaCorta } from "@/features/Facturacion/lib/helpers";
import type { DocumentoDeudaDetalleType } from "@/features/Facturacion/schemas/schemas";

interface DocumentoHeaderProps {
  doc: DocumentoDeudaDetalleType;
}

export function DocumentoHeader({ doc }: DocumentoHeaderProps) {
  return (
    <PageHeader
      eyebrow={`Documento #${doc.id} · ${doc.sistemaOrigen === "RUTA_LIQUIDADA" ? "Ruta liquidada" : "Venta mostrador"}`}
      title={doc.identificadorCliente}
      subtitle={`Emitido el ${fechaCorta(doc.fechaEmision)}`}
      actions={
        <div className="flex items-center gap-3">
          {doc.estado !== "ANULADO" && doc.saldoPendienteBase > 0 && doc.tipoDocumento === "FACTURA" && (
            <Button size="sm">
              <Link to="/pagos/crear/factura" search={{ documentoId: String(doc.id) }}>
                <HandCoins className="size-4" /> Registrar cobro
              </Link>
            </Button>
          )}
          <Link to="/facturacion" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> Volver
          </Link>
        </div>
      }
    />
  );
}
