import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { findLote, findVariante, useERP } from "@/lib/erp-store";
import type { LineaBorrador } from "../../types/types";

interface LineaBorradorTableProps {
  lineas: LineaBorrador[];
  onUpdateLinea: (idx: number, patch: Partial<LineaBorrador>) => void;
  onRemoveLinea: (idx: number) => void;
}

export function LineaBorradorTable({ lineas, onUpdateLinea, onRemoveLinea }: LineaBorradorTableProps) {
  const state = useERP((s) => s);

  return (
    <div className="rounded-md border border-border overflow-hidden">
      <Table>
        <TableHeader className="bg-secondary/60">
          <TableRow>
            <TableHead>SKU</TableHead>
            <TableHead>Lote</TableHead>
            <TableHead className="w-28">Cantidad</TableHead>
            <TableHead className="w-32">Precio unit.</TableHead>
            <TableHead className="text-right w-32">Subtotal</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {lineas.length === 0 && (
            <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Sin líneas. Puedes crear la orden vacía y añadir después.</TableCell></TableRow>
          )}
          {lineas.map((ln, idx) => {
            const l = findLote(state, ln.lote_id)!;
            const v = findVariante(state, l.variante_id)!;
            return (
              <TableRow key={ln.key}>
                <TableCell className="font-mono font-semibold">{v.sku}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{l.numero_lote}<div className="text-[11px]">Stock: {l.stock_actual}</div></TableCell>
                <TableCell><Input type="number" min={1} max={l.stock_actual} value={ln.cantidad} onChange={(e) => onUpdateLinea(idx, { cantidad: Math.max(1, Number(e.target.value)) })} className="h-8" /></TableCell>
                <TableCell><Input type="number" step="0.01" min={0} value={ln.precio} onChange={(e) => onUpdateLinea(idx, { precio: Number(e.target.value) })} className="h-8 font-mono" /></TableCell>
                <TableCell className="text-right font-mono tabular-nums">${(ln.cantidad * ln.precio).toFixed(2)}</TableCell>
                <TableCell><Button size="icon" variant="ghost" onClick={() => onRemoveLinea(idx)}><Trash2 className="size-4 text-destructive" /></Button></TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
