import { fetchFacturas, fetchFacturaDetalle, type FetchFacturasParams } from '@/features/Facturacion/api/api';
import { keepPreviousData, queryOptions } from '@tanstack/react-query';

export const facturasQueryOptions = (params?: FetchFacturasParams) =>
  queryOptions({
    queryKey: ['facturas', params],
    queryFn: () => fetchFacturas(params),
    placeholderData: keepPreviousData,
  });

export const facturaDetalleQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ['facturas-detalles', id],
    queryFn: () => fetchFacturaDetalle(id),
    enabled: !!id,
  });
