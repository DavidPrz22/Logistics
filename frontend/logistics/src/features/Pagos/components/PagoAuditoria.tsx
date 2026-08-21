import { Card } from "@/components/ui/card";
import { PagoRow } from "./PagoRow";
import { fechaCorta } from "../lib/helpers";

interface PagoAuditoriaProps {
  usuario: string;
  fecha: string;
}

export function PagoAuditoria({ usuario, fecha }: PagoAuditoriaProps) {
  return (
    <Card className="p-6 space-y-2">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Auditoría</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <PagoRow label="Registrado por" value={usuario} />
        <PagoRow label="Timestamp" value={fechaCorta(fecha)} />
      </div>
    </Card>
  );
}
