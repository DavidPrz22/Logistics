import apiClient from "@/api/client";
import type { RegistroTasas, TasaCambio } from "@/types/zodType";

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
