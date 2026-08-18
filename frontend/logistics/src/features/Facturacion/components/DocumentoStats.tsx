import { Card } from "@/components/ui/card";

interface DocumentoStatsProps {
  montoTotalBase: number;
  montoTotalVes: number | null;
  totalAbonado: number;
  totalPagadoBase: number;
  totalPagadoVes: number | null;
  saldoPendienteBase: number;
  saldoPendienteVes: number | null;
  tasaEmisionValor: number | null;
}

function formatCurrency(value: number, currency: "USD" | "VES"): string {
  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function Stat({
  label,
  valueUsd,
  valueVes,
}: {
  label: string;
  valueUsd: number;
  valueVes: number | null;
  strong?: boolean;
}) {
  return (
    <Card className="p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`flex flex-col mt-2 font-mono tabular-nums text-xl font-semibold`}>
        <span>
          {formatCurrency(valueUsd, "USD")}
        </span>
        <span >
          {valueVes !== null ? formatCurrency(valueVes, "VES") : "N/A"}
        </span>
      </div>
    </Card>
  );
}

export function DocumentoStats({
  montoTotalBase,
  montoTotalVes,
  totalAbonado,
  totalPagadoBase,
  totalPagadoVes,
  saldoPendienteBase,
  saldoPendienteVes,
  tasaEmisionValor,
}: DocumentoStatsProps) {
  // Calculate totalAbonadoVes using the emission rate
  const totalAbonadoVes = tasaEmisionValor !== null ? Math.round(totalAbonado * tasaEmisionValor * 100) / 100 : null;

  return (
    <div className="space-y-4">
      {tasaEmisionValor !== null && (
        <div className="text-sm text-muted-foreground">
          Tasa de emisión: <span className="font-mono font-semibold text-foreground">{tasaEmisionValor.toFixed(2)} Bs/$</span>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Stat label="Monto total" valueUsd={montoTotalBase} valueVes={montoTotalVes} />
        <Stat label="Monto Pagado total" valueUsd={totalPagadoBase} valueVes={totalPagadoVes} />
        <Stat label="Total abonado en Anticipos" valueUsd={totalAbonado} valueVes={totalAbonadoVes} />
        <Stat label="Saldo pendiente" valueUsd={saldoPendienteBase} valueVes={saldoPendienteVes} strong />
      </div>
    </div>
  );
}
