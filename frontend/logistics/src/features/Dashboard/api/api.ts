import apiClient from "@/api/client";
import type { RegistroTasas, TasaCambio } from "@/types/zodType";
import type { UpdateTasasCambio } from "../schemas/schema";

export const generarTasaCambio = async () => {
  try {
    const response = await apiClient.post('core/tasas-cambio/');
    return response.data;
  } catch (error) {
    console.error("Error generating tasa de cambio:", error);
    throw error;
  }
};

export const fetchRegistroTasas = async (): Promise<RegistroTasas[]> => {
  try {
    const { data } = await apiClient.get<RegistroTasas[]>('core/registro-tasas');
    return data;
  } catch (error) {
    console.error("Error fetching registro tasas:", error);
    throw error;
  }
};

export const fetchTasasCambioByRegistro = async (registroId: number): Promise<TasaCambio[]> => {
  try {
    const { data } = await apiClient.get<TasaCambio[]>(`core/registro-tasas/${registroId}/tasas-cambio`);
    return data;
  } catch (error) {
    console.error("Error fetching tasas de cambio by registro:", error);
    throw error;
  }
};

export const updateTasasCambio = async (registroId: number, data: UpdateTasasCambio): Promise<{ message: string; updatedCount: number }> => {
  try {
    const { data: responseData } = await apiClient.patch<{ message: string; updatedCount: number }>(
      `core/registro-tasas/${registroId}/tasas-cambio`,
      data
    );
    return responseData;
  } catch (error) {
    console.error("Error updating tasas de cambio:", error);
    throw error;
  }
};
