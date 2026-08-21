import { Card } from "@/components/ui/card";

interface PagoStatProps {
  label: string;
  value: string;
  strong?: boolean;
}

export function PagoStat({ label, value, strong }: PagoStatProps) {
  return (
    <Card className="p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-2 font-mono tabular-nums ${strong ? "text-3xl font-bold" : "text-2xl font-semibold"}`}>{value}</div>
    </Card>
  );
}
