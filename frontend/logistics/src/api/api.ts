import apiClient from "./client";
import type { Almacen, Chofer, Cliente, Divisa, TasaCambio, MetodoPago } from "@/types/zodType";
import type { LoteSearchResult, ListOrdenDespacho, OrdenDespachoDetail } from "@/features/Despacho/schemas/schema";



export const fetchAlmacenes = async (): Promise<Almacen[]> => {
    try {
        const { data } = await apiClient.get<Almacen[]>('core/almacenes');
        return data;
    } catch (error) {
        console.error("Error fetching almacenes:", error);
        throw error;
    }
};

export const fetchChoferes = async (): Promise<Chofer[]> => {
    try {
        const { data } = await apiClient.get<Chofer[]>('core/choferes');
        return data;
    } catch (error) {
        console.error("Error fetching choferes:", error);
        throw error;
    }
};

export const fetchClientes = async (): Promise<Cliente[]> => {
    try {
        const { data } = await apiClient.get<Cliente[]>('core/clientes');
        return data;
    } catch (error) {
        console.error("Error fetching clientes:", error);
        throw error;
    }
};

export const fetchDivisas = async (): Promise<Divisa[]> => {
    try {
        const { data } = await apiClient.get<Divisa[]>('core/divisas');
        return data;
    } catch (error) {
        console.error("Error fetching divisas:", error);
        throw error;
    }
};

export const fetchTasasCambio = async (): Promise<TasaCambio[]> => {
    try {
        const { data } = await apiClient.get<TasaCambio[]>('core/tasas-cambio');
        return data;
    } catch (error) {
        console.error("Error fetching tasas de cambio:", error);
        throw error;
    }
};

export const fetchMetodosPago = async (): Promise<MetodoPago[]> => {
    try {
        const { data } = await apiClient.get<MetodoPago[]>('core/metodos-pago');
        return data;
    } catch (error) {
        console.error("Error fetching metodos de pago:", error);
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

export const updateOrdenEstado = async (id: number): Promise<{ message: string }> => {
    try {
        const { data } = await apiClient.patch<{ message: string }>(`despacho/orden-despacho/${id}`);
        return data;
    } catch (error) {
        console.error("Error updating orden estado:", error);
        throw error;
    }
};