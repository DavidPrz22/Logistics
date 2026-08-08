import { Link } from "@tanstack/react-router";
import { PagoEstadoBadge } from "@/components/shared/factura-badges";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fechaCorta } from "@/features/Facturacion/lib/helpers";
import type { PagosVinculadosDocumentoType } from "@/features/Facturacion/schemas/schemas";

interface PagosTableProps {
  transacciones: PagosVinculadosDocumentoType[];
}

export function PagosTable({ transacciones }: PagosTableProps) {
  return (
    <Card className="p-6 space-y-4">
      <div>
        <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Pagos vinculados</h2>
        <p className="text-xs text-muted-foreground mt-1">Haz clic en el ID de la transacción para ver su detalle completo.</p>
      </div>
      <div className="rounded-md border border-border overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/60">
            <TableRow>
              <TableHead className="w-24">ID</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Referencia</TableHead>
              <TableHead>Cuenta destino</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Monto origen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transacciones.length === 0 && (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-10">Sin pagos registrados para este documento.</TableCell></TableRow>
            )}
            {transacciones.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <Link to="/pagos/$pagoId" params={{ pagoId: String(p.id) }} className="font-mono font-semibold text-primary underline-offset-2 hover:underline">
                    #{p.id}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground tabular-nums">{fechaCorta(p.fechaPago)}</TableCell>
                <TableCell className="text-xs">{p.tipoDePago.replace(/_/g, " ")}</TableCell>
                <TableCell>{p.metodoPago}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{p.numeroReferencia ?? "—"}</TableCell>
                <TableCell className="text-sm">{p.cuentaDestino}</TableCell>
                <TableCell><PagoEstadoBadge estado={p.estado} /></TableCell>
                <TableCell className="text-right font-mono tabular-nums">{p.montoOrigen.toFixed(2)} {p.divisaPago}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
