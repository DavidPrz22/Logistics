import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/shared/page-header";
import { BackToPagosLink } from "@/features/Pagos/components/PagoPageActions";
import { useTransaccionById } from "@/features/Pagos/hooks/queries/queries";
import { useAnularTransaccionMutation } from "@/features/Pagos/hooks/mutations/mutations";
import { money, fechaCorta } from "@/features/Pagos/lib/helpers";

import { PagoLoading } from "@/features/Pagos/components/PagoLoading";
import { PagoError } from "@/features/Pagos/components/PagoError";
import { PagoRelatedLinks } from "@/features/Pagos/components/PagoRelatedLinks";
import { PagoMotivoAnulacion } from "@/features/Pagos/components/PagoMotivoAnulacion";
import { PagoStat } from "@/features/Pagos/components/PagoStat";
import { PagoConversionDetail } from "@/features/Pagos/components/PagoConversionDetail";
import { PagoDetalles } from "@/features/Pagos/components/PagoDetalles";
import { PagoAuditoria } from "@/features/Pagos/components/PagoAuditoria";

export const Route = createFileRoute("/pagos/$pagoId/")({
  head: () => ({
    meta: [
      { title: "Detalle de transacción de pago — Tráfico ERP" },
      { name: "description", content: "Detalle de la transacción: monto origen, tasa aplicada, equivalente en moneda base, cuenta destino y auditoría." },
      { property: "og:title", content: "Detalle de transacción de pago" },
      { property: "og:description", content: "Monto, divisa, tasa aplicada, cuenta destino y auditoría de la transacción." },
    ],
  }),
  component: PagoDetalle,
});

function PagoDetalle() {
  const { pagoId } = Route.useParams();
  const id = Number(pagoId);
  const { data: transaccion, isLoading, error } = useTransaccionById(id);
  const anularMutation = useAnularTransaccionMutation(id);

  if (isLoading) return <PagoLoading />;
  if (error || !transaccion) return <PagoError pagoId={pagoId} />;

  const handleAnular = (motivo: string) => {
    anularMutation.mutate({
      motivo,
      documentoId: transaccion.documento?.id,
      ordenId: transaccion.orden?.id,
    });
  };

  const tipoLabel = transaccion.tipoDePago.replace(/_/g, " ");
  const operacionLabel = transaccion.tipoOperacion.replace(/_/g, " ");

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      <PageHeader
        eyebrow={`Transacción #${transaccion.id}`}
        title={`${money(transaccion.montoEquivalenteBase)} USD`}
        subtitle={`${tipoLabel} · ${operacionLabel} · ${fechaCorta(transaccion.fecha)}`}
        actions={<BackToPagosLink />}
      />

      <PagoRelatedLinks
        transaccion={transaccion}
        onAnular={handleAnular}
        isPending={anularMutation.isPending}
      />

      {transaccion.motivoAnulacion && (
        <PagoMotivoAnulacion motivo={transaccion.motivoAnulacion} />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <PagoStat
          label={`Monto en ${transaccion.divisa.codigo}`}
          value={`${money(transaccion.montoOrigen)} ${transaccion.divisa.codigo}`}
        />
        <PagoStat
          label="Tasa aplicada"
          value={transaccion.tasaAplicadaValor ? transaccion.tasaAplicadaValor.toFixed(4) : "—"}
        />
        <PagoStat
          label="Equivalente en USD"
          value={`${money(transaccion.montoEquivalenteBase)} USD`}
          strong
        />
      </div>

      {transaccion.tasaAplicada && (
        <PagoConversionDetail tasaAplicada={transaccion.tasaAplicada} />
      )}

      <PagoDetalles transaccion={transaccion} />

      <PagoAuditoria
        usuario={transaccion.usuario.nombreUsuario}
        fecha={transaccion.fecha}
      />
    </div>
  );
}
