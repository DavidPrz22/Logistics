import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { DetalleOrdenDetail, DetalleRechazoOrden } from "@/features/Despacho/schemas/schema";
import { DetallesTable } from "../DetallesTable";

interface LiquidadaPanelProps {
  detalles: DetalleOrdenDetail[];
  rechazos: DetalleRechazoOrden[];
}

export function LiquidadaPanel({ detalles, rechazos }: LiquidadaPanelProps) {

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-border bg-(--status-liq-bg)/50 flex items-center gap-2">
          <CheckCircle2 className="size-4 text-(--status-liq)" />
          <h2 className="font-semibold">Operación cerrada — resumen de carga</h2>
        </div>
        <DetallesTable detalles={detalles} showSubtotal />
      </Card>
      {rechazos.length > 0 && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-border"><h2 className="font-semibold">Retornos registrados</h2></div>
          <Table>
            <TableHeader className="bg-secondary/60"><TableRow>
              <TableHead>SKU / Lote</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
              <TableHead>Motivo</TableHead>
              <TableHead>Reingreso</TableHead>
              <TableHead>Observaciones</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {rechazos.map((r) => {
                const detalleRechazo = detalles.find(d => d.id === r.detalleOrdenId)
                return (
                  <TableRow key={r.id}>
                    <TableCell><div className="font-mono font-semibold">{detalleRechazo?.sku}</div>
                    <div className="text-xs text-muted-foreground">{detalleRechazo?.numeroLote}</div></TableCell>
                    <TableCell className="text-right font-mono tabular-nums">{r.cantidadRechazada}</TableCell>
                    <TableCell><span className="font-mono text-xs bg-secondary px-1.5 py-0.5 rounded mr-1">{r?.motivoRechazoCodigo}</span>{r.motivoRechazoDescripcion}</TableCell>
                    <TableCell>{r?.almacenReingresoNombre}</TableCell>
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
