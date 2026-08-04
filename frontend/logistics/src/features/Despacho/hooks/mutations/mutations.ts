import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateOrdenEstado } from "@/features/Despacho/api/api";
import { createOrdenDespacho, updateOrden, updateOrdenDetalles, registrarLiquidacion } from "@/features/Despacho/api/api";
import type { OrdenDespacho, DetallesOrdenDespacho, LiquidacionSchema} from "@/features/Despacho/schemas/schema";
import { toast } from "sonner";
import { ordenDespachoDetailQueryOptions, ordenesDespachoQueryOptions, } from "../queries/queryOptions";
export const useCreateOrdenDespachoMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: OrdenDespacho) => createOrdenDespacho(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ordenesDespachoQueryOptions.queryKey });
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
            queryClient.invalidateQueries({ queryKey: ordenesDespachoQueryOptions.queryKey });
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
            queryClient.invalidateQueries({ queryKey: ordenDespachoDetailQueryOptions(id).queryKey });
            queryClient.invalidateQueries({ queryKey: ordenesDespachoQueryOptions.queryKey });
        },
    });
}


export const useUpdateOrdenDetallesMutation = (id: number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { detalles: DetallesOrdenDespacho[], totalFacturado: number }) => updateOrdenDetalles(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ordenDespachoDetailQueryOptions(id).queryKey });
            queryClient.invalidateQueries({ queryKey: ordenesDespachoQueryOptions.queryKey });
        },
        onError: (error) => {
            console.error(error)
            toast.error(error.message)
        }
    });
};


export const useRegistrarLiquidacionMutation = (id: number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: LiquidacionSchema) => registrarLiquidacion(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ordenDespachoDetailQueryOptions(id).queryKey });
            queryClient.invalidateQueries({ queryKey: ordenesDespachoQueryOptions.queryKey });
        },
        onError: (error) => {
            console.error(error)
            toast.error(error.message)
        }
    });
};