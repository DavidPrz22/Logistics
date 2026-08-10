import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { PagoEstadoBadge } from "@/components/shared/factura-badges";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, ArrowUpRight, Ban, FileText, Truck } from "lucide-react";

export const Route = createFileRoute("/pagos/$pagosId/")({
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
  const p = useFacturacion((s) => s.transacciones.find((t) => t.id === Number(pagoId)));
  useFacturacion((s) => s.documentos);
  const [motivo, setMotivo] = useState("");

  if (!p) {
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
  const divisa = findDivisa(p.divisa_pago_id);
  const base = divisaBase();
  const doc = p.documento_id ? findDocumento(p.documento_id) : undefined;

  const anular = () => {
    if (motivo.trim().length < 4) { toast.error("Indica un motivo de anulación (mín. 4 caracteres)"); return; }
    pagosActions.anularPago(p.id, motivo.trim());
    toast.success("Transacción anulada y saldo reincorporado al documento");
    setMotivo("");
  };

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      <PageHeader
        eyebrow={`Transacción #${p.id}`}
        title={money(p.monto_equivalente_base)}
        subtitle={`${p.tipo_de_pago.replace(/_/g, " ")} · ${p.tipo_operacion} · ${new Date(p.fecha_pago).toISOString().slice(0, 16).replace("T", " ")} UTC`}
        actions={<Link to="/pagos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Volver</Link>}
      />

      <div className="flex flex-wrap items-center gap-3">
        <PagoEstadoBadge estado={p.estado} />
        {p.documento_id && (
          <Link to="/facturacion/$documentoId" params={{ documentoId: String(p.documento_id) }} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-mono font-semibold hover:bg-muted">
            <FileText className="size-3.5" /> Doc #{p.documento_id} <ArrowUpRight className="size-3" />
          </Link>
        )}
        {p.orden_id && esOrdenDeTrafico(p.orden_id) && (
          <Link to="/despachos/$ordenId" params={{ ordenId: String(p.orden_id) }} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-mono font-semibold hover:bg-muted">
            <Truck className="size-3.5" /> Orden #{p.orden_id} <ArrowUpRight className="size-3" />
          </Link>
        )}
        {p.estado === "APROBADO" && (
          <AlertDialog>
            <AlertDialogTrigger>
              <Button variant="destructive" size="sm" className="ml-auto"><Ban className="size-4" /> Anular pago</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Anular transacción #{p.id}</AlertDialogTitle>
                <AlertDialogDescription>
                  El monto de {p.monto_equivalente_base} se reincorporará al saldo pendiente del documento vinculado y su
                  estado se recalculará. Acción restringida a administración.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Input value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Motivo de la anulación" maxLength={140} />
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={anular}>Confirmar anulación</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Stat label={`Monto en ${divisa?.codigo ?? ""}`} value={`${p.monto_origen.toFixed(2)} ${divisa?.codigo ?? ""}`} />
        <Stat label={`Tasa aplicada (${base.codigo}/${divisa?.codigo})`} value={String(p.tasa_aplicada)} />
        <Stat label={`Equivalente en ${base.codigo}`} value={p.monto_equivalente_base} strong />
      </div>

      <Card className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Row label="Tipo de pago" value={p.tipo_de_pago.replace(/_/g, " ")} />
        <Row label="Método de pago" value={findMetodoPago(p.metodo_pago_id)?.descripcion ?? "—"} />
        <Row label="Número de referencia" value={p.numero_referencia ?? "—"} />
        <Row label="Cuenta destino" value={findCuenta(p.cuenta_destino_id)?.nombre ?? "—"} />
        <Row label="Cliente" value={doc?.identificador_cliente ?? "—"} />
        <Row label="Documento / Orden" value={p.documento_id ? `Doc #${p.documento_id}` : p.orden_id ? `Orden #${p.orden_id}` : "—"} />
        {p.motivo_anulacion && <Row label="Motivo de anulación" value={p.motivo_anulacion} />}
      </Card>

      <Card className="p-6 space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Auditoría</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Row label="Registrado por" value={p.usuario} />
          <Row label="Timestamp" value={`${p.fecha_pago.slice(0, 19).replace("T", " ")} UTC`} />
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
