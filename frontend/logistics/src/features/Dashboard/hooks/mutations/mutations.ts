import { useMutation, useQueryClient } from "@tanstack/react-query";
import { generarTasaCambio  } from "../../api/api";
import { toast } from "sonner";

export const useGenerarTasaCambioMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => generarTasaCambio(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasas-cambio'] });
            queryClient.invalidateQueries({ queryKey: ['registroTasas'] });
            toast.success("Tasa de cambio generada exitosamente");
        },
        onError: (error) => {
            console.error(error)
            toast.error(error.message)
        }
    });
};