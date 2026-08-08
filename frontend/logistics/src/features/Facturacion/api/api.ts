import apiClient from '@/api/client';
import type { PaginatedDocumentosType, DocumentoDeudaDetalleType } from '../schemas/schemas';

export interface FetchFacturasParams {
  page?: number;
  limit?: number;
  q?: string;
  estado?: string;
  tipo?: string;
  fecha?: string;
}

export const fetchFacturas = async (
  params?: FetchFacturasParams,
): Promise<PaginatedDocumentosType> => {
  try {
    const { data } = await apiClient.get<PaginatedDocumentosType>('facturas', {
      params,
    });
    return data;
  } catch (error) {
    console.error('Error fetching facturas:', error);
    throw error;
  }
};

export const fetchFacturaDetalle = async (id: number): Promise<DocumentoDeudaDetalleType> => {
  try {
    const { data } = await apiClient.get<DocumentoDeudaDetalleType>('facturas/' + id);
    return data;
  } catch (error) {
    console.error('Error fetching factura detalle with id ' + id + ':', error);
    throw error;
  }
};
