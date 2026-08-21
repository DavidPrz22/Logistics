import { Card } from "@/components/ui/card";
import { PagoRow } from "./PagoRow";
import type { TransaccionPagoDetalle } from "../schemas/schemas";

interface PagoDetallesProps {
  transaccion: TransaccionPagoDetalle;
}

export function PagoDetalles({ transaccion }: PagoDetallesProps) {
  const tipoLabel = transaccion.tipoDePago.replace(/_/g, " ");
  const clienteNombre = transaccion.documento?.cliente.nombre
    ?? transaccion.orden?.cliente.nombre
    ?? "—";

  const documentoValue = transaccion.documento
    ? `Doc #${transaccion.documento.id}`
    : transaccion.orden
      ? `Orden #${transaccion.orden.id}`
      : "—";

  const cuentaDestinoValue = transaccion.cuentaDestino
    ? `${transaccion.cuentaDestino.nombre} (${transaccion.cuentaDestino.divisa.codigo})`
    : "—";

  return (
    <Card className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
      <PagoRow label="Tipo de pago" value={tipoLabel} />
      <PagoRow label="Método de pago" value={transaccion.metodoPago.descripcion} />
      <PagoRow label="Número de referencia" value={transaccion.numeroReferencia ?? "—"} />
      <PagoRow label="Cuenta destino" value={cuentaDestinoValue} />
      <PagoRow label="Cliente" value={clienteNombre} />
      <PagoRow label="Documento / Orden" value={documentoValue} />
    </Card>
  );
}
