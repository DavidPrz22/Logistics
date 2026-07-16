import type { EstadoOrden } from "@/types/types";
import { Circle, Truck, CheckCircle2 } from "lucide-react";

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