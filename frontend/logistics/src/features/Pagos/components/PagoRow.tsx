interface PagoRowProps {
  label: string;
  value: string;
}

export function PagoRow({ label, value }: PagoRowProps) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-mono tabular-nums wrap-break-words">{value}</div>
    </div>
  );
}
