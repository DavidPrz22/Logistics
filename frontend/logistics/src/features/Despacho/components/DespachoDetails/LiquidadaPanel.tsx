import { CheckCircle2, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { DetalleOrdenDetail, DetalleRechazoOrden, DocumentoDeudaDetail } from "@/features/Despacho/schemas/schema";
import type { TasaCambio } from "@/types/zodType";
import { DetallesTable } from "../DetallesTable";
import { EstadoDocumentoBadge } from "@/components/shared/estado-badge";
import { Link } from "@tanstack/react-router";
interface LiquidadaPanelProps {
  detalles: DetalleOrdenDetail[];
  rechazos: DetalleRechazoOrden[];
  documentoDeuda: DocumentoDeudaDetail | null;
  tasaCambio?: TasaCambio | null;
}

export function LiquidadaPanel({ detalles, rechazos, documentoDeuda, tasaCambio }: LiquidadaPanelProps) {
  const tasaValor = tasaCambio ? Number(tasaCambio.tasa) : 0;
  const showVES = tasaValor > 0;


  return (
    <div className="space-y-4">
      {documentoDeuda && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-border bg-(--status-liq-bg)/50 flex items-center gap-2">
            <div className="flex gap-4">
              <div className="flex items-center gap-1">
                <FileText className="size-4 text-(--status-liq)" />
                <h2 className="font-semibold">Factura generada</h2>
              </div>
              <Link to='/facturacion/$id' params={{ id: String(documentoDeuda.id) }} className='inline-flex items-center underline gap-1 text-sm  hover:text-foreground'>
                Ver factura
              </Link>
            </div>
            
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
        <DetallesTable detalles={detalles} showSubtotal showSubtotalRechazo tasaCambio={tasaCambio} />
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
              <TableHead className="text-right">Monto Rechazado</TableHead>
              {showVES && <TableHead className="text-right">Monto VES</TableHead>}
            </TableRow></TableHeader>
            <TableBody>
              {rechazos.map((r) => {
                const detalleRechazo = detalles.find(d => d.id === r.detalleOrdenId);
                const precioUnitario = detalleRechazo?.precioUnitario ?? 0;
                const montoRechazado = r.cantidadRechazada * precioUnitario;
                const precioUnitarioVes = detalleRechazo?.precioUnitarioVes ?? (precioUnitario * tasaValor);
                const montoRechazadoVes = r.cantidadRechazada * precioUnitarioVes;
                return (
                  <TableRow key={r.id}>
                    <TableCell><div className="font-mono font-semibold">{detalleRechazo?.sku}</div>
                    <div className="text-xs text-muted-foreground">{detalleRechazo?.numeroLote}</div></TableCell>
                    <TableCell className="text-right font-mono tabular-nums">{r.cantidadRechazada}</TableCell>
                    <TableCell><span className="font-mono text-xs bg-secondary px-1.5 py-0.5 rounded mr-1">{r?.motivoRechazoCodigo}</span>{r.motivoRechazoDescripcion}</TableCell>
                    <TableCell>{r?.almacenReingresoNombre}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.observaciones ?? "—"}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">${montoRechazado.toFixed(2)}</TableCell>
                    {showVES && <TableCell className="text-right font-mono tabular-nums text-muted-foreground">Bs. {montoRechazadoVes.toFixed(2)}</TableCell>}
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
