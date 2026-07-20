import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrdenDespacho } from "@/features/Despacho/api/api";
import type { OrdenDespacho } from "@/features/Despacho/schemas/schema";
import { toast } from "sonner";

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
