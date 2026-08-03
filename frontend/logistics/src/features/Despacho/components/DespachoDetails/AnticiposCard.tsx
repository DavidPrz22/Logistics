import { DollarSign } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AnticipoDetail } from "@/features/Despacho/schemas/schema";

interface AnticiposCardProps {
  anticipos: AnticipoDetail[];
}

export function AnticiposCard({ anticipos }: AnticiposCardProps) {
  const totalAnticipado = anticipos.reduce((sum, a) => sum + a.montoEquivalenteBase, 0);

  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b border-border bg-(--status-enruta-bg)/30 flex items-center gap-2">
        <DollarSign className="size-4 text-(--status-enruta)" />
        <h2 className="font-semibold">Pagos anticipados</h2>
      </div>
      <Table>
        <TableHeader className="bg-secondary/60">
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Método</TableHead>
            <TableHead>Referencia</TableHead>
            <TableHead className="text-right">Monto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {anticipos.map((anticipo) => (
            <TableRow key={anticipo.id}>
              <TableCell className="text-sm">
                {new Date(anticipo.fechaPago).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-sm">{anticipo.metodoPagoDescripcion}</TableCell>
              <TableCell className="text-sm font-mono">
                {anticipo.numeroReferencia ?? "—"}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                ${anticipo.montoEquivalenteBase.toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell colSpan={3} className="text-right font-semibold">
              Total anticipado
            </TableCell>
            <TableCell className="text-right font-mono tabular-nums font-semibold">
              ${totalAnticipado.toFixed(2)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>
  );
}
