import { Card } from "@/components/ui/card";
import { StatMini } from "./StatMini";
import { convertirDivisa } from "../lib/helpers";
import { DIVISAS } from "@/types/zodType";
import type { OrdenPendiente, FacturaPendiente } from "../schemas/schemas";
import type { TasaCambio, Divisa } from "@/types/zodType";

interface SeleccionResumenProps {
  orden: OrdenPendiente | null;
  factura: FacturaPendiente | null;
  isAnticipo: boolean;
  tasaAplicada: TasaCambio | null;
  divisa: Divisa | null;
}

export function SeleccionResumen({
  orden,
  factura,
  isAnticipo,
  tasaAplicada,
  divisa,
}: SeleccionResumenProps) {
  return (
    <Card className="p-6 space-y-4">
      {orden && (
        <div className="flex gap-3">
          <StatMini label="Cliente" value={orden.clienteNombre ?? "—"} />
          <StatMini label="Monto estimado usd" value={`$${orden.totalOriginal}`} />
          {tasaAplicada && (
            <StatMini
              label={`Monto estimado ${divisa?.codigo ?? ""}`}
              value={`${divisa?.codigo + " " || "$ "}${convertirDivisa(
                orden.totalOriginal,
                tasaAplicada.tasa,
                divisa?.codigo ?? null,
                DIVISAS.USD
              ).toFixed(2)}`}
            />
          )}
        </div>
      )}

      {factura && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <StatMini label="Cliente" value={factura.clienteNombre ?? "—"} />
          <StatMini label="Saldo pendiente usd" value={`$${factura.saldoPendienteBase}`} />
          {tasaAplicada && (
            <StatMini
              label="Monto estimado"
              value={`${divisa?.codigo + " " || "$ "}${convertirDivisa(
                factura.saldoPendienteBase,
                tasaAplicada.tasa,
                divisa?.codigo ?? null,
                DIVISAS.USD
              ).toFixed(2)}`}
            />
          )}
        </div>
      )}

      {!orden && !factura && (
        <div className="text-sm text-muted-foreground text-center py-4">
          Seleccione una {isAnticipo ? "orden de despacho" : "factura pendiente"} para comenzar
        </div>
      )}
    </Card>
  );
}
