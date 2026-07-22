import { queryOptions } from '@tanstack/react-query';
import { fetchLotesSearch, fetchOrdenesDespacho, fetchOrdenDespachoDetail } from '../../api/api';

export const lotesSearchQueryOptions = (query: string) => queryOptions({
  queryKey: ['lotesSearch', query],
  queryFn: () => fetchLotesSearch(query),
  staleTime: 0,
  enabled: query.length >= 3,
});

export const ordenesDespachoQueryOptions = queryOptions({
  queryKey: ['ordenesDespacho'],
  queryFn: fetchOrdenesDespacho,
  staleTime: Infinity,
});

export const ordenDespachoDetailQueryOptions = (id: number) => queryOptions({
  queryKey: ['ordenDespachoDetail', id],
  queryFn: () => fetchOrdenDespachoDetail(id),
  staleTime: Infinity,
});
