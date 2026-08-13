import apiClient from "@/api/client";
import type { PaginatedTransacciones, OrdenPendiente, FacturaPendiente } from "../schemas/schemas";
import type { RegistroTasas, TasaCambio } from "@/types/zodType";

export interface FetchTransaccionesParams {
    page?: number;
    limit?: number;
    q?: string;
    estado?: string;
    tipo?: string;
    desde?: string;
    hasta?: string;
}

export const fetchTransaccionesPagos = async (
    params?: FetchTransaccionesParams
): Promise<PaginatedTransacciones> => {
    try {
        const { data } = await apiClient.get<PaginatedTransacciones>(
            "pagos/transacciones",
            { params }
        );
        return data;
    } catch (error) {
        console.error("Error fetching transacciones pagos:", error);
        throw error;
    }
};

export const fetchOrdenesPendientes = async (
    q: string
): Promise<OrdenPendiente[]> => {
    try {
        const { data } = await apiClient.get<OrdenPendiente[]>(
            "pagos/ordenes-pendientes",
            { params: { q } }
        );
        return data;
    } catch (error) {
        console.error("Error fetching ordenes pendientes:", error);
        throw error;
    }
};

export const fetchFacturasPendientes = async (
    q: string
): Promise<FacturaPendiente[]> => {
    try {
        const { data } = await apiClient.get<FacturaPendiente[]>(
            "pagos/facturas-pendientes",
            { params: { q } }
        );
        return data;
    } catch (error) {
        console.error("Error fetching facturas pendientes:", error);
        throw error;
    }
};

export const fetchTasasCambio = async (
    q?: string
): Promise<RegistroTasas[]> => {
    try {
        const { data } = await apiClient.get<RegistroTasas[]>(
            "core/registro-tasas",
            { params: { fecha: q } }
        );
        return data;
    } catch (error) {
        console.error("Error fetching facturas pendientes:", error);
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