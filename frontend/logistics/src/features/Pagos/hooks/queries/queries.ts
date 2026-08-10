import { useQuery } from "@tanstack/react-query";
import {
    transaccionesPagosQueryOptions,
    ordenesPendientesQueryOptions,
    facturasPendientesQueryOptions,
} from "./queryOptions";
import type { FetchTransaccionesParams } from "../../api/api";

export const useTransaccionesPagos = (params?: FetchTransaccionesParams) =>
    useQuery(transaccionesPagosQueryOptions(params));

export const useOrdenesPendientes = (q: string) =>
    useQuery(ordenesPendientesQueryOptions(q));

export const useFacturasPendientes = (q: string) =>
    useQuery(facturasPendientesQueryOptions(q));
