import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import type { DetalleOrdenDetail, LoteSearchResult } from "../../schemas/schema";
import { detallesOrdenDespachoSchema, type DetallesOrdenDespacho } from "../../schemas/schema";
import { LineaBorradorAddRow } from "../DespachoCreate/LineaBorradorAddRow";

interface EditorLineasDialogProps {
  initial: DetalleOrdenDetail[];
  onClose: () => void;
  onSave?: (lineas: DetallesOrdenDespacho[]) => void;
}

type FormValues = {
  detalles: DetallesOrdenDespacho[];
};

interface LineaDisplay {
  sku: string;
  variante_nombre: string;
  numero_lote: string;
  stock_actual: number;
}

export function EditorLineasDialog({ initial, onClose, onSave }: EditorLineasDialogProps) {


  const [loteInfoMap, setLoteInfoMap] = useState<Map<number, LineaDisplay>>(
    () => new Map(initial.map(d => [d.loteId, {
      sku: d.sku,
      variante_nombre: d.varianteNombre || d.productoNombre,
      numero_lote: d.numeroLote,
      stock_actual: d.stockActualLote,
    }]))
  );

  const { register, control, handleSubmit, watch } = useForm<FormValues>({
    resolver: zodResolver(z.object({ detalles: detallesOrdenDespachoSchema.array() })),
    mode: "onChange",
    defaultValues: {
      detalles: initial.map((d) => ({
        id: d.id,
        loteId: d.loteId,
        cantidadEnviada: d.cantidadEnviada,
        precioUnitario: d.precioUnitario,
      })),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "detalles",
  });

  const lineas = watch("detalles");

  const total = (lineas || []).reduce(
    (s, l) => s + (Number(l?.cantidadEnviada) || 0) * (Number(l?.precioUnitario) || 0),
    0
  );

  const disabledLotes = (lineas || []).map((l) => l?.loteId).filter(Boolean) as number[];

  const handleSelectLote = (lote: LoteSearchResult) => {
    const isDuplicate = disabledLotes.includes(lote.id);

    if (isDuplicate) {
      toast.error("Este lote ya está en la lista");
      return;
    }

    setLoteInfoMap(prev => new Map(prev).set(lote.id, {
      sku: lote.sku,
      variante_nombre: lote.varianteNombre || lote.productoNombre,
      numero_lote: lote.numeroLote,
      stock_actual: lote.stockActual,
    }));

    append({
      loteId: lote.id,
      cantidadEnviada: 1,
      precioUnitario: lote.precioBase,
    });

    toast.success(`Lote ${lote.numeroLote} añadido`);
  };

  const getDisplayInfo = (loteId: number): LineaDisplay => {
    return loteInfoMap.get(loteId) ?? {
      sku: String(loteId),
      variante_nombre: "N/A",
      numero_lote: String(loteId),
      stock_actual: 0,
    };
  };

  const onSubmit = (data: FormValues) => {
    onSave?.(data.detalles);
    toast.success("Componentes actualizados");
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader><DialogTitle>Editar componentes</DialogTitle></DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <LineaBorradorAddRow onSelectLote={handleSelectLote} disabledLotes={disabledLotes} />

          <div className="rounded-md border border-border overflow-hidden mt-4">
            <Table>
              <TableHeader className="bg-secondary/60">
                <TableRow>
                  <TableHead className="w-28">SKU</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead className="w-32">Lote</TableHead>
                  <TableHead className="w-28">Cantidad</TableHead>
                  <TableHead className="w-32">Precio unit.</TableHead>
                  <TableHead className="text-right w-32">Subtotal</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Sin líneas.
                    </TableCell>
                  </TableRow>
                )}
                {fields.map((field, idx) => {
                  const linea = lineas?.[idx];
                  const loteId = linea?.loteId ?? field.loteId;
                  const info = getDisplayInfo(loteId);
                  const cantidad = Number(linea?.cantidadEnviada) || 0;
                  const precio = Number(linea?.precioUnitario) || 0;
                  const subtotal = cantidad * precio;

                  return (
                    <TableRow key={field.id}>
                      <TableCell className="font-mono font-semibold text-xs">{info.sku}</TableCell>
                      <TableCell className="text-sm font-medium">{info.variante_nombre}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {info.numero_lote || loteId}
                        <div className="text-[11px] text-muted-foreground/80">Stock: {info.stock_actual}</div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={1}
                          {...register(`detalles.${idx}.cantidadEnviada` as const, { valueAsNumber: true })}
                          className="h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          min={0}
                          {...register(`detalles.${idx}.precioUnitario` as const, { valueAsNumber: true })}
                          className="h-8 font-mono"
                        />
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">${subtotal.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button type="button" size="icon" variant="ghost" onClick={() => remove(idx)}>
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border mt-4">
            <div className="text-right">
              <div className="text-xs uppercase text-muted-foreground">Total facturado</div>
              <div className="text-2xl font-bold font-mono tabular-nums">${total.toFixed(2)}</div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="ghost" type="button" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Guardar cambios</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

