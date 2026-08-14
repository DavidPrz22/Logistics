import type {
  EstadoDocumentoDeuda,
  TipoDocumentoDeuda,
  ListadoOrigen,
  EstadoTransaccionPago,
  TipoDePago,
} from 'prisma/generated/prisma/enums';

export interface DocumentoDeudaListado {
  id: number;
  sistemaOrigen: ListadoOrigen;
  numeroOrden: string;
  identificadorCliente: string;
  montoTotalBase: number;
  estado: EstadoDocumentoDeuda;
  tipoDocumento: TipoDocumentoDeuda;
  fechaEmision: string;
}

export interface PaginatedDocumentosResponse {
  data: DocumentoDeudaListado[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PagosVinculadosDocumento {
  id: number;
  documentoId: number | null;
  ordenId: number | null;
  tipoDePago: TipoDePago;
  metodoPago: string;
  divisaPago: string;
  montoOrigen: number;
  numeroReferencia?: string;
  estado: EstadoTransaccionPago;
  fechaPago: string;
  cuentaDestinoId: number | null;
  cuentaDestino: string;
  motivoAnulacion?: string;
}

export interface DocumentoDeudaDetalle {
  id: number;
  sistemaOrigen: ListadoOrigen;
  ordenId: number;
  numeroOrden: string;
  identificadorCliente: string;
  montoTotalBase: number;
  montoTotalVes: number | null;
  saldoPendienteBase: number;
  saldoPendienteVes: number | null;
  tasaEmisionValor: number | null;
  totalAbonado: number;
  estado: EstadoDocumentoDeuda;
  tipoDocumento: TipoDocumentoDeuda;
  fechaEmision: string;
  transaccionesPago: PagosVinculadosDocumento[];
}
