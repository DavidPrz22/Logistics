export interface OrdenPendienteResponse {
  id: number;
  numeroOrden: string;
  estado: string;
  clienteNombre: string;
  totalOriginal: number;
}

export interface FacturaPendienteResponse {
  id: number;
  numeroOrden: string;
  clienteNombre: string;
  saldoPendienteBase: number;
}

export interface TransaccionTablaResponse {
  id: number;
  fecha: string;
  cliente: string;
  tipo: string;
  metodo: string;
  referencia: string | null;
  estado: string;
  montoOrigen: number;
  divisaSimbolo?: string;
}

export interface PaginatedTransaccionesResponse {
  data: TransaccionTablaResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
