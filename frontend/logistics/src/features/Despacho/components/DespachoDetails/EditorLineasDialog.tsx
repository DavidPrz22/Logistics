import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import type { DetalleOrdenDetail } from "../../schemas/schema";
import type { LineaBorrador } from "../../types/types";
import { LineaBorradorAddRow } from "../DespachoCreate/LineaBorradorAddRow";
import { LineaBorradorTable } from "../DespachoCreate/LineaBorradorTable";
import type { LoteSearchResult } from "../../schemas/schema";

interface EditorLineasDialogProps {
  ordenId: number;
  initial: DetalleOrdenDetail[];
  onClose: () => void;
  onSave?: (lineas: LineaBorrador[]) => void;
}

export function EditorLineasDialog({ initial, onClose, onSave }: EditorLineasDialogProps) {
  const [lineas, setLineas] = useState<LineaBorrador[]>(() =>
    initial.map((d) => ({
      key: `d${d.id}`,
      sku: d.sku,
      variante_nombre: d.varianteNombre,
      lote_id: d.loteId,
      numero_lote: d.numeroLote,
      stock_actual: d.stockActualLote,
      cantidad: d.cantidadEnviada,
      precio: d.precioUnitario,
    }))
  );

  const handleSelectLote = (lote: LoteSearchResult) => {
    const isDuplicate = lineas.some(l => l.lote_id === lote.id);

    if (isDuplicate) {
      toast.error("Este lote ya está en la lista");
      return;
    }

    const newLinea: LineaBorrador = {
      key: crypto.randomUUID(),
      sku: lote.sku,
      variante_nombre: lote.varianteNombre,
      lote_id: lote.id,
      numero_lote: lote.numeroLote,
      stock_actual: lote.stockActual,
      cantidad: 1,
      precio: lote.precioBase,
    };

    setLineas(prev => [...prev, newLinea]);
    toast.success(`Lote ${lote.numeroLote} añadido`);
  };

  const updateLinea = (idx: number, patch: Partial<LineaBorrador>) =>
    setLineas((prev) => prev.map((x, i) => i === idx ? { ...x, ...patch } : x));

  const removeLinea = (idx: number) =>
    setLineas((prev) => prev.filter((_, i) => i !== idx));

  const disabledLotes = lineas.map(l => l.lote_id);

  const total = lineas.reduce((s, l) => s + Number(l.cantidad) * Number(l.precio), 0);

  const save = () => {
    onSave?.(lineas);
    toast.success("Componentes actualizados");
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Editar componentes</DialogTitle></DialogHeader>

        <LineaBorradorAddRow onSelectLote={handleSelectLote} disabledLotes={disabledLotes} />

        <LineaBorradorTable lineas={lineas} onUpdateLinea={updateLinea} onRemoveLinea={removeLinea} />

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="text-right">
            <div className="text-xs uppercase text-muted-foreground">Total facturado</div>
            <div className="text-2xl font-bold font-mono tabular-nums">${total.toFixed(2)}</div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={save}>Guardar cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
