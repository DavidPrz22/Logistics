import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAlmacenes, useMotivosRechazo } from "@/hooks/queries/queries";
import { useRegistrarLiquidacionMutation } from "../../hooks/mutations/mutations";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { DetalleOrdenDetail, LiquidacionSchema } from "../../schemas/schema";
import { liquidacionSchema } from "../../schemas/schema";
import type { LiquidacionRowData } from "../../types/types";
import { LiquidacionFormRow } from "./LiquidacionFormRow";

interface LiquidacionFormProps {
  ordenId: number;
  detalles: DetalleOrdenDetail[];
  onCancel: () => void;
}
export function LiquidacionForm({ ordenId, detalles, onCancel }: LiquidacionFormProps) {
  const { data: almacenes = [] } = useAlmacenes();
  const { data: motivosRechazo = [] } = useMotivosRechazo();

  const {mutateAsync: registrarLiquidacion } = useRegistrarLiquidacionMutation(ordenId);

  const form = useForm<LiquidacionSchema>({
    resolver: zodResolver(liquidacionSchema),
    defaultValues: {
      ordenId,
      detallesLiquidacion: detalles.map(d => ({
        detalleId: d.id,
        rechazos: []
      }))
    }
  });

  const [devueltas, setDevueltas] = useState<Record<number, number>>({});

  const formDetalles = useWatch({ control: form.control, name: "detallesLiquidacion" });

  const rows: LiquidacionRowData[] = useMemo(() => {
    return detalles.map((d, idx) => {
      const fd = formDetalles[idx];
      const dev = devueltas[d.id] || 0;
      const rechazos = fd?.rechazos || [];
      const sumRech = rechazos.reduce((acc, r) => acc + Number(r.cantidadRechazada || 0), 0);
      
      const problems: string[] = [];
      if (dev > d.cantidadEnviada) problems.push("Devuelta supera lo enviado");
      if (dev > 0 && sumRech !== dev) problems.push(`Motivos suman ${sumRech}, deben sumar ${dev}`);
      if (rechazos.some((x) => !x.motivoRechazoId || Number(x.motivoRechazoId) === 0)) problems.push("Motivo requerido");

      return {
        id: d.id,
        sku: d.sku,
        varianteNombre: d.varianteNombre,
        numeroLote: d.numeroLote,
        cantidadEnviada: d.cantidadEnviada,
        precioUnitario: d.precioUnitario,
        devuelta: dev,
        rechazos,
        sumRech,
        problems
      };
    });
  }, [detalles, formDetalles, devueltas]);

  const updateDevuelta = (detailId: number, val: number) => {
    setDevueltas(prev => ({ ...prev, [detailId]: val }));
  };

  const hasErrors = rows.some((r) => r.problems.length > 0);

  const onSubmit = form.handleSubmit(async (data) => {
    if (hasErrors) { 
      toast.error("Corrige los errores de liquidación"); 
      return; 
    }
    await registrarLiquidacion(data)
    toast.success("Orden liquidada");
  });

  return (
    <Card className="overflow-hidden">
      <FormProvider {...form}>
        <form onSubmit={onSubmit}>
          <div className="p-4 border-b border-border bg-(--status-liq-bg)/40">
            <h2 className="font-semibold">Liquidación de retornos</h2>
            <p className="text-xs text-muted-foreground">Registra las unidades devueltas y divide por motivo. La suma de motivos debe igualar la cantidad devuelta.</p>
          </div>

          <div className="divide-y divide-border">
            {rows.map((r, idx) => (
              <LiquidacionFormRow
                key={r.id}
                r={r}
                idx={idx}
                control={form.control}
                motivosRechazo={motivosRechazo}
                almacenes={almacenes}
                updateDevuelta={updateDevuelta}
              />
            ))}
          </div>

          <div className="p-4 border-t border-border flex justify-end gap-2">
            <Button variant="outline" size='lg' onClick={onCancel} className='cursor-pointer'>Cancelar</Button>
            <Button type="submit" disabled={hasErrors} className="bg-(--status-liq) text-white hover:brightness-95 cursor-pointer hover:bg-green-600" size='lg'>
              <CheckCircle2 className="size-4 mr-1" /> Confirmar liquidación
            </Button>
          </div>
        </form>
      </FormProvider>
    </Card>
  );
}
