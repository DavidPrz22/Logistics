import { useQuery } from '@tanstack/react-query';
import { registroTasasQueryOptions, tasasCambioByRegistroQueryOptions } from './queryOptions';

export const useRegistroTasas = () => useQuery(registroTasasQueryOptions);

export const useTasasCambioByRegistro = (registroId: number) =>
  useQuery(tasasCambioByRegistroQueryOptions(registroId));
