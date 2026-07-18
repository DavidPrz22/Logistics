import { CheckCircle2 } from "lucide-react";
import { useERP, findLote, findMotivo, findVariante } from "@/lib/erp-store";
import { useAlmacenes } from "@/hooks/queries/queries";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { DetalleOrden, DetalleRechazo } from "@/types/types";
import { DetallesTable } from "../DetallesTable";

interface LiquidadaPanelProps {
  detalles: DetalleOrden[];
  rechazos: DetalleRechazo[];
}

export function LiquidadaPanel({ detalles, rechazos }: LiquidadaPanelProps) {
  const state = useERP((s) => s);
  const { data: almacenes = [] } = useAlmacenes();

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-border bg-[color:var(--status-liq-bg)]/50 flex items-center gap-2">
          <CheckCircle2 className="size-4 text-[color:var(--status-liq)]" />
          <h2 className="font-semibold">Operación cerrada — resumen de carga</h2>
        </div>
        <DetallesTable detalles={detalles} showSubtotal />
      </Card>
      {rechazos.length > 0 && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-border"><h2 className="font-semibold">Retornos registrados</h2></div>
          <Table>
            <TableHeader className="bg-secondary/60"><TableRow>
              <TableHead>SKU / Lote</TableHead><TableHead className="text-right">Cantidad</TableHead><TableHead>Motivo</TableHead><TableHead>Reingreso</TableHead><TableHead>Observaciones</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {rechazos.map((r) => {
                const d = detalles.find((x) => x.id === r.detalle_orden_id); if (!d) return null;
                const l = findLote(state, d.lote_id); const v = l ? findVariante(state, l.variante_id) : undefined;
                const m = findMotivo(state, r.motivo_rechazo_id); const al = almacenes.find((x) => x.id === r.almacen_reingreso_id);
                return (
                  <TableRow key={r.id}>
                    <TableCell><div className="font-mono font-semibold">{v?.sku}</div><div className="text-xs text-muted-foreground">{l?.numero_lote}</div></TableCell>
                    <TableCell className="text-right font-mono tabular-nums">{r.cantidad_rechazada}</TableCell>
                    <TableCell><span className="font-mono text-xs bg-secondary px-1.5 py-0.5 rounded mr-1">{m?.codigo}</span>{m?.descripcion}</TableCell>
                    <TableCell>{al?.nombre}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.observaciones ?? "—"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
