import apiClient from '@/api/client';
import axios from 'axios';
import { ZodError } from 'zod';
import { kardexSearchSchema, type KardexSearch } from '../schemas/schemas';

export const getKardex = async () => {
  return await apiClient.get('/kardex');
};

export const searchKardex = async (
  query: string,
  signal?: AbortSignal
): Promise<KardexSearch[]> => {
  const trimmed = query.trim();
  if (!trimmed) return [];

  try {
    const response = await apiClient.get('/kardex/search', {
      params: { q: trimmed },
      signal,
    });

    const parsed = kardexSearchSchema.array().safeParse(response.data);
    if (!parsed.success) {
      console.error('Validation error in searchKardex:', parsed.error);
      throw new Error('Formato de datos de búsqueda inválido.');
    }

    return parsed.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      // Return empty array or let TanStack query handle abort smoothly
      return [];
    }

    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Error al realizar la búsqueda de productos';
      throw new Error(Array.isArray(message) ? message.join(', ') : message);
    }

    if (error instanceof ZodError || error instanceof Error) {
      throw error;
    }

    throw new Error('Error inesperado al buscar en el Kardex');
  }
};