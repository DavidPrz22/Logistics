import { useQuery } from '@tanstack/react-query';
import { kardexSearchQueryOptions } from './queryoptions';

export const useKardexSearch = (query: string) => {
  return useQuery(kardexSearchQueryOptions(query));
};
