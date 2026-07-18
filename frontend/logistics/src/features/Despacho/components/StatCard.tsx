import { Card } from "@/components/ui/card";

export function StatCard({ label, value, mono, highlight }: { label: string; value: string | number; mono?: boolean; highlight?: boolean }) {
  return (
    <Card className="p-4">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-2 text-2xl font-bold tabular-nums ${mono ? "font-mono" : ""} ${highlight ? "text-accent-foreground" : ""}`}>{value}</div>
    </Card>
  );
}
