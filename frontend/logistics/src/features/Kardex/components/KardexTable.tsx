import { Link } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export interface CardexRow {
  id: number;
  fecha: string;
  documento: string;
  ordenId?: number;
  operacion: string;
  tipo: "ENTRADA" | "SALIDA";
  cantidad: number;
  costoUnitario: number;
  lote: string;
  almacen: string;
  saldo: number;
}

const money = (n: number) => n.toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function CardexTable({ rows }: { rows: CardexRow[] }) {
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
            <TableRow><TableCell colSpan={8} className="py-10 text-center text-muted-foreground">Sin movimientos para los filtros aplicados.</TableCell></TableRow>
          )}
          {rows.map((r) => (
            <TableRow key={r.id} className="hover:bg-muted/40">
              <TableCell className="font-mono text-xs tabular-nums text-muted-foreground">{new Date(r.fecha).toLocaleString("es-DO")}</TableCell>
              <TableCell className="text-sm">
                {r.ordenId ? (
                  <Link to="/despachos/$ordenId" params={{ ordenId: String(r.ordenId) }} className="underline decoration-accent/50 hover:decoration-accent">{r.documento}</Link>
                ) : r.documento}
              </TableCell>
              <TableCell>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold uppercase ${r.tipo === "ENTRADA" ? "text-[color:var(--status-liq)]" : "text-[color:var(--status-ruta)]"}`}>
                  {r.tipo === "ENTRADA" ? <ArrowDownRight className="size-3.5" /> : <ArrowUpRight className="size-3.5" />}
                  {r.operacion}
                </span>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{r.lote}</TableCell>
              <TableCell className="text-sm">{r.almacen}</TableCell>
              <TableCell className={`text-right font-mono font-semibold tabular-nums ${r.tipo === "ENTRADA" ? "text-[color:var(--status-liq)]" : "text-[color:var(--status-ruta)]"}`}>
                {r.tipo === "ENTRADA" ? "+" : "−"}{r.cantidad}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums text-muted-foreground">{money(r.costoUnitario)}</TableCell>
              <TableCell className="text-right font-mono font-bold tabular-nums">{r.saldo}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
