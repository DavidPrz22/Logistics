import apiClient from "@/api/client";
import type { PaginatedTransacciones, OrdenPendiente, FacturaPendiente } from "../schemas/schemas";

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
