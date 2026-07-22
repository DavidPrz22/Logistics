import type { DetalleOrdenDetail } from ".././schemas/schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function DetallesTable({ detalles, showSubtotal }: { detalles: DetalleOrdenDetail[]; showSubtotal?: boolean }) {
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
          return (
            <TableRow key={d.id}>
              <TableCell className="font-mono font-semibold">{d.sku}</TableCell>
              <TableCell>{d.varianteNombre}</TableCell>
              <TableCell className="text-muted-foreground text-sm">{d.numeroLote}<div className="text-[11px]">Stock: {d.stockActualLote}</div></TableCell>
              <TableCell className="text-right tabular-nums">{d.cantidadEnviada}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">${d.precioUnitario.toFixed(2)}</TableCell>
              {showSubtotal && <TableCell className="text-right font-mono tabular-nums">${(d.cantidadEnviada * d.precioUnitario).toFixed(2)}</TableCell>}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
