interface StatMiniProps {
  label: string;
  value: string | number;
}

export function StatMini({ label, value }: StatMiniProps) {
  return (
    <div className="rounded-md border border-border bg-secondary/40 p-3 flex-1">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-mono tabular-nums font-semibold truncate">{value}</div>
    </div>
  );
}
