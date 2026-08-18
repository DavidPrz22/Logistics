import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DocEstadoBadge, TipoDocBadge } from "@/components/shared/factura-badges";
import { fechaCorta } from "../../lib/helpers";
import type { DocumentoDeudaListado } from "../../schemas/schemas";

interface FacturacionTableProps {
  facturas: DocumentoDeudaListado[];
  isLoading: boolean;
  isFetching: boolean;
  onRowClick: (id: number) => void;
}

export function FacturacionTable({ facturas, isLoading, isFetching, onRowClick }: FacturacionTableProps) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader className="bg-secondary/60">
          <TableRow>
            <TableHead className="w-20">ID</TableHead>
            <TableHead>Orden</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Origen</TableHead>
            <TableHead>Emisión</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Monto total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className={isFetching ? "opacity-50 pointer-events-none transition-opacity" : "transition-opacity"}>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-12">Cargando documentos...</TableCell>
            </TableRow>
          )}
          {!isLoading && facturas.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-12">Sin documentos que coincidan con los filtros.</TableCell>
            </TableRow>
          )}
          {facturas.map((d) => (
            <TableRow
              key={d.id}
              onClick={() => onRowClick(d.id)}
              className="cursor-pointer hover:bg-muted/40"
            >
              <TableCell className="font-mono text-muted-foreground">#{d.id}</TableCell>
              <TableCell className="font-mono font-semibold">{d.numeroOrden}</TableCell>
              <TableCell>{d.identificadorCliente}</TableCell>
              <TableCell><TipoDocBadge tipo={d.tipoDocumento} /></TableCell>
              <TableCell className="text-xs text-muted-foreground">{d.sistemaOrigen === "RUTA_LIQUIDADA" ? "Ruta liquidada" : "Venta mostrador"}</TableCell>
              <TableCell className="text-muted-foreground tabular-nums">{fechaCorta(d.fechaEmision)}</TableCell>
              <TableCell><DocEstadoBadge estado={d.estado} /></TableCell>
              <TableCell className="text-right font-mono tabular-nums">${d.montoTotalBase}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
