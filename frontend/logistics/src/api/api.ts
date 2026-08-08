import apiClient from "./client";
import type {
  Almacen,
  Chofer,
  Cliente,
  Divisa,
  TasaCambio,
  MetodoPago,
  MotivoRechazo,
  CuentaDestino,
  EstadoDocumentoDeudaType,
  EstadoTransaccionPagoType,
  TipoDocumentoDeudaType,
  TipoDePagoType,
  TipoOperacionPagoType,
} from "@/types/zodType";

export const fetchAlmacenes = async (): Promise<Almacen[]> => {
    try {
        const { data } = await apiClient.get<Almacen[]>('core/almacenes');
        return data;
    } catch (error) {
        console.error("Error fetching almacenes:", error);
        throw error;
    }
};

export const fetchChoferes = async (): Promise<Chofer[]> => {
    try {
        const { data } = await apiClient.get<Chofer[]>('core/choferes');
        return data;
    } catch (error) {
        console.error("Error fetching choferes:", error);
        throw error;
    }
};

export const fetchClientes = async (): Promise<Cliente[]> => {
    try {
        const { data } = await apiClient.get<Cliente[]>('core/clientes');
        return data;
    } catch (error) {
        console.error("Error fetching clientes:", error);
        throw error;
    }
};

export const fetchDivisas = async (): Promise<Divisa[]> => {
    try {
        const { data } = await apiClient.get<Divisa[]>('core/divisas');
        return data;
    } catch (error) {
        console.error("Error fetching divisas:", error);
        throw error;
    }
};

export const fetchTasasCambio = async (): Promise<TasaCambio[]> => {
    try {
        const { data } = await apiClient.get<TasaCambio[]>('core/tasas-cambio');
        return data;
    } catch (error) {
        console.error("Error fetching tasas de cambio:", error);
        throw error;
    }
};

export const fetchMetodosPago = async (): Promise<MetodoPago[]> => {
    try {
        const { data } = await apiClient.get<MetodoPago[]>('core/metodos-pago');
        return data;
    } catch (error) {
        console.error("Error fetching metodos de pago:", error);
        throw error;
    }
};

export const fetchMotivosRechazo = async (): Promise<MotivoRechazo[]> => {
    try {
        const { data } = await apiClient.get<MotivoRechazo[]>('core/motivo-rechazo');

        return data;
    } catch (error) {
        console.error("Error fetching motivos de pago:", error);
        throw error;
    }
};

export const fetchEstadosFacturas = async (): Promise<EstadoDocumentoDeudaType[]> => {
    try {
        const { data } = await apiClient.get<EstadoDocumentoDeudaType[]>('core/estados-facturas');
        return data;
    } catch (error) {
        console.error("Error fetching estados facturas:", error);
        throw error;
    }
};

export const fetchEstadosTransaccionesPago = async (): Promise<EstadoTransaccionPagoType[]> => {
    try {
        const { data } = await apiClient.get<EstadoTransaccionPagoType[]>('core/estados-transacciones-pago');
        return data;
    } catch (error) {
        console.error("Error fetching estados transacciones pago:", error);
        throw error;
    }
};

export const fetchTiposDocumento = async (): Promise<TipoDocumentoDeudaType[]> => {
    try {
        const { data } = await apiClient.get<TipoDocumentoDeudaType[]>('core/tipos-documento');
        return data;
    } catch (error) {
        console.error("Error fetching tipos documento:", error);
        throw error;
    }
};

export const fetchTiposPago = async (): Promise<TipoDePagoType[]> => {
    try {
        const { data } = await apiClient.get<TipoDePagoType[]>('core/tipos-pago');
        return data;
    } catch (error) {
        console.error("Error fetching tipos pago:", error);
        throw error;
    }
};

export const fetchTiposOperacion = async (): Promise<TipoOperacionPagoType[]> => {
    try {
        const { data } = await apiClient.get<TipoOperacionPagoType[]>('core/tipos-operacion');
        return data;
    } catch (error) {
        console.error("Error fetching tipos operacion:", error);
        throw error;
    }g
};

export const fetchCuentasDestino = async (): Promise<CuentaDestino[]> => {
    try {
        const { data } = await apiClient.get<CuentaDestino[]>('core/cuentas-destino');
        return data;
    } catch (error) {
        console.error("Error fetching cuentas destino:", error);
        throw error;
    }
};

