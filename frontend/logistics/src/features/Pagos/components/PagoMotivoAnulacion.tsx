import { Card } from "@/components/ui/card";

interface PagoMotivoAnulacionProps {
  motivo: string;
}

export function PagoMotivoAnulacion({ motivo }: PagoMotivoAnulacionProps) {
  return (
    <Card className="p-4 border-destructive/30 bg-destructive/5">
      <div className="text-xs uppercase tracking-wider text-destructive font-semibold">Motivo de anulación</div>
      <div className="mt-1 text-sm">{motivo}</div>
    </Card>
  );
}
