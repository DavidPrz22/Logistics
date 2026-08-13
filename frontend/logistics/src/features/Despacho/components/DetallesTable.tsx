import type { DetalleOrdenDetail } from ".././schemas/schema";
import type { TasaCambio } from "@/types/zodType";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface DetallesTableProps {
  detalles: DetalleOrdenDetail[];
  showSubtotal?: boolean;
  showSubtotalRechazo?: boolean;
  tasaCambio?: TasaCambio | null;
}

export function DetallesTable({ detalles, showSubtotal, showSubtotalRechazo, tasaCambio }: DetallesTableProps) {
  const tasaValor = tasaCambio ? Number(tasaCambio.tasa) : 0;
  const showVES = tasaValor > 0;

  return (
    <Table>
      <TableHeader className="bg-secondary/60">
        <TableRow>
          <TableHead>SKU</TableHead>
          <TableHead>Producto</TableHead>
          <TableHead>Lote</TableHead>
          <TableHead className="text-right">Cantidad</TableHead>
          <TableHead className="text-right">Precio</TableHead>
          {showVES && <TableHead className="text-right">Precio VES</TableHead>}
          {showSubtotal && <TableHead className="text-right">Subtotal</TableHead>}
          {showSubtotal && showVES && <TableHead className="text-right">Subtotal VES</TableHead>}
          {showSubtotal && showSubtotalRechazo && <TableHead className="text-right">Monto Rechazado</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {detalles.length === 0 && <TableRow><TableCell colSpan={showSubtotal ? (showVES ? 8 : 6) : (showVES ? 6 : 5)} className="text-center text-muted-foreground py-8">Sin componentes.</TableCell></TableRow>}
        {detalles.map((d) => {
          const precioVes = showVES ? d.precioUnitarioVes ?? (d.precioUnitario * tasaValor) : 0;
          const subtotalVes = showVES ? d.subtotalVes ?? (d.cantidadEnviada * precioVes) : 0;
          const subtotalRechazo = showSubtotalRechazo ? (d.rechazos.reduce((acc, current) => acc + current.cantidadRechazada, 0) * d.precioUnitario) : 0;
          return (
            <TableRow key={d.id}>
              <TableCell className="font-mono font-semibold">{d.sku}</TableCell>
              <TableCell>{d.varianteNombre}</TableCell>
              <TableCell className="text-muted-foreground text-sm">{d.numeroLote}<div className="text-[11px]">Stock: {d.stockActualLote}</div></TableCell>
              <TableCell className="text-right tabular-nums">{d.cantidadEnviada}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">${d.precioUnitario.toFixed(2)}</TableCell>
              {showVES && <TableCell className="text-right font-mono tabular-nums text-muted-foreground">Bs. {precioVes.toFixed(2)}</TableCell>}
              {showSubtotal && <TableCell className="text-right font-mono tabular-nums">${(d.cantidadEnviada * d.precioUnitario).toFixed(2)}</TableCell>}
              {showSubtotal && showVES && <TableCell className="text-right font-mono tabular-nums text-muted-foreground">Bs. {subtotalVes.toFixed(2)}</TableCell>}
              {showSubtotalRechazo && 
              <TableCell className="text-right font-mono tabular-nums">
                <div>Bs. {(subtotalRechazo * tasaValor).toFixed(2)}</div>
                ${subtotalRechazo.toFixed(2)}
              </TableCell>}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
