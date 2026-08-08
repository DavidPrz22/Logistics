import { queryOptions } from '@tanstack/react-query';
import {
  fetchAlmacenes,
  fetchChoferes,
  fetchClientes,
  fetchDivisas,
  fetchTasasCambio,
  fetchMetodosPago,
  fetchMotivosRechazo,
  fetchEstadosFacturas,
  fetchEstadosTransaccionesPago,
  fetchTiposDocumento,
  fetchTiposPago,
  fetchTiposOperacion,
  fetchCuentasDestino,
  fetchFacturas,
  fetchFacturaDetalle,
} from '@/api/api';

export const almacenesQueryOptions = queryOptions({
  queryKey: ['almacenes'],
  queryFn: fetchAlmacenes,
  staleTime: Infinity,
});

export const choferesQueryOptions = queryOptions({
  queryKey: ['choferes'],
  queryFn: fetchChoferes,
  staleTime: Infinity,
});

export const clientesQueryOptions = queryOptions({
  queryKey: ['clientes'],
  queryFn: fetchClientes,
  staleTime: Infinity,
});

export const divisasQueryOptions = queryOptions({
  queryKey: ['divisas'],
  queryFn: fetchDivisas,
  staleTime: Infinity,
});

export const tasasCambioQueryOptions = queryOptions({
  queryKey: ['tasasCambio'],
  queryFn: fetchTasasCambio,
  staleTime: Infinity,
});

export const metodosPagoQueryOptions = queryOptions({
  queryKey: ['metodosPago'],
  queryFn: fetchMetodosPago,
  staleTime: Infinity,
});

export const motivosRechazoQueryOptions = queryOptions({
  queryKey: ['motivosRechazo'],
  queryFn: fetchMotivosRechazo,
  staleTime: Infinity,
});

export const estadosFacturasQueryOptions = queryOptions({
  queryKey: ['estadosFacturas'],
  queryFn: fetchEstadosFacturas,
  staleTime: Infinity,
});

export const estadosTransaccionesPagoQueryOptions = queryOptions({
  queryKey: ['estadosTransaccionesPago'],
  queryFn: fetchEstadosTransaccionesPago,
  staleTime: Infinity,
});

export const tiposDocumentoQueryOptions = queryOptions({
  queryKey: ['tiposDocumento'],
  queryFn: fetchTiposDocumento,
  staleTime: Infinity,
});

export const tiposPagoQueryOptions = queryOptions({
  queryKey: ['tiposPago'],
  queryFn: fetchTiposPago,
  staleTime: Infinity,
});

export const tiposOperacionQueryOptions = queryOptions({
  queryKey: ['tiposOperacion'],
  queryFn: fetchTiposOperacion,
  staleTime: Infinity,
});

export const cuentasDestinoQueryOptions = queryOptions({
  queryKey: ['cuentasDestino'],
  queryFn: fetchCuentasDestino,
  staleTime: Infinity,
});

export const facturasQueryOptions = queryOptions({
  queryKey: ['facturas'],
  queryFn: fetchFacturas,
});

export const facturaDetalleQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ['facturas', id],
    queryFn: () => fetchFacturaDetalle(id),
    enabled: !!id,
  });


