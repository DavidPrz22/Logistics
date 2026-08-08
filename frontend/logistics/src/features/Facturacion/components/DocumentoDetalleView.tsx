import { DocumentoHeader } from "./DocumentoHeader";
import { DocumentoBadges } from "./DocumentoBadges";
import { DocumentoStats } from "./DocumentoStats";
import { PagosTable } from "./PagosTable";
import { money } from "@/features/Facturacion/lib/helpers";
import type { DocumentoDeudaDetalleType } from "@/features/Facturacion/schemas/schemas";

interface DocumentoDetalleViewProps {
  doc: DocumentoDeudaDetalleType;
}

export function DocumentoDetalleView({ doc }: DocumentoDetalleViewProps) {
  return (
    <div className="p-8 space-y-6 max-w-325 mx-auto">
      <DocumentoHeader doc={doc} />
      <DocumentoBadges
        tipoDocumento={doc.tipoDocumento}
        estado={doc.estado}
        ordenId={doc.ordenId}
        numeroOrden={doc.numeroOrden}
      />
      <DocumentoStats
        montoTotalBase={money(doc.montoTotalBase)}
        totalAbonado={money(doc.totalAbonado)}
        saldoPendienteBase={money(doc.saldoPendienteBase)}
      />
      <PagosTable transacciones={doc.transaccionesPago} />
    </div>
  );
}
