import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Combobox } from "@/components/shared/combobox";
import type { LiquidacionSchema } from "../../schemas/schema";
import type { MotivoRechazo, Almacen } from "@/types/zodType";
import { Controller, useFormContext } from "react-hook-form";

interface LiquidacionDevueltoRowProps {
  idx: number;
  ri: number;
  motivosRechazo: MotivoRechazo[];
  almacenes: Almacen[];
  rmRechazo: () => void;
}

export const LiquidacionDevueltoRow = ({
  idx,
  ri,
  motivosRechazo,
  almacenes,
  rmRechazo
}: LiquidacionDevueltoRowProps) => {
  const { control, setValue } = useFormContext<LiquidacionSchema>();

  const mermaId = (almacenes || []).find((a) => a.tipo === "MERMA")?.id || 0;
  const mainId = (almacenes || []).find((a) => a.tipo === "PRINCIPAL")?.id || 0;

  return (
    <div className="grid grid-cols-12 gap-2 items-end bg-secondary/40 rounded-md p-3">
      <div className="col-span-2">
        <label className="text-xs text-muted-foreground">Unidades</label>
        <Controller
          control={control}
          name={`detallesLiquidacion.${idx}.rechazos.${ri}.cantidadRechazada`}
          render={({ field }) => (
            <Input 
              type="number" 
              min={1} 
              value={field.value || ""} 
              onChange={(e) => field.onChange(e.target.value === "" ? 0 : Math.max(0, Number(e.target.value)))} 
              className="h-8 font-mono" 
            />
          )}
        />
      </div>
      <div className="col-span-4">
        <label className="text-xs text-muted-foreground">Motivo</label>
        <Controller
          control={control}
          name={`detallesLiquidacion.${idx}.rechazos.${ri}.motivoRechazoId`}
          render={({ field }) => (
            <Combobox 
              items={(motivosRechazo || []).map(
                (m) => ({ value: String(m.id), label: `${m.codigo} · ${m.descripcion}`, hint: m.requiere_merma ? "→ Merma" : "→ Principal" })
              )} 
              value={field.value ? String(field.value) : ""} 
              onChange={(v) => { 
                const selectedId = Number(v);
                field.onChange(selectedId);
                const m = (motivosRechazo || []).find((x) => x.id === selectedId);
                setValue(`detallesLiquidacion.${idx}.rechazos.${ri}.almacenReingresoId`, m?.requiere_merma ? mermaId : mainId, { shouldValidate: true });
              }} 
              placeholder="Motivo…" 
            />
          )}
        />
      </div>
      <div className="col-span-3">
        <label className="text-xs text-muted-foreground">Almacén reingreso</label>
        <Controller
          control={control}
          name={`detallesLiquidacion.${idx}.rechazos.${ri}.almacenReingresoId`}
          render={({ field }) => (
            <Combobox 
              items={(almacenes || []).filter((a) => a.tipo !== "TRANSITO").map((a) => ({ value: String(a.id), label: a.nombre, hint: a.tipo }))} 
              value={field.value ? String(field.value) : ""} 
              onChange={(v) => field.onChange(Number(v))} 
            />
          )}
        />
      </div>
      <div className="col-span-2">
        <label className="text-xs text-muted-foreground">Observaciones</label>
        <Controller
          control={control}
          name={`detallesLiquidacion.${idx}.rechazos.${ri}.observaciones`}
          render={({ field }) => (
            <Input 
              {...field} 
              value={field.value ?? ""} 
              className="h-8" 
            />
          )}
        />
      </div>
      <div className="col-span-1">
        <Button size="icon" variant="ghost" onClick={rmRechazo} type="button">
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
};