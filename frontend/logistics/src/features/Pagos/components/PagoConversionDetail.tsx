import { Card } from "@/components/ui/card";

interface PagoConversionDetailProps {
  tasaAplicada: {
    divisaOrigen: { codigo: string };
    divisaDestino: { codigo: string };
    tasa: number;
  };
}

export function PagoConversionDetail({ tasaAplicada }: PagoConversionDetailProps) {
  return (
    <Card className="p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Detalle de conversión</div>
      <div className="text-sm">
        <span className="font-mono">{tasaAplicada.divisaOrigen.codigo}</span>
        {" → "}
        <span className="font-mono">{tasaAplicada.divisaDestino.codigo}</span>
        {" · Tasa: "}
        <span className="font-mono font-semibold">{tasaAplicada.tasa.toFixed(4)}</span>
      </div>
    </Card>
  );
}
