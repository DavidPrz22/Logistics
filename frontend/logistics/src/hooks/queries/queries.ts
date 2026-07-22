import { useQuery } from '@tanstack/react-query';
import { almacenesQueryOptions, choferesQueryOptions, clientesQueryOptions, divisasQueryOptions, tasasCambioQueryOptions, metodosPagoQueryOptions, lotesSearchQueryOptions, ordenesDespachoQueryOptions, ordenDespachoDetailQueryOptions } from './queryOptions';


export const useAlmacenes = () => useQuery(almacenesQueryOptions);

export const useChoferes = () => useQuery(choferesQueryOptions);

export const useClientes = () => useQuery(clientesQueryOptions);

export const useDivisas = () => useQuery(divisasQueryOptions);

export const useTasasCambio = () => useQuery(tasasCambioQueryOptions);

export const useMetodosPago = () => useQuery(metodosPagoQueryOptions);

export const useLotesSearch = (query: string) => useQuery(lotesSearchQueryOptions(query));

export const useOrdenesDespacho = () => useQuery(ordenesDespachoQueryOptions);

export const useOrdenDespachoDetail = (id: number) => useQuery(ordenDespachoDetailQueryOptions(id));


