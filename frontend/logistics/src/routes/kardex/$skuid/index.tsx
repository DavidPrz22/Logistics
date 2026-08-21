import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { CardexSearch } from '@/features/Kardex/components/KardexSearch';
import { CardexFilters, type TipoFiltro } from '@/features/Kardex/components/KardexFilters';
import { CardexTable, type CardexRow } from '@/features/Kardex/components/KardexTable';
import { useKardexSearchStore } from '@/features/Kardex/store/zustandstore';

export const Route = createFileRoute('/kardex/$skuid/')({
  component: CardexDetailView,
});

function CardexDetailView() {
  const { skuId } = Route.useParams();
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [tipo, setTipo] = useState<TipoFiltro>('TODOS');
  const [almacen, setAlmacen] = useState('ALL');
  const { addRecent } = useKardexSearchStore();

  useEffect(() => {
    if (skuId) {
      addRecent({
        id: Date.now(),
        sku: skuId,
        nombre: 'SKU ' + skuId,
        productName: 'Producto',
      });
    }
  }, [skuId, addRecent]);

  const rows: CardexRow[] = [];

  return (
    <div className="mx-auto max-w-350 space-y-6 p-8">
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link to="/inventario/stock" className="hover:text-foreground">Inventario</Link>
        <ChevronRight className="size-3.5" />
        <Link to="/kardex" className="hover:text-foreground">Kardex</Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground">{skuId}</span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Kardex de SKU</h1>
          <p className="text-sm text-muted-foreground">
            Variante activa: <span className="font-mono font-semibold text-foreground">{skuId}</span>
          </p>
        </div>
        <div className="flex w-full max-w-xl items-center gap-2">
          <div className="flex-1"><CardexSearch /></div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Existencia actual</div>
          <div className="mt-1 font-mono text-2xl font-bold tabular-nums">0</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Entradas (filtro)</div>
          <div className="mt-1 font-mono text-2xl font-bold tabular-nums">0</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Salidas (filtro)</div>
          <div className="mt-1 font-mono text-2xl font-bold tabular-nums">0</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Movimientos (filtro)</div>
          <div className="mt-1 font-mono text-2xl font-bold tabular-nums">0</div>
        </div>
      </div>

      <CardexFilters
        desde={desde} hasta={hasta} tipo={tipo} almacen={almacen}
        almacenes={[]}
        onDesde={setDesde} onHasta={setHasta} onTipo={setTipo} onAlmacen={setAlmacen}
        onReset={() => { setDesde(''); setHasta(''); setTipo('TODOS'); setAlmacen('ALL'); }}
      />

      <CardexTable rows={rows} />
    </div>
  );
}