import { queryOptions } from '@tanstack/react-query';
import { fetchRegistroTasas, fetchTasasCambioByRegistro } from '../../api/api';

export const registroTasasQueryOptions = queryOptions({
  queryKey: ['registroTasas'],
  queryFn: fetchRegistroTasas,
  staleTime: Infinity,
});

export const tasasCambioByRegistroQueryOptions = (registroId: number) => queryOptions({
  queryKey: ['tasasCambioByRegistro', registroId],
  queryFn: () => fetchTasasCambioByRegistro(registroId),
  staleTime: Infinity,
  enabled: !!registroId,
});
