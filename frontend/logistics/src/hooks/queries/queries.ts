import { useQuery } from '@tanstack/react-query';
import {
  almacenesQueryOptions,
  choferesQueryOptions,
  clientesQueryOptions,
  divisasQueryOptions,
  tasasCambioQueryOptions,
  metodosPagoQueryOptions,
  motivosRechazoQueryOptions,
  estadosFacturasQueryOptions,
  estadosTransaccionesPagoQueryOptions,
  tiposDocumentoQueryOptions,
  tiposPagoQueryOptions,
  tiposOperacionQueryOptions,
  cuentasDestinoQueryOptions,
} from './queryOptions';

export const useAlmacenes = () => useQuery(almacenesQueryOptions);

export const useChoferes = () => useQuery(choferesQueryOptions);

export const useClientes = () => useQuery(clientesQueryOptions);

export const useDivisas = () => useQuery(divisasQueryOptions);

export const useTasasCambio = () => useQuery(tasasCambioQueryOptions);

export const useMetodosPago = () => useQuery(metodosPagoQueryOptions);

export const useMotivosRechazo = () => useQuery(motivosRechazoQueryOptions);

export const useEstadosFacturas = () => useQuery(estadosFacturasQueryOptions);

export const useEstadosTransaccionesPago = () =>
  useQuery(estadosTransaccionesPagoQueryOptions);

export const useTiposDocumento = () => useQuery(tiposDocumentoQueryOptions);

export const useTiposPago = () => useQuery(tiposPagoQueryOptions);

export const useTiposOperacion = () => useQuery(tiposOperacionQueryOptions);

export const useCuentasDestino = () => useQuery(cuentasDestinoQueryOptions);




