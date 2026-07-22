import { useQuery } from '@tanstack/react-query';
import {
  lotesSearchQueryOptions,
  ordenesDespachoQueryOptions,
  ordenDespachoDetailQueryOptions,
} from './queryOptions';

export const useLotesSearch = (query: string) => useQuery(lotesSearchQueryOptions(query));

export const useOrdenesDespacho = () => useQuery(ordenesDespachoQueryOptions);

export const useOrdenDespachoDetail = (id: number, options?: { enabled?: boolean }) => useQuery({
  ...ordenDespachoDetailQueryOptions(id),
  enabled: options?.enabled ?? true,
});
