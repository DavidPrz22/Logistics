import { useQuery } from '@tanstack/react-query';
import { almacenesQueryOptions, choferesQueryOptions, clientesQueryOptions, divisasQueryOptions, tasasCambioQueryOptions, metodosPagoQueryOptions } from './queryOptions';


export const useAlmacenes = () => useQuery(almacenesQueryOptions);

export const useChoferes = () => useQuery(choferesQueryOptions);

export const useClientes = () => useQuery(clientesQueryOptions);

export const useDivisas = () => useQuery(divisasQueryOptions);

export const useTasasCambio = () => useQuery(tasasCambioQueryOptions);

export const useMetodosPago = () => useQuery(metodosPagoQueryOptions);



