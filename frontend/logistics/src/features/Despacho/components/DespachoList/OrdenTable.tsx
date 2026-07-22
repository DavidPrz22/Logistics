import type { EstadoOrden } from "@/types/types";
import type { ListOrdenDespacho } from "../../schemas/schema";

import { EstadoBadge } from "@/components/shared/estado-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface OrdenTableProps {
  ordenes: ListOrdenDespacho[];
  onRowClick: (ordenId: number) => void;
}

export function OrdenTable({ ordenes, onRowClick }: OrdenTableProps) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader className="bg-secondary/60">
          <TableRow>
            <TableHead>Número</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Chofer</TableHead>
            <TableHead>Salida</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Facturado</TableHead>
            <TableHead className="text-right">Neto a cobrar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ordenes.length === 0 && (
            <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-12">Sin órdenes que coincidan con los filtros.</TableCell></TableRow>
          )}
          {ordenes.map((o) => (
            <TableRow
              key={o.numeroOrden}
              onClick={() => onRowClick(o.id)}
              className="cursor-pointer hover:bg-muted/40"
            >
              <TableCell className="font-mono font-semibold">{o.numeroOrden}</TableCell>
              <TableCell>{o.clienteNombre}</TableCell>
              <TableCell className="text-muted-foreground">{o.choferNombre}</TableCell>
              <TableCell className="text-muted-foreground tabular-nums">{new Date(o.FechaSalida).toLocaleDateString("es-DO")}</TableCell>
              <TableCell><EstadoBadge estado={o.estado as EstadoOrden} /></TableCell>
              <TableCell className="text-right font-mono tabular-nums">${o.totalFactudaroOriginal.toFixed(2)}</TableCell>
              <TableCell className="text-right font-mono tabular-nums font-semibold">${o.saldoNetoCobrar.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
