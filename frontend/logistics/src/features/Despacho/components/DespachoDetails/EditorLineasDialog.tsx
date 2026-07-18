import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { erpActions, findLote, findVariante, useERP } from "@/lib/erp-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/shared/combobox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import type { DetalleOrden } from "@/types/types";
import type { EditorLinea } from "../../types/types";

interface EditorLineasDialogProps {
  ordenId: number;
  initial: DetalleOrden[];
  onClose: () => void;
}

export function EditorLineasDialog({ ordenId, initial, onClose }: EditorLineasDialogProps) {
  const state = useERP((s) => s);
  const [lineas, setLineas] = useState<EditorLinea[]>(() => initial.map((d) => ({ ...d, key: `d${d.id}` })));
  const [addLote, setAddLote] = useState("");
  const lotesDisponibles = state.lotes.filter((l) => l.almacen_id === 1 && l.stock_actual > 0);

  const add = () => {
    const l = findLote(state, Number(addLote)); if (!l) return;
    const v = findVariante(state, l.variante_id);
    setLineas((prev) => [...prev, { id: 0, orden_id: ordenId, lote_id: l.id, cantidad_enviada: 1, precio_unitario: v?.precio_base ?? 0, key: `n${Date.now()}` }]);
    setAddLote("");
  };

  const save = () => {
    erpActions.updateDetalles(ordenId, lineas.map((l) => ({ id: l.id || undefined, lote_id: l.lote_id, cantidad_enviada: l.cantidad_enviada, precio_unitario: l.precio_unitario })));
    toast.success("Componentes actualizados");
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader><DialogTitle>Editar componentes</DialogTitle></DialogHeader>
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="text-xs uppercase text-muted-foreground">Añadir lote</label>
            <Combobox
              items={lotesDisponibles.map((l) => { const v = findVariante(state, l.variante_id)!; return { value: String(l.id), label: `${v.sku} · ${v.nombre}`, hint: `${l.numero_lote} · Stock ${l.stock_actual}` }; })}
              value={addLote} onChange={setAddLote} placeholder="Buscar lote…"
            />
          </div>
          <Button onClick={add} disabled={!addLote}><Plus className="size-4 mr-1" /> Añadir</Button>
        </div>

        <div className="max-h-96 overflow-auto rounded-md border border-border">
          <Table>
            <TableHeader className="bg-secondary/60"><TableRow>
              <TableHead>SKU / Lote</TableHead><TableHead className="w-28">Cantidad</TableHead><TableHead className="w-32">Precio</TableHead><TableHead className="w-12" />
            </TableRow></TableHeader>
            <TableBody>
              {lineas.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">Sin líneas.</TableCell></TableRow>}
              {lineas.map((ln, idx) => {
                const l = findLote(state, ln.lote_id); const v = l ? findVariante(state, l.variante_id) : undefined;
                const upd = (patch: Partial<EditorLinea>) => setLineas((prev) => prev.map((x, i) => i === idx ? { ...x, ...patch } : x));
                return (
                  <TableRow key={ln.key}>
                    <TableCell><div className="font-mono font-semibold">{v?.sku}</div><div className="text-xs text-muted-foreground">{l?.numero_lote}</div></TableCell>
                    <TableCell><Input type="number" min={1} value={ln.cantidad_enviada} onChange={(e) => upd({ cantidad_enviada: Math.max(1, Number(e.target.value)) })} className="h-8" /></TableCell>
                    <TableCell><Input type="number" step="0.01" value={ln.precio_unitario} onChange={(e) => upd({ precio_unitario: Number(e.target.value) })} className="h-8 font-mono" /></TableCell>
                    <TableCell><Button size="icon" variant="ghost" onClick={() => setLineas((prev) => prev.filter((_, i) => i !== idx))}><Trash2 className="size-4 text-destructive" /></Button></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={save}>Guardar cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
