import type { EstadoDocumentoDeuda, EstadoTransaccionPago, TipoDocumentoDeuda } from "@/features/Facturacion/types/types";
import { Clock, CircleDollarSign, CheckCircle2, Ban, XCircle, FileText, FileMinus } from "lucide-react";

const pill = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide border";

export function DocEstadoBadge({ estado }: { estado: EstadoDocumentoDeuda }) {
  const cfg = {
    PENDIENTE: { cls: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400", label: "Pendiente", Icon: Clock },
    PAGADO_PARCIAL: { cls: "border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-400", label: "Parcial", Icon: CircleDollarSign },
    PAGADO_TOTAL: { cls: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", label: "Pagado", Icon: CheckCircle2 },
    ANULADO: { cls: "border-border bg-muted text-muted-foreground", label: "Anulado", Icon: Ban },
  }[estado];
  return <span className={`${pill} ${cfg.cls}`}><cfg.Icon className="size-3" />{cfg.label}</span>;
}

export function PagoEstadoBadge({ estado }: { estado: EstadoTransaccionPago }) {
  const cfg = {
    APROBADO: { cls: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", label: "Aprobado", Icon: CheckCircle2 },
    ANULADO: { cls: "border-border bg-muted text-muted-foreground", label: "Anulado", Icon: Ban },
    RECHAZADO: { cls: "border-destructive/40 bg-destructive/10 text-destructive", label: "Rechazado", Icon: XCircle },
  }[estado];
  return <span className={`${pill} ${cfg.cls}`}><cfg.Icon className="size-3" />{cfg.label}</span>;
}

export function TipoDocBadge({ tipo }: { tipo: TipoDocumentoDeuda }) {
  const isNc = tipo === "NOTA_CREDITO";
  return (
    <span className={`${pill} ${isNc ? "border-purple-500/40 bg-purple-500/10 text-purple-600 dark:text-purple-400" : "border-border bg-secondary text-foreground/80"}`}>
      {isNc ? <FileMinus className="size-3" /> : <FileText className="size-3" />}
      {isNc ? "N. Crédito" : "Factura"}
    </span>
  );
}
