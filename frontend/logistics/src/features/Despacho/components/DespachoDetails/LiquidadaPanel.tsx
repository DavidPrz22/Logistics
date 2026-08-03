import { CheckCircle2, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { DetalleOrdenDetail, DetalleRechazoOrden, DocumentoDeudaDetail } from "@/features/Despacho/schemas/schema";
import { DetallesTable } from "../DetallesTable";
import { EstadoDocumentoBadge } from "@/components/shared/estado-badge";

interface LiquidadaPanelProps {
  detalles: DetalleOrdenDetail[];
  rechazos: DetalleRechazoOrden[];
  documentoDeuda: DocumentoDeudaDetail | null;
}

export function LiquidadaPanel({ detalles, rechazos, documentoDeuda }: LiquidadaPanelProps) {

  return (
    <div className="space-y-4">
      {documentoDeuda && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-border bg-(--status-liq-bg)/50 flex items-center gap-2">
            <FileText className="size-4 text-(--status-liq)" />
            <h2 className="font-semibold">Factura generada</h2>
            <div className="ml-auto">
              <EstadoDocumentoBadge estado={documentoDeuda.estado} />
            </div>
          </div>
        </Card>
      )}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-border bg-(--status-liq-bg)/50 flex items-center gap-2">
          <CheckCircle2 className="size-4 text-(--status-liq)" />
          <h2 className="font-semibold">Operación cerrada — resumen de carga</h2>
        </div>
        <DetallesTable detalles={detalles} showSubtotal showSubtotalRechazo />
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
