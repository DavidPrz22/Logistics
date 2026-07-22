import { queryOptions } from '@tanstack/react-query';
import { fetchAlmacenes, fetchChoferes, fetchClientes, fetchDivisas, fetchTasasCambio, fetchMetodosPago, fetchLotesSearch, fetchOrdenesDespacho, fetchOrdenDespachoDetail } from '@/api/api';

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

export const lotesSearchQueryOptions = (query: string) => queryOptions({
  queryKey: ['lotesSearch', query],
  queryFn: () => fetchLotesSearch(query),
  staleTime: 0,
  enabled: query.length >= 3,
});

export const ordenesDespachoQueryOptions = queryOptions({
  queryKey: ['ordenesDespacho'],
  queryFn: fetchOrdenesDespacho,
  staleTime: 0,
});

export const ordenDespachoDetailQueryOptions = (id: number) => queryOptions({
  queryKey: ['ordenDespachoDetail', id],
  queryFn: () => fetchOrdenDespachoDetail(id),
  staleTime: 0,
});
