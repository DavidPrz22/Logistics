import { useEffect, useMemo, useState } from 'react';
import { CardexSearch } from './KardexSearch';
import { CardexFilters, type TipoFiltro } from './KardexFilters';
import { CardexTable } from './KardexTable';
import { VariantSelector } from './KardexVariantSelector';
import { KardexBreadcrumb } from './KardexBreadcrumb';
import { KardexErrorState } from './KardexErrorState';
import { KardexHeader } from './KardexHeader';
import { KardexKPIs } from './KardexKPIs';
import { KardexTableSkeleton } from './KardexTableSkeleton';
import { useKardexSearchStore } from '../store/zustandstore';
import { useKardexDetail } from '../hooks/queries/queries';
import { useAlmacenes } from '@/hooks/queries/queries';
import type { KardexMovimientoRow } from '../schemas/schemas';

export function KardexDetailView({ skuid }: { skuid: string }) {
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
      <KardexErrorState
        skuId={skuid}
        message={error instanceof Error ? error.message : 'No se pudo cargar la información del producto.'}
      />
    );
  }

  return (
    <div className="mx-auto max-w-350 space-y-6 p-8">
      <KardexBreadcrumb label={data?.producto.nombre ?? skuid} />

      <KardexHeader
        title={`Kardex: ${data?.varianteActual.nombre ?? skuid}`}
        subtitle={data?.varianteActual.sku ?? skuid}
        isLoading={isLoading}
      >
        <CardexSearch />
      </KardexHeader>

      {!isLoading && data && data.variantes.length > 1 && (
        <VariantSelector variantes={data.variantes} activo={skuid} />
      )}

      <KardexKPIs
        existencia={kpis.existencia}
        entradas={kpis.entradas}
        salidas={kpis.salidas}
        movimientos={kpis.movimientos}
        isLoading={isLoading}
      />

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
        <KardexTableSkeleton />
      ) : (
        <CardexTable rows={filteredRows} />
      )}
    </div>
  );
}
