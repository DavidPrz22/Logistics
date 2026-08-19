import apiClient from "@/api/client";
import type { PaginatedTransacciones, OrdenPendiente, FacturaPendiente, CrearPagoInput, TransaccionPagoDetalle } from "../schemas/schemas";
import type { RegistroTasas, TasaCambio } from "@/types/zodType";

export interface FetchTransaccionesParams {
    page?: number;
    limit?: number;
    q?: string;
    estado?: string;
    tipo?: string;
    desde?: string;
    hasta?: string;
}

export const fetchTransaccionesPagos = async (
    params?: FetchTransaccionesParams
): Promise<PaginatedTransacciones> => {
    try {
        const { data } = await apiClient.get<PaginatedTransacciones>(
            "pagos/transacciones",
            { params }
        );
        return data;
    } catch (error) {
        console.error("Error fetching transacciones pagos:", error);
        throw error;
    }
};

export const fetchOrdenesPendientes = async (
    q: string
): Promise<OrdenPendiente[]> => {
    try {
        const { data } = await apiClient.get<OrdenPendiente[]>(
            "pagos/ordenes-pendientes",
            { params: { q } }
        );
        return data;
    } catch (error) {
        console.error("Error fetching ordenes pendientes:", error);
        throw error;
    }
};

export const fetchFacturasPendientes = async (
    q: string
): Promise<FacturaPendiente[]> => {
    try {
        const { data } = await apiClient.get<FacturaPendiente[]>(
            "pagos/facturas-pendientes",
            { params: { q } }
        );
        return data;
    } catch (error) {
        console.error("Error fetching facturas pendientes:", error);
        throw error;
    }
};

export const fetchTasasCambio = async (
    q?: string
): Promise<RegistroTasas[]> => {
    try {
        const { data } = await apiClient.get<RegistroTasas[]>(
            "core/registro-tasas",
            { params: { fecha: q } }
        );
        return data;
    } catch (error) {
        console.error("Error fetching facturas pendientes:", error);
        throw error;
    }
};


export const fetchTasasCambioByRegistro = async (registroId: number): Promise<TasaCambio[]> => {
  try {
    const { data } = await apiClient.get<TasaCambio[]>(`core/registro-tasas/${registroId}/tasas-cambio`);
    return data;
  } catch (error) {
    console.error("Error fetching tasas de cambio by registro:", error);
    throw error;
  }
};

export interface TransaccionPagoResponse {
  id: number;
  fecha: string;
  cliente: string;
  tipo: string;
  metodo: string;
  referencia: string | null;
  estado: string;
  montoOrigen: number;
  divisaSimbolo?: string;
  montoEquivalenteBase: number;
  montoCalculadoVes: number | null;
}

export const registrarPago = async (
  data: CrearPagoInput
): Promise<TransaccionPagoResponse> => {
  try {
    const payload = {
      documentoId: data.tipoPago === 'COBRO_FACTURA' ? data.documentoId : undefined,
      ordenId: data.tipoPago === 'ANTICIPO' ? data.ordenId : undefined,
      metodoPagoId: data.metodoPagoId,
      divisaPagoId: data.divisaPagoId,
      montoOrigen: data.montoPago,
      montoEquivalenteBase: data.montoEquivalenteBase,
      tasaAplicadaId: data.tasaAplicadaId || undefined,
      numeroReferencia: data.numeroReferencia,
      cuentaDestinoId: data.cuentaDestinoId,
      fechaPago: data.fechaPago ? new Date(data.fechaPago).toISOString() : undefined,
    };

    const { data: response } = await apiClient.post<TransaccionPagoResponse>(
      "pagos/transaccion",
      payload
    );
    return response;
  } catch (error) {
    console.error("Error registrando pago:", error);
    throw error;
  }
};

export const fetchTransaccionById = async (
  id: number
): Promise<TransaccionPagoDetalle> => {
  try {
    const { data } = await apiClient.get<TransaccionPagoDetalle>(
      `pagos/transaccion/${id}`
    );
    return data;
  } catch (error) {
    console.error("Error fetching transaccion by id:", error);
    throw error;
  }
};

export const anularTransaccion = async (
  id: number,
  motivo: string
): Promise<TransaccionPagoResponse> => {
  try {
    const { data } = await apiClient.post<TransaccionPagoResponse>(
      `pagos/transaccion/${id}/anular`,
      { motivo }
    );
    return data;
  } catch (error) {
    console.error("Error anulando transaccion:", error);
    throw error;
  }
};