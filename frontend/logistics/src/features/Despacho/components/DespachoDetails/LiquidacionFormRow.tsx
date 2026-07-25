import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, AlertTriangle } from "lucide-react";
import { useFieldArray, type Control } from "react-hook-form";
import type { LiquidacionRowData } from "../../types/types";
import type { LiquidacionSchema } from "../../schemas/schema";
import { LiquidacionDevueltoRow } from "./LiquidacionDevueltoRow";
import type {  MotivoRechazo, Almacen } from "@/types/zodType";

interface LiquidacionFormRowProps {
  r: LiquidacionRowData;
  idx: number;
  control: Control<LiquidacionSchema>;
  motivosRechazo: MotivoRechazo[];
  almacenes: Almacen[];
  updateDevuelta: (detailId: number, val: number) => void;
}

export const LiquidacionFormRow = ({
  r,
  idx,
  control,
  motivosRechazo,
  almacenes,
  updateDevuelta,
}: LiquidacionFormRowProps) => {

  const { fields, append, remove } = useFieldArray({
    control,
    name: `detallesLiquidacion.${idx}.rechazos` as const
  });

  const defaultMermaId = (almacenes || []).find((a) => a.tipo === "MERMA")?.id || 0;

  return (
    <div key={r.id} className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        <div className="md:col-span-4">
          <div className="font-mono font-semibold">{r.sku}</div>
          <div className="text-sm text-muted-foreground">{r.varianteNombre} · {r.numeroLote}</div>
        </div>
        <div className="md:col-span-2 text-sm">
          <div className="text-xs text-muted-foreground">Enviada</div>
          <div className="font-mono tabular-nums text-lg">{r.cantidadEnviada}</div>
        </div>
        <div className="md:col-span-2">
          <label className="text-xs text-muted-foreground">Devuelta</label>
          <Input type="number" min={0} max={r.cantidadEnviada} value={r.devuelta || ""} onChange={(e) => updateDevuelta(r.id, e.target.value === "" ? 0 : Math.max(0, Number(e.target.value)))} className="h-9 font-mono" />
        </div>
        <div className="md:col-span-2 text-sm">
          <div className="text-xs text-muted-foreground">Cobrada</div>
          <div className="font-mono tabular-nums text-lg text-(--status-liq)">{r.cantidadEnviada - r.devuelta}</div>
        </div>
        <div className="md:col-span-2 text-right text-sm">
          <div className="text-xs text-muted-foreground">Rechazado</div>
          <div className="font-mono tabular-nums">${(r.devuelta * r.precioUnitario).toFixed(2)}</div>
        </div>
      </div>

      {r.devuelta > 0 && (
        <div className="mt-4 ml-4 pl-4 border-l-2 border-accent/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Motivos del rechazo · suman <span className={r.sumRech === r.devuelta ? "text-[color:var(--status-liq)]" : "text-destructive"}>{r.sumRech}</span> de {r.devuelta}</div>
            <Button size="sm" variant="outline" type="button" onClick={() => append({ cantidadRechazada: 0, motivoRechazoId: 0, almacenReingresoId: defaultMermaId, observaciones: "" })}>
              <Plus className="size-3.5 mr-1" /> Añadir motivo
            </Button>
          </div>
          {fields.map((field, ri) => (
            <LiquidacionDevueltoRow 
              key={field.id}
              idx={idx}
              ri={ri}
              motivosRechazo={motivosRechazo}
              almacenes={almacenes}
              rmRechazo={() => remove(ri)}
            />
          ))}
          {r.problems.length > 0 && (
            <div className="text-xs text-destructive flex items-center gap-1">
              <AlertTriangle className="size-3.5" /> {r.problems.join(" · ")}
            </div>
          )}
        </div>
      )}
    </div>
  );
};