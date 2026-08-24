import { useMemo } from 'react';
import { useOrdenesDespacho } from '@/features/Despacho/hooks/queries/queries';
import { useFacturas } from '@/features/Facturacion/hooks/queries/queries';
import { useTransaccionesPagos } from '@/features/Pagos/hooks/queries/queries';
import { useRegistroTasas } from '../hooks/queries/queries';
import { useTasasCambioByRegistro } from '../hooks/queries/queries';
import type { ListOrdenDespacho } from '@/features/Despacho/schemas/schema';

export interface DashboardMetrics {
  operational: {
    enRuta: number;
    preparacion: number;
    liquidada: number;
    activeDrivers: number;
  };
  billing: {
    totalInvoicedUSD: number;
    pendingInvoices: number;
    pendingAmount: number;
  };
  treasury: {
    totalReceived: number;
    paymentCount: number;
    byMethod: Record<string, number>;
  };
  activeRoutes: ListOrdenDespacho[];
  recentOrders: ListOrdenDespacho[];
  exchangeRates: {
    bcv: number | null;
    paralelo: number | null;
    registroId: number | null;
  } | null;
  isLoading: boolean;
}

export function useDashboardMetrics(): DashboardMetrics {
  const { data: ordenes = [], isLoading: isLoadingOrdenes } = useOrdenesDespacho();
  const { data: facturasData, isLoading: isLoadingFacturas } = useFacturas({ limit: 100 });
  const { data: transaccionesData, isLoading: isLoadingTransacciones } = useTransaccionesPagos({ limit: 100 });
  const { data: registroTasas = [], isLoading: isLoadingRegistros } = useRegistroTasas();

  const latestRegistroId = registroTasas.length > 0 ? registroTasas[0].id : 0;
  const { data: tasasCambio = [], isLoading: isLoadingTasas } = useTasasCambioByRegistro(latestRegistroId);

  const metrics = useMemo(() => {
    const enRuta = ordenes.filter((o) => o.estado === 'EN_RUTA');
    const preparacion = ordenes.filter((o) => o.estado === 'PREPARACION');
    const liquidada = ordenes.filter((o) => o.estado === 'LIQUIDADA');

    const activeDrivers = new Set(enRuta.map((o) => o.choferNombre)).size;

    const facturas = facturasData?.data ?? [];
    const totalInvoicedUSD = facturas.reduce((sum, f) => sum + f.montoTotalBase, 0);
    const pendingInvoices = facturas.filter(
      (f) => f.estado === 'PENDIENTE' || f.estado === 'PAGADO_PARCIAL'
    ).length;
    const pendingAmount = facturas
      .filter((f) => f.estado === 'PENDIENTE' || f.estado === 'PAGADO_PARCIAL')
      .reduce((sum, f) => sum + f.montoTotalBase, 0);

    const transacciones = transaccionesData?.data ?? [];
    const approvedTransactions = transacciones.filter((t) => t.estado === 'APROBADO');
    const totalReceived = approvedTransactions.reduce((sum, t) => sum + t.montoOrigen, 0);
    const paymentCount = approvedTransactions.length;

    const byMethod: Record<string, number> = {};
    approvedTransactions.forEach((t) => {
      byMethod[t.metodo] = (byMethod[t.metodo] || 0) + t.montoOrigen;
    });

    const sortedOrders = [...ordenes].sort(
      (a, b) => new Date(b.FechaSalida).getTime() - new Date(a.FechaSalida).getTime()
    );
    const recentOrders = sortedOrders.slice(0, 8);

    let exchangeRates: DashboardMetrics['exchangeRates'] = null;
    if (tasasCambio.length > 0 && latestRegistroId > 0) {
      const bcvRate = tasasCambio.find((t) => t.fuente === 'BCV');
      const paraleloRate = tasasCambio.find((t) => t.fuente === 'PARALELO');
      exchangeRates = {
        bcv: bcvRate?.tasa ?? null,
        paralelo: paraleloRate?.tasa ?? null,
        registroId: latestRegistroId,
      };
    }

    return {
      operational: {
        enRuta: enRuta.length,
        preparacion: preparacion.length,
        liquidada: liquidada.length,
        activeDrivers,
      },
      billing: {
        totalInvoicedUSD,
        pendingInvoices,
        pendingAmount,
      },
      treasury: {
        totalReceived,
        paymentCount,
        byMethod,
      },
      activeRoutes: enRuta,
      recentOrders,
      exchangeRates,
      isLoading: isLoadingOrdenes || isLoadingFacturas || isLoadingTransacciones || isLoadingRegistros || isLoadingTasas,
    };
  }, [ordenes, facturasData, transaccionesData, tasasCambio, latestRegistroId, isLoadingOrdenes, isLoadingFacturas, isLoadingTransacciones, isLoadingRegistros, isLoadingTasas]);

  return metrics;
}
