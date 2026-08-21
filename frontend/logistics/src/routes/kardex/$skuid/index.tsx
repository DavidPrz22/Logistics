import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { ChevronRight, AlertCircle, Package, ArrowDownLeft, ArrowUpRight, Activity } from 'lucide-react';
import { CardexSearch } from '@/features/Kardex/components/KardexSearch';
import { CardexFilters, type TipoFiltro } from '@/features/Kardex/components/KardexFilters';
import { CardexTable } from '@/features/Kardex/components/KardexTable';
import { VariantSelector } from '@/features/Kardex/components/KardexVariantSelector';
import { useKardexSearchStore } from '@/features/Kardex/store/zustandstore';
import { useKardexDetail } from '@/features/Kardex/hooks/queries/queries';
import { useAlmacenes } from '@/hooks/queries/queries';
import type { KardexMovimientoRow } from '@/features/Kardex/schemas/schemas';

export const Route = createFileRoute('/kardex/$skuid/')({
  component: CardexDetailView,
});

function CardexDetailView() {
  const { skuid } = Route.useParams();
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [tipo, setTipo] = useState<TipoFiltro>('TODOS');
  const [almacen, setAlmacen] = useState('ALL');
  const { addRecent } = useKardexSearchStore();

  const { data, isLoading, isError, error } = useKardexDetail(skuid);
  const { data: almacenesData } = useAlmacenes();

  const almacenesOptions = useMemo(
    () =>
      (almacenesData ?? []).map((a) => ({
        value: String(a.id),
        label: a.nombre,
        hint: a.tipo,
      })),
    [almacenesData]
  );

  useEffect(() => {
    if (data) {
      addRecent({
        id: data.varianteActual.id,
        sku: data.varianteActual.sku,
        nombre: data.varianteActual.nombre,
        productName: data.producto.nombre,
      });
    }
  }, [data, addRecent]);

  const filteredRows = useMemo(() => {
    if (!data?.movimientos) return [];

    return data.movimientos.filter((r: KardexMovimientoRow) => {
      if (almacen !== 'ALL' && String(r.almacen.id) !== almacen) return false;

      if (tipo === 'ENTRADAS' && r.tipoMovimiento !== 'ENTRADA') return false;
      if (tipo === 'SALIDAS' && r.tipoMovimiento !== 'SALIDA') return false;

      if (desde) {
        const movDate = new Date(r.fechaMovimiento);
        const fromDate = new Date(desde);
        fromDate.setHours(0, 0, 0, 0);
        if (movDate < fromDate) return false;
      }

      if (hasta) {
        const movDate = new Date(r.fechaMovimiento);
        const untilDate = new Date(hasta);
        untilDate.setHours(23, 59, 59, 999);
        if (movDate > untilDate) return false;
      }

      return true;
    });
  }, [data, almacen, tipo, desde, hasta]);

  const kpis = useMemo(() => {
    if (!data) return { existencia: 0, entradas: 0, salidas: 0, movimientos: 0 };

    if (almacen === 'ALL' && tipo === 'TODOS' && !desde && !hasta) {
      return {
        existencia: data.resumen.existenciaActual,
        entradas: data.resumen.totalEntradas,
        salidas: data.resumen.totalSalidas,
        movimientos: data.resumen.totalMovimientos,
      };
    }

    const entradas = filteredRows
      .filter((r) => r.tipoMovimiento === 'ENTRADA')
      .reduce((sum, r) => sum + r.cantidad, 0);
    const salidas = filteredRows
      .filter((r) => r.tipoMovimiento === 'SALIDA')
      .reduce((sum, r) => sum + r.cantidad, 0);

    return {
      existencia: data.resumen.existenciaActual,
      entradas,
      salidas,
      movimientos: filteredRows.length,
    };
  }, [data, filteredRows, almacen, tipo, desde, hasta]);

  if (isError) {
    return (
      <div className="mx-auto max-w-350 space-y-6 p-8">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/kardex" className="hover:text-foreground">Kardex</Link>
          <ChevronRight className="size-3.5" />
          <span className="text-foreground">{skuid}</span>
        </nav>
        <div className="flex flex-col items-center justify-center rounded-lg border border-destructive/50 bg-destructive/10 p-12 text-center">
          <AlertCircle className="mb-4 size-12 text-destructive" />
          <h2 className="text-lg font-semibold text-destructive">Error al cargar el Kardex</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'No se pudo cargar la información del producto.'}
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              to="/kardex"
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Buscar otro SKU
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-350 space-y-6 p-8">
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link to="/kardex" className="hover:text-foreground">Kardex</Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground">{data?.producto.nombre ?? skuid}</span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {isLoading ? (
              <span className="inline-block h-8 w-48 animate-pulse rounded bg-muted" />
            ) : (
              `Kardex: ${data?.varianteActual.nombre ?? skuid}`
            )}
          </h1>
          <p className="text-sm text-muted-foreground">
            Variante activa:{' '}
            <span className="font-mono font-semibold text-foreground">
              {isLoading ? (
                <span className="inline-block h-4 w-24 animate-pulse rounded bg-muted" />
              ) : (
                data?.varianteActual.sku ?? skuid
              )}
            </span>
          </p>
        </div>
        <div className="flex w-full max-w-xl items-center gap-2">
          <div className="flex-1"><CardexSearch /></div>
        </div>
      </div>

      {!isLoading && data && data.variantes.length > 1 && (
        <VariantSelector variantes={data.variantes} activo={skuid} />
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <Package className="size-3.5" />
            Existencia actual
          </div>
          <div className="mt-1 font-mono text-2xl font-bold tabular-nums">
            {isLoading ? (
              <span className="inline-block h-8 w-16 animate-pulse rounded bg-muted" />
            ) : (
              kpis.existencia
            )}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <ArrowDownLeft className="size-3.5 text-(--status-liq)" />
            Entradas (filtro)
          </div>
          <div className="mt-1 font-mono text-2xl font-bold tabular-nums text-(--status-liq)">
            {isLoading ? (
              <span className="inline-block h-8 w-16 animate-pulse rounded bg-muted" />
            ) : (
              kpis.entradas
            )}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <ArrowUpRight className="size-3.5 text-(--status-liq)" />
            Salidas (filtro)
          </div>
          <div className="mt-1 font-mono text-2xl font-bold tabular-nums text-(--status-liq)">
            {isLoading ? (
              <span className="inline-block h-8 w-16 animate-pulse rounded bg-muted" />
            ) : (
              kpis.salidas
            )}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <Activity className="size-3.5" />
            Movimientos (filtro)
          </div>
          <div className="mt-1 font-mono text-2xl font-bold tabular-nums">
            {isLoading ? (
              <span className="inline-block h-8 w-16 animate-pulse rounded bg-muted" />
            ) : (
              kpis.movimientos
            )}
          </div>
        </div>
      </div>

      <CardexFilters
        desde={desde}
        hasta={hasta}
        tipo={tipo}
        almacen={almacen}
        almacenes={almacenesOptions}
        onDesde={setDesde}
        onHasta={setHasta}
        onTipo={setTipo}
        onAlmacen={setAlmacen}
        onReset={() => {
          setDesde('');
          setHasta('');
          setTipo('TODOS');
          setAlmacen('ALL');
        }}
      />

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded bg-muted" />
          ))}
        </div>
      ) : (
        <CardexTable rows={filteredRows} />
      )}
    </div>
  );
}