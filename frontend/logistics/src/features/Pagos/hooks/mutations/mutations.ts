import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registrarPago, anularTransaccion } from "../../api/api";
import type { CrearPagoInput } from "../../schemas/schemas";
import { ordenDespachoDetailQueryOptions } from "@/features/Despacho/hooks/queries/queryOptions";
import { facturaDetalleQueryOptions } from "@/features/Facturacion/hooks/queries/queryOptions";
import { toast } from "sonner";

export const useRegistrarPagoMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ data }: {data: CrearPagoInput, documentoId: number | undefined, ordenId: number | undefined}) => registrarPago(data),

        onSuccess: (_, { documentoId, ordenId }) => {
            queryClient.invalidateQueries({ queryKey: ["transaccionesPagos"] });
            queryClient.invalidateQueries({ queryKey: ["ordenesPendientes"] });
            queryClient.invalidateQueries({ queryKey: ["facturasPendientes"] });
            if (ordenId) {
                queryClient.invalidateQueries({ queryKey: ordenDespachoDetailQueryOptions(ordenId).queryKey });
            }
            if (documentoId) {
                queryClient.invalidateQueries({ queryKey: facturaDetalleQueryOptions(documentoId).queryKey });
            }
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
        mutationFn: ({ motivo }: {motivo: string, documentoId: number | undefined, ordenId: number | undefined}) => anularTransaccion(id, motivo),
        onSuccess: (_, { documentoId, ordenId }) => {
            queryClient.invalidateQueries({ queryKey: ["transaccionPagoDetalle", id] });
            queryClient.invalidateQueries({ queryKey: ["transaccionesPagos"] });
            queryClient.invalidateQueries({ queryKey: ["ordenesPendientes"] });
            queryClient.invalidateQueries({ queryKey: ["facturasPendientes"] });
            if (ordenId) {
                queryClient.invalidateQueries({ queryKey: ordenDespachoDetailQueryOptions(ordenId).queryKey });
            }
            if (documentoId) {
                queryClient.invalidateQueries({ queryKey: facturaDetalleQueryOptions(documentoId).queryKey });
            }
            toast.success("Transacción anulada exitosamente");
        },
        onError: (error: Error) => {
            console.error("Error anulando transacción:", error);
            toast.error(error.message || "Error al anular la transacción");
        },
    });
};
