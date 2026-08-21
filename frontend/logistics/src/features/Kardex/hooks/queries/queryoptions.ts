import { queryOptions } from '@tanstack/react-query';
import { searchKardex, getKardexBySku } from '../../api/api';

export const kardexSearchQueryOptions = (query: string) => {
  const trimmed = query.trim();
  return queryOptions({
    queryKey: ['kardex', 'search', trimmed],
    queryFn: ({ signal }) => searchKardex(trimmed, signal),
    enabled: trimmed.length >= 3,
    staleTime: Infinity,
    placeholderData: (previousData) => previousData,
  });
};

export const kardexDetailQueryOptions = (sku: string) => {
  const trimmed = sku.trim();
  return queryOptions({
    queryKey: ['kardex', 'detail', trimmed],
    queryFn: ({ signal }) => getKardexBySku(trimmed, signal),
    enabled: Boolean(trimmed.length > 0),
    staleTime: Infinity,
    placeholderData: (previousData) => previousData,
  });
};
