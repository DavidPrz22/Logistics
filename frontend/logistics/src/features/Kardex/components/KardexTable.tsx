import { Link } from '@tanstack/react-router';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { KardexMovimientoRow } from '../schemas/schemas';

export function CardexTable({ rows }: { rows: KardexMovimientoRow[] }) {
  return (
    <div className="max-h-[62vh] overflow-auto rounded-lg border border-border bg-card">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-secondary">
          <TableRow>
            <TableHead>Fecha / hora</TableHead>
            <TableHead>Documento</TableHead>
            <TableHead>Operación</TableHead>
            <TableHead>Lote</TableHead>
            <TableHead>Almacén</TableHead>
            <TableHead className="text-right">Cantidad</TableHead>
            <TableHead className="text-right">Costo unit.</TableHead>
            <TableHead className="text-right">Saldo final</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={8}
                className="py-10 text-center text-muted-foreground"
              >
                Sin movimientos para los filtros aplicados.
              </TableCell>
            </TableRow>
          )}
          {rows.map((r) => (
            <TableRow key={r.id} className="hover:bg-muted/40">
              <TableCell className="font-mono text-xs tabular-nums text-muted-foreground">
                {new Date(r.fechaMovimiento).toLocaleString('es-DO')}
              </TableCell>
              <TableCell className="text-sm">
                {r.ordenId ? (
                  <Link
                    to="/despachos/$ordenId"
                    params={{ ordenId: String(r.ordenId) }}
                    className="underline decoration-accent/50 hover:decoration-accent"
                  >
                    {r.documento}
                  </Link>
                ) : (
                  r.documento
                )}
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-semibold uppercase ${r.tipoMovimiento === 'ENTRADA' ? 'text-[color:var(--status-liq)]' : 'text-[color:var(--status-ruta)]'}`}
                >
                  {r.tipoMovimiento === 'ENTRADA' ? (
                    <ArrowDownRight className="size-3.5" />
                  ) : (
                    <ArrowUpRight className="size-3.5" />
                  )}
                  {r.operacion}
                </span>
              </TableCell>
              <TableCell className="font-mono text-sm text-muted-foreground">
                {r.numeroLote}
              </TableCell>
              <TableCell className="text-sm">{r.almacen.nombre}</TableCell>
              <TableCell
                className={`text-right font-mono font-semibold tabular-nums ${r.tipoMovimiento === 'ENTRADA' ? 'text-[color:var(--status-liq)]' : 'text-[color:var(--status-ruta)]'}`}
              >
                {r.tipoMovimiento === 'ENTRADA' ? '+' : '−'}
                {r.cantidad}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
                {r.costoUnitario.toFixed(2)}
              </TableCell>
              <TableCell className="text-right font-mono font-bold tabular-nums">
                {r.saldo}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
