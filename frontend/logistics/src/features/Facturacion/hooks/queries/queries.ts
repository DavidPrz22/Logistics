import { useQuery } from '@tanstack/react-query';
import type { FetchFacturasParams } from '@/features/Facturacion/api/api';
import {
  facturaDetalleQueryOptions,
  facturasQueryOptions,
} from './queryOptions';

export const useFacturas = (params?: FetchFacturasParams) =>
  useQuery(facturasQueryOptions(params));

export const useFacturaDetalle = (id: number) =>
  useQuery(facturaDetalleQueryOptions(id));
