import apiClient from "@/api/client";
import type { OrdenDespacho, DetallesOrdenDespacho } from "../schemas/schema";
import type { LoteSearchResult, ListOrdenDespacho, OrdenDespachoDetail } from "@/features/Despacho/schemas/schema";

export const createOrdenDespacho = async (data: OrdenDespacho): Promise<{ message: string }> => {
    try {
        const response = await apiClient.post('despacho/orden-despacho', data);
        return response.data;
    } catch (error) {
        console.error("Error creating orden de despacho:", error);
        throw error;
    }
};

export const updateOrden = async (ordenId: number, bodydata: OrdenDespacho): Promise<{ message: string }> => {
    try {
        const { data } = await apiClient.put<{ message: string }>(
            `despacho/orden-despacho/${ordenId}`,
            { bodydata }
        );
        return data;
    } catch (error) {
        console.error("Error updating orden detalles:", error);
        throw error;
    }
};


export const updateOrdenDetalles = async (ordenId: number, detalles: DetallesOrdenDespacho[]): Promise<{ message: string }> => {
    try {
        const { data } = await apiClient.put<{ message: string }>(
            `despacho/orden-despacho/${ordenId}/detalles`,
            { detalles }
        );
        return data;
    } catch (error) {
        console.error("Error updating orden detalles:", error);
        throw error;
    }
};


export const updateOrdenEstado = async (id: number): Promise<{ message: string }> => {
    try {
        const { data } = await apiClient.patch<{ message: string }>(`despacho/orden-despacho/${id}`);
        return data;
    } catch (error) {
        console.error("Error updating orden estado:", error);
        throw error;
    }
};

export const fetchLotesSearch = async (query: string): Promise<LoteSearchResult[]> => {
    try {
        const { data } = await apiClient.get<LoteSearchResult[]>('despacho/lotes/search', {
            params: { q: query }
        });
        return data;
    } catch (error) {
        console.error("Error fetching lotes:", error);
        throw error;
    }
};

export const fetchOrdenesDespacho = async (): Promise<ListOrdenDespacho[]> => {
    try {
        const { data } = await apiClient.get<ListOrdenDespacho[]>('despacho/ordenes-despacho');
        return data;
    } catch (error) {
        console.error("Error fetching ordenes de despacho:", error);
        throw error;
    }
};

export const fetchOrdenDespachoDetail = async (id: number): Promise<OrdenDespachoDetail> => {
    try {
        const { data } = await apiClient.get<OrdenDespachoDetail>(`despacho/orden-despacho/${id}`);
        return data;
    } catch (error) {
        console.error("Error fetching orden de despacho detail:", error);
        throw error;
    }
};
