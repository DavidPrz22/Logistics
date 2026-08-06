import { queryOptions } from '@tanstack/react-query';
import { fetchRegistroTasas, fetchTasasCambioByRegistro } from '../../api/api';

export const registroTasasQueryOptions = queryOptions({
  queryKey: ['registroTasas'],
  queryFn: fetchRegistroTasas,
  staleTime: 0,
});

export const tasasCambioByRegistroQueryOptions = (registroId: number) => queryOptions({
  queryKey: ['tasasCambioByRegistro', registroId],
  queryFn: () => fetchTasasCambioByRegistro(registroId),
  staleTime: 0,
  enabled: !!registroId,
});
