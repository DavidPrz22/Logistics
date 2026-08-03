import type { EstadoOrden } from "@/types/types";
import { Circle, Truck, CheckCircle2, AlertCircle, Clock, CheckCheck, XCircle } from "lucide-react";

export function EstadoBadge({ estado }: { estado: EstadoOrden }) {
  const cfg = {
    PREPARACION: { cls: "status-badge-prep", label: "Preparación", Icon: Circle },
    EN_RUTA:     { cls: "status-badge-ruta", label: "En ruta",     Icon: Truck },
    LIQUIDADA:   { cls: "status-badge-liq",  label: "Liquidada",   Icon: CheckCircle2 },
  }[estado];
  return (
    <span className={`${cfg.cls} inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide`}>
      <cfg.Icon className="size-3" />
      {cfg.label}
    </span>
  );
}

type EstadoDocumentoDeuda = "PENDIENTE" | "PAGADO_PARCIAL" | "PAGADO_TOTAL" | "ANULADO";

export function EstadoDocumentoBadge({ estado }: { estado: EstadoDocumentoDeuda }) {
  const cfg = {
    PENDIENTE: { cls: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400", label: "Pendiente", Icon: Clock },
    PAGADO_PARCIAL: { cls: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", label: "Pagado parcial", Icon: AlertCircle },
    PAGADO_TOTAL: { cls: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", label: "Pagado total", Icon: CheckCheck },
    ANULADO: { cls: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", label: "Anulado", Icon: XCircle },
  }[estado];
  return (
    <span className={`${cfg.cls} inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide`}>
      <cfg.Icon className="size-3" />
      {cfg.label}
    </span>
  );
}