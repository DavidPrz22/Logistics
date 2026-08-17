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

export interface TasaCambioItem {
  id: number;
  divisaOrigenId: number;
  divisaDestinoId: number;
  tasa: number;
  tasaMoficada: number | null;
  fuente: string;
  fechaVigencia: string | null;
  divisaOrigen: {
    id: number;
    codigo: string;
    nombre: string;
    esMonedaBase: boolean | null;
  };
  divisaDestino: {
    id: number;
    codigo: string;
    nombre: string;
    esMonedaBase: boolean | null;
  };
}

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

export interface TransaccionPagoDetailResponse {
  id: number;
  fecha: string;
  tipoDePago: string;
  estado: string;
  tipoOperacion: string;
  montoOrigen: number;
  montoEquivalenteBase: number;
  montoCalculadoVes: number | null;
  tasaAplicadaValor: number | null;
  numeroReferencia: string | null;
  motivoAnulacion: string | null;
  metodoPago: {
    id: number;
    codigo: string;
    descripcion: string;
  };
  divisa: {
    id: number;
    codigo: string;
    nombre: string;
  };
  usuario: {
    id: number;
    nombreUsuario: string;
  };
  documento?: {
    id: number;
    sistemaOrigen: string;
    estado: string | null;
    montoTotalBase: number;
    saldoPendienteBase: number;
    cliente: {
      id: number;
      nombre: string;
    };
    orden: {
      id: number;
      numeroOrden: string;
    };
  } | null;
  orden?: {
    id: number;
    numeroOrden: string;
    estado: string | null;
    cliente: {
      id: number;
      nombre: string;
    };
  } | null;
  tasaAplicada?: {
    id: number;
    tasa: number;
    divisaOrigen: {
      codigo: string;
    };
    divisaDestino: {
      codigo: string;
    };
  } | null;
  cuentaDestino?: {
    id: number;
    nombre: string;
    tipo: string;
    divisa: {
      codigo: string;
    };
  } | null;
}
