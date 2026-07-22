import { queryOptions } from '@tanstack/react-query';
import { fetchAlmacenes, fetchChoferes, fetchClientes, fetchDivisas, fetchTasasCambio, fetchMetodosPago} from '@/api/api';

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

