import { Package, ArrowDownLeft, ArrowUpRight, Activity } from 'lucide-react';

interface KPI {
  label: string;
  value: number;
  icon: React.ReactNode;
  colorClass?: string;
}

function KPICard({ label, value, icon, colorClass }: KPI) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className={`flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground ${colorClass ?? ''}`}>
        {icon}
        {label}
      </div>
      <div className={`mt-1 font-mono text-2xl font-bold tabular-nums ${colorClass ?? ''}`}>
        {value}
      </div>
    </div>
  );
}

function KPICardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <span className="size-3.5" />
        <span className="inline-block h-3 w-24 animate-pulse rounded bg-muted" />
      </div>
      <div className="mt-1">
        <span className="inline-block h-8 w-16 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

export function KardexKPIs({
  existencia,
  entradas,
  salidas,
  movimientos,
  isLoading,
}: {
  existencia: number;
  entradas: number;
  salidas: number;
  movimientos: number;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KPICardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const kpis: KPI[] = [
    {
      label: 'Existencia actual',
      value: existencia,
      icon: <Package className="size-3.5" />,
    },
    {
      label: 'Entradas (filtro)',
      value: entradas,
      icon: <ArrowDownLeft className="size-3.5" />,
      colorClass: 'text-(--status-liq)',
    },
    {
      label: 'Salidas (filtro)',
      value: salidas,
      icon: <ArrowUpRight className="size-3.5" />,
      colorClass: 'text-(--status-liq)',
    },
    {
      label: 'Movimientos (filtro)',
      value: movimientos,
      icon: <Activity className="size-3.5" />,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <KPICard key={kpi.label} {...kpi} />
      ))}
    </div>
  );
}
