import { queryOptions } from '@tanstack/react-query';
import { searchKardex } from '../../api/api';

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
