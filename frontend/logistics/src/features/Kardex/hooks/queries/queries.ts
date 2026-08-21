import { useQuery } from '@tanstack/react-query';
import { kardexSearchQueryOptions, kardexDetailQueryOptions } from './queryoptions';

export const useKardexSearch = (query: string) => {
  return useQuery(kardexSearchQueryOptions(query));
};

export const useKardexDetail = (sku: string) => {
  return useQuery(kardexDetailQueryOptions(sku));
};
