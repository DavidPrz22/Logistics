import { ClipboardList } from 'lucide-react';

export function KardexPageHeader() {
  return (
    <div className="space-y-3 text-center">
      <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        <ClipboardList className="size-3.5" /> Módulo de inventario · Auditoría
      </span>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Kárdex e historial de movimientos
      </h1>
      <p className="mx-auto max-w-xl text-sm text-muted-foreground">
        Busca un producto o SKU para ver su historial completo de entradas, salidas y saldo resultante.
      </p>
    </div>
  );
}
