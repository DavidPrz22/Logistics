import { DatePicker } from "@/components/shared/date-picker";
import { Combobox } from "@/components/shared/combobox";
import { cn } from "@/lib/utils";

export type TipoFiltro = "TODOS" | "ENTRADAS" | "SALIDAS";

export function CardexFilters({
  desde, hasta, tipo, almacen, almacenes, onDesde, onHasta, onTipo, onAlmacen, onReset,
}: {
  desde: string; hasta: string; tipo: TipoFiltro; almacen: string;
  almacenes: { value: string; label: string; hint?: string }[];
  onDesde: (v: string) => void; onHasta: (v: string) => void;
  onTipo: (v: TipoFiltro) => void; onAlmacen: (v: string) => void;
  onReset?: () => void;
}) {
  const activos = Boolean(desde || hasta || almacen !== "ALL" || tipo !== "TODOS");

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-4">
      <div className="w-42.5">
        <label className="text-xs uppercase tracking-wider text-muted-foreground">Desde</label>
        <div className="mt-1"><DatePicker value={desde} onChange={onDesde} /></div>
      </div>
      <div className="w-42.5">
        <label className="text-xs uppercase tracking-wider text-muted-foreground">Hasta</label>
        <div className="mt-1"><DatePicker value={hasta} onChange={onHasta} /></div>
      </div>
      <div className="w-42.5">
        <label className="text-xs uppercase tracking-wider text-muted-foreground">Almacén</label>
        <div className="mt-1">
          <Combobox items={[{ value: "ALL", label: "Todos los almacenes" }, ...almacenes]} value={almacen} onChange={onAlmacen} />
        </div>
      </div>
      <div className="ml-auto flex items-end gap-3">
        {activos && onReset && (
          <button
            onClick={onReset}
            className="rounded-md border border-border px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Limpiar filtros
          </button>
        )}
        <div>
          <label className="block text-xs uppercase tracking-wider text-muted-foreground">Tipo de movimiento</label>
          <div className="mt-1 inline-flex overflow-hidden rounded-md border border-border">
            {(["TODOS", "ENTRADAS", "SALIDAS"] as const).map((t) => (
              <button
                key={t}
                onClick={() => onTipo(t)}
                className={cn("px-3 py-2 text-xs font-semibold uppercase tracking-wider", tipo === t ? "bg-primary text-primary-foreground" : "hover:bg-muted")}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

