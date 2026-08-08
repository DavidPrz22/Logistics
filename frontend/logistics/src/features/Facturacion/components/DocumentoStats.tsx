import { Card } from "@/components/ui/card";

interface DocumentoStatsProps {
  montoTotalBase: string;
  totalAbonado: string;
  saldoPendienteBase: string;
}

function Stat({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <Card className="p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-2 font-mono tabular-nums ${strong ? "text-3xl font-bold" : "text-2xl font-semibold"}`}>{value}</div>
    </Card>
  );
}

export function DocumentoStats({ montoTotalBase, totalAbonado, saldoPendienteBase }: DocumentoStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Stat label="Monto total base" value={montoTotalBase} />
      <Stat label="Total abonado" value={totalAbonado} />
      <Stat label="Saldo pendiente" value={saldoPendienteBase} strong />
    </div>
  );
}
