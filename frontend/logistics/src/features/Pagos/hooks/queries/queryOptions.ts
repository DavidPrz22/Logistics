import { queryOptions } from "@tanstack/react-query";
import {
    fetchTransaccionesPagos,
    fetchOrdenesPendientes,
    fetchFacturasPendientes,
    fetchTasasCambio,
    fetchTasasCambioByRegistro,
    fetchTransaccionById,
    type FetchTransaccionesParams,
} from "../../api/api";

export const transaccionesPagosQueryOptions = (params?: FetchTransaccionesParams) =>
    queryOptions({
        queryKey: ["transaccionesPagos", params],
        queryFn: () => fetchTransaccionesPagos(params),
        staleTime: Infinity,
    });

export const ordenesPendientesQueryOptions = (q: string) =>
    queryOptions({
        queryKey: ["ordenesPendientes", q],
        queryFn: () => fetchOrdenesPendientes(q),
        staleTime: Infinity,
        enabled: q.length >= 3,
    });

export const facturasPendientesQueryOptions = (q: string) =>
    queryOptions({
        queryKey: ["facturasPendientes", q],
        queryFn: () => fetchFacturasPendientes(q),
        staleTime: Infinity,
        enabled: q.length >= 3,
    });


export const TasasPagoPerDateQueryOptions = (date: string) =>
    queryOptions({
        queryKey: ["tasasPagoPerDate", date],
        queryFn: () => fetchTasasCambio(date),
        staleTime: Infinity,
        enabled: !!date,
    });


export const TasasCambiobyRegistro = ( id: number) => {
    return queryOptions({
        queryKey: ["tasasCambiobyRegistro", id],
        queryFn: () => fetchTasasCambioByRegistro(id),
        staleTime: Infinity,
        enabled: !!id,
    });
}

export const transaccionByIdQueryOptions = (id: number) =>
    queryOptions({
        queryKey: ["transaccionPagoDetalle", id],
        queryFn: () => fetchTransaccionById(id),
        staleTime: 1000 * 60 * 5,
        enabled: !!id,
    });