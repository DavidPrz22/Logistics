import { Link } from "@tanstack/react-router";
import { PagoEstadoBadge } from "@/components/shared/factura-badges";
import { FileText, Truck, ArrowUpRight } from "lucide-react";
import { PagoAnularDialog } from "./PagoAnularDialog";
import type { TransaccionPagoDetalle } from "../schemas/schemas";

interface PagoRelatedLinksProps {
  transaccion: TransaccionPagoDetalle;
  onAnular: (motivo: string) => void;
  isPending: boolean;
}

export function PagoRelatedLinks({ transaccion, onAnular, isPending }: PagoRelatedLinksProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <PagoEstadoBadge estado={transaccion.estado as "APROBADO" | "ANULADO" | "RECHAZADO"} />
      {transaccion.documento && (
        <Link
          to="/facturacion/$documentoId"
          params={{ documentoId: String(transaccion.documento.id) }}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-mono font-semibold hover:bg-muted"
        >
          <FileText className="size-3.5" /> Doc #{transaccion.documento.id} <ArrowUpRight className="size-3" />
        </Link>
      )}
      {transaccion.orden && (
        <Link
          to="/despachos/$ordenId"
          params={{ ordenId: String(transaccion.orden.id) }}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-mono font-semibold hover:bg-muted"
        >
          <Truck className="size-3.5" /> Orden #{transaccion.orden.id} <ArrowUpRight className="size-3" />
        </Link>
      )}
      {transaccion.estado === "APROBADO" && (
        <PagoAnularDialog
          transaccion={transaccion}
          onConfirm={onAnular}
          isPending={isPending}
        />
      )}
    </div>
  );
}
