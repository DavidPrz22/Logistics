import { useERP, findLote, findVariante } from "@/lib/erp-store";
import type { DetalleOrden } from "@/types/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function DetallesTable({ detalles, showSubtotal }: { detalles: DetalleOrden[]; showSubtotal?: boolean }) {
  const state = useERP((s) => s);
  return (
    <Table>
      <TableHeader className="bg-secondary/60">
        <TableRow>
          <TableHead>SKU</TableHead>
          <TableHead>Producto</TableHead>
          <TableHead>Lote</TableHead>
          <TableHead className="text-right">Cantidad</TableHead>
          <TableHead className="text-right">Precio</TableHead>
          {showSubtotal && <TableHead className="text-right">Subtotal</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {detalles.length === 0 && <TableRow><TableCell colSpan={showSubtotal ? 6 : 5} className="text-center text-muted-foreground py-8">Sin componentes.</TableCell></TableRow>}
        {detalles.map((d) => {
          const l = findLote(state, d.lote_id); const v = l ? findVariante(state, l.variante_id) : undefined;
          return (
            <TableRow key={d.id}>
              <TableCell className="font-mono font-semibold">{v?.sku}</TableCell>
              <TableCell>{v?.nombre}</TableCell>
              <TableCell className="text-muted-foreground text-sm">{l?.numero_lote}</TableCell>
              <TableCell className="text-right tabular-nums">{d.cantidad_enviada}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">${d.precio_unitario.toFixed(2)}</TableCell>
              {showSubtotal && <TableCell className="text-right font-mono tabular-nums">${(d.cantidad_enviada * d.precio_unitario).toFixed(2)}</TableCell>}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
