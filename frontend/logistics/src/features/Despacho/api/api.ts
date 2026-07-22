import apiClient from "@/api/client";
import type { OrdenDespacho } from "../schemas/schema";
import type { LineaBorrador } from "../types/types";

export const createOrdenDespacho = async (data: OrdenDespacho): Promise<any> => {
    try {
        const response = await apiClient.post('despacho/orden-despacho', data);
        return response.data;
    } catch (error) {
        console.error("Error creating orden de despacho:", error);
        throw error;
    }
};

export const updateOrdenDetalles = async (ordenId: number, lineas: LineaBorrador[]): Promise<{ message: string }> => {
    try {
        const detallesOrdenDespacho = lineas.map(l => ({
            loteId: l.lote_id,
            cantidadEnviada: Number(l.cantidad),
            precioUnitario: Number(l.precio),
        }));

        const { data } = await apiClient.put<{ message: string }>(
            `despacho/orden-despacho/${ordenId}`,
            { detallesOrdenDespacho }
        );
        return data;
    } catch (error) {
        console.error("Error updating orden detalles:", error);
        throw error;
    }
};
