import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registrarPago, anularTransaccion } from "../../api/api";
import type { CrearPagoInput } from "../../schemas/schemas";
import { toast } from "sonner";

export const useRegistrarPagoMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CrearPagoInput) => registrarPago(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transaccionesPagos"] });
            queryClient.invalidateQueries({ queryKey: ["ordenesPendientes"] });
            queryClient.invalidateQueries({ queryKey: ["facturasPendientes"] });
            toast.success("Pago registrado exitosamente");
        },
        onError: (error: Error) => {
            console.error("Error registrando pago:", error);
            toast.error(error.message || "Error al registrar el pago");
        },
    });
};

export const useAnularTransaccionMutation = (id: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (motivo: string) => anularTransaccion(id, motivo),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transaccionPagoDetalle", id] });
            queryClient.invalidateQueries({ queryKey: ["transaccionesPagos"] });
            toast.success("Transacción anulada exitosamente");
        },
        onError: (error: Error) => {
            console.error("Error anulando transacción:", error);
            toast.error(error.message || "Error al anular la transacción");
        },
    });
};
