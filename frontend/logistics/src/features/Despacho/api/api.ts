import apiClient from "@/api/client";
import type { OrdenDespacho } from "../schemas/schema";

export const createOrdenDespacho = async (data: OrdenDespacho): Promise<any> => {
    try {
        const response = await apiClient.post('despacho/orden-despacho', data);
        return response.data;
    } catch (error) {
        console.error("Error creating orden de despacho:", error);
        throw error;
    }
};
