import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import type { LineaBorrador } from "../../types/types";

interface LineaBorradorTableProps {
  lineas: LineaBorrador[];
  onUpdateLinea: (idx: number, patch: Partial<LineaBorrador>) => void;
  onRemoveLinea: (idx: number) => void;
}

export function LineaBorradorTable({ lineas, onUpdateLinea, onRemoveLinea }: LineaBorradorTableProps) {
  const handleCantidadChange = (idx: number, value: string) => {
    onUpdateLinea(idx, { cantidad: value });
  };

  const handleCantidadBlur = (idx: number, value: number | string, stockActual: number) => {
    const numValue = Number(value);
    if (numValue > stockActual) {
      toast.error(`Cantidad no disponible. Stock máximo: ${stockActual}`);
      onUpdateLinea(idx, { cantidad: stockActual });
    } else if (numValue < 1 || isNaN(numValue)) {
      onUpdateLinea(idx, { cantidad: 0 });
    } else {
      onUpdateLinea(idx, { cantidad: numValue });
    }
  };

  const handlePrecioChange = (idx: number, value: string) => {
    onUpdateLinea(idx, { precio: value });
  }

  const handlePrecioBlur = (idx: number, price: number | string) => {
    const numValue = Number(price);
    if (numValue <= 0 || isNaN(numValue)) {
      toast.error(`El precio unitario debe ser mayor a 0`);
      onUpdateLinea(idx, { precio: 0 });
    } else {
      onUpdateLinea(idx, { precio: numValue });
    }
  }

  return (
    <div className="rounded-md border border-border overflow-hidden">
      <Table>
        <TableHeader className="bg-secondary/60">
          <TableRow>
            <TableHead>SKU</TableHead>
            <TableHead>Producto</TableHead>
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
            return (
              <TableRow key={ln.key}>
                <TableCell className="font-mono font-semibold">{ln.sku}</TableCell>
                <TableCell className="font-mono font-semibold">{ln.variante_nombre}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{ln.numero_lote}<div className="text-[11px]">Stock: {ln.stock_actual}</div></TableCell>
                <TableCell>
                  <Input 
                    type="number" 
                    min={1} 
                    max={ln.stock_actual} 
                    value={ln.cantidad} 
                    onChange={(e) => handleCantidadChange(idx, e.target.value)} 
                    onBlur={() => handleCantidadBlur(idx, ln.cantidad, ln.stock_actual)}
                    className="h-8" 
                  />
                </TableCell>
                <TableCell>
                  <Input 
                    type="number" 
                    step="0.01" 
                    min={0} 
                    value={ln.precio} 
                    onChange={(e) => handlePrecioChange(idx, e.target.value)} 
                    onBlur={() => handlePrecioBlur(idx, ln.precio)}
                    className="h-8 font-mono" />
                    </TableCell>
                <TableCell className="text-right font-mono tabular-nums">${(Number(ln.cantidad) * Number(ln.precio)).toFixed(2)}</TableCell>
                <TableCell><Button type="button" size="icon" variant="ghost" onClick={() => onRemoveLinea(idx)}><Trash2 className="size-4 text-destructive" /></Button></TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
