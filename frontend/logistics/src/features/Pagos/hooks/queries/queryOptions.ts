import { queryOptions } from "@tanstack/react-query";
import {
    fetchTransaccionesPagos,
    fetchOrdenesPendientes,
    fetchFacturasPendientes,
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
