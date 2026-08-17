import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { PagoEstadoBadge } from "@/components/shared/factura-badges";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, ArrowUpRight, Ban, FileText, Truck, Loader2 } from "lucide-react";
import { useTransaccionById } from "@/features/Pagos/hooks/queries/queries";
import { useAnularTransaccionMutation } from "@/features/Pagos/hooks/mutations/mutations";
import { money, fechaCorta } from "@/features/Pagos/lib/helpers";

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
  const [motivo, setMotivo] = useState("");

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !transaccion) {
    return (
      <div className="p-8 max-w-xl mx-auto">
        <Card className="p-8 text-center space-y-3">
          <h1 className="text-xl font-semibold">Transacción #{pagoId} no encontrada</h1>
          <p className="text-sm text-muted-foreground">El pago solicitado no existe o fue eliminado.</p>
          <Button variant="secondary">
            <Link to="/pagos"><ArrowLeft className="size-4" /> Volver al listado</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const handleAnular = () => {
    if (motivo.trim().length < 4) return;
    anularMutation.mutate(motivo.trim());
    setMotivo("");
  };

  const clienteNombre = transaccion.documento?.cliente.nombre
    ?? transaccion.orden?.cliente.nombre
    ?? "—";

  const tipoLabel = transaccion.tipoDePago.replace(/_/g, " ");
  const operacionLabel = transaccion.tipoOperacion.replace(/_/g, " ");

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      <PageHeader
        eyebrow={`Transacción #${transaccion.id}`}
        title={`${money(transaccion.montoEquivalenteBase)} USD`}
        subtitle={`${tipoLabel} · ${operacionLabel} · ${fechaCorta(transaccion.fecha)}`}
        actions={
          <Link to="/pagos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> Volver
          </Link>
        }
      />

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
          <AlertDialog>
            <AlertDialogTrigger>
              <Button variant="destructive" size="sm" className="ml-auto">
                <Ban className="size-4" /> Anular pago
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Anular transacción #{transaccion.id}</AlertDialogTitle>
                <AlertDialogDescription>
                  El monto de {money(transaccion.montoEquivalenteBase)} USD se reincorporará al saldo pendiente
                  {transaccion.documento ? " del documento vinculado" : " de la orden"} y su
                  estado se recalculará. Acción restringida a administración.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Input
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Motivo de la anulación (mín. 4 caracteres)"
                maxLength={140}
              />
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleAnular}
                  disabled={motivo.trim().length < 4 || anularMutation.isPending}
                >
                  {anularMutation.isPending ? "Anulando..." : "Confirmar anulación"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {transaccion.motivoAnulacion && (
        <Card className="p-4 border-destructive/30 bg-destructive/5">
          <div className="text-xs uppercase tracking-wider text-destructive font-semibold">Motivo de anulación</div>
          <div className="mt-1 text-sm">{transaccion.motivoAnulacion}</div>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Stat
          label={`Monto en ${transaccion.divisa.codigo}`}
          value={`${money(transaccion.montoOrigen)} ${transaccion.divisa.codigo}`}
        />
        <Stat
          label="Tasa aplicada"
          value={transaccion.tasaAplicadaValor ? transaccion.tasaAplicadaValor.toFixed(4) : "—"}
        />
        <Stat
          label="Equivalente en USD"
          value={`${money(transaccion.montoEquivalenteBase)} USD`}
          strong
        />
      </div>

      {transaccion.tasaAplicada && (
        <Card className="p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Detalle de conversión</div>
          <div className="text-sm">
            <span className="font-mono">{transaccion.tasaAplicada.divisaOrigen.codigo}</span>
            {" → "}
            <span className="font-mono">{transaccion.tasaAplicada.divisaDestino.codigo}</span>
            {" · Tasa: "}
            <span className="font-mono font-semibold">{transaccion.tasaAplicada.tasa.toFixed(4)}</span>
          </div>
        </Card>
      )}

      <Card className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Row label="Tipo de pago" value={tipoLabel} />
        <Row label="Método de pago" value={transaccion.metodoPago.descripcion} />
        <Row label="Número de referencia" value={transaccion.numeroReferencia ?? "—"} />
        <Row
          label="Cuenta destino"
          value={transaccion.cuentaDestino
            ? `${transaccion.cuentaDestino.nombre} (${transaccion.cuentaDestino.divisa.codigo})`
            : "—"
          }
        />
        <Row label="Cliente" value={clienteNombre} />
        <Row
          label="Documento / Orden"
          value={
            transaccion.documento
              ? `Doc #${transaccion.documento.id}`
              : transaccion.orden
                ? `Orden #${transaccion.orden.id}`
                : "—"
          }
        />
      </Card>

      <Card className="p-6 space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Auditoría</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Row label="Registrado por" value={transaccion.usuario.nombreUsuario} />
          <Row label="Timestamp" value={fechaCorta(transaccion.fecha)} />
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <Card className="p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-2 font-mono tabular-nums ${strong ? "text-3xl font-bold" : "text-2xl font-semibold"}`}>{value}</div>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-mono tabular-nums wrap-break-words">{value}</div>
    </div>
  );
}
