import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateOrdenEstado } from "@/features/Despacho/api/api";
import { createOrdenDespacho, updateOrden, updateOrdenDetalles } from "@/features/Despacho/api/api";
import type { OrdenDespacho, DetallesOrdenDespacho } from "@/features/Despacho/schemas/schema";
import { toast } from "sonner";
import { ordenDespachoDetailQueryOptions } from "../queries/queryOptions";
export const useCreateOrdenDespachoMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: OrdenDespacho) => createOrdenDespacho(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["despachos"] });
        },
        onError: (error) => {
            console.error(error)
            toast.error(error.message)
        }
    });
};

export const useUpdateOrdenDespachoMutation = (ordenId: number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: OrdenDespacho) => updateOrden(ordenId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ordenDespachoDetail", ordenId] });
            queryClient.invalidateQueries({ queryKey: ["despachos"] });
        },
        onError: (error) => {
            console.error(error)
            toast.error(error.message)
        }
    });
};

export const useUpdateOrdenEstadoMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => updateOrdenEstado(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ["ordenDespachoDetail", id] });
            queryClient.invalidateQueries({ queryKey: ["ordenesDespacho"] });
        },
    });
}


export const useUpdateOrdenDetallesMutation = (id: number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: DetallesOrdenDespacho[]) => updateOrdenDetalles(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ordenDespachoDetailQueryOptions(id).queryKey });
            queryClient.invalidateQueries({ queryKey: ["ordenesDespacho"] });
        },
    });
};
