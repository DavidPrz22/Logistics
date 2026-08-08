import { Link } from "@tanstack/react-router";
import { DocEstadoBadge, TipoDocBadge } from "@/components/shared/factura-badges";
import { ArrowUpRight, Truck } from "lucide-react";
import type { DocumentoDeudaDetalleType } from "@/features/Facturacion/schemas/schemas";

interface DocumentoBadgesProps {
  tipoDocumento: DocumentoDeudaDetalleType["tipoDocumento"];
  estado: DocumentoDeudaDetalleType["estado"];
  ordenId: number;
  numeroOrden: string;
}

export function DocumentoBadges({ tipoDocumento, estado, ordenId, numeroOrden }: DocumentoBadgesProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <TipoDocBadge tipo={tipoDocumento} />
      <DocEstadoBadge estado={estado} />
      {ordenId ? (
        <Link
          to="/despachos/$ordenId"
          params={{ ordenId: String(ordenId) }}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-mono font-semibold hover:bg-muted"
        >
          <Truck className="size-3.5" /> {numeroOrden} <ArrowUpRight className="size-3" />
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-mono text-muted-foreground">
          {numeroOrden}
        </span>
      )}
    </div>
  );
}
