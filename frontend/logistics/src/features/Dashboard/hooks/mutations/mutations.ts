import { useMutation, useQueryClient } from "@tanstack/react-query";
import { generarTasaCambio, updateTasasCambio } from "../../api/api";
import { toast } from "sonner";
import type { UpdateTasasCambio } from "../../schemas/schema";
import { registroTasasQueryOptions, tasasCambioByRegistroQueryOptions } from "../queries/queryOptions";
export const useGenerarTasaCambioMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => generarTasaCambio(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: registroTasasQueryOptions.queryKey });
            toast.success("Tasa de cambio generada exitosamente");
        },
        onError: (error) => {
            console.error(error)
            toast.error(error.message)
        }
    });
};

export const useUpdateTasasCambioMutation = (registroId: number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: UpdateTasasCambio) => updateTasasCambio(registroId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: tasasCambioByRegistroQueryOptions(registroId).queryKey });
            toast.success("Tasas de cambio actualizadas exitosamente");
        },
        onError: (error) => {
            console.error(error);
            toast.error(error.message);
        }
    });
};