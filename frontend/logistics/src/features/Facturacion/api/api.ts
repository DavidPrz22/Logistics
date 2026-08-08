import apiClient from "@/api/client";
import type { DocumentoDeudaListadoType, DocumentoDeudaDetalleType, } from "../schemas/schemas";

export const fetchFacturas = async (): Promise<DocumentoDeudaListadoType[]> => {
    try {
        const { data } = await apiClient.get<DocumentoDeudaListadoType[]>('facturas');
        return data;
    } catch (error) {
        console.error("Error fetching facturas:", error);
        throw error;
    }
};

export const fetchFacturaDetalle = async (id: number): Promise<DocumentoDeudaDetalleType> => {
    try {
        const { data } = await apiClient.get<DocumentoDeudaDetalleType>(`facturas/${id}`);
        return data;
    } catch (error) {
        console.error(`Error fetching factura detalle with id ${id}:`, error);
        throw error;
    }
};