import type { EstadoOrdenDespacho } from 'prisma/generated/prisma/enums';

export interface LoteSearchResult {
  id: number;
  varianteId: number;
  numeroLote: string;
  stockActual: number;
  fechaVencimiento: Date;
  sku: string;
  varianteNombre: string;
  productoNombre: string;
  precioBase: number;
}

export interface DetalleOrdenDespacho {
  id?: number;
  loteId: number;
  cantidadEnviada: number;
  precioUnitario: number;
}

export interface ListOrdenDespacho {
  id: number;
  numeroOrden: string;
  clienteNombre: string;
  choferNombre: string;
  FechaSalida: string;
  estado: EstadoOrdenDespacho;
  totalOriginal: number;
  saldoNetoCobrar: number;
}

export interface DetalleRechazoOrdenDetail {
  id: number;
  detalleOrdenId: number;
  cantidadRechazada: number;
  motivoRechazoId: number;
  motivoRechazoCodigo: string;
  motivoRechazoDescripcion: string;
  almacenReingresoId: number;
  almacenReingresoNombre: string;
  usuarioId: number;
  fechaRechazo: string;
  observaciones: string | null;
}

export interface DetalleOrdenDetail {
  id: number;
  ordenId: number;
  loteId: number;
  numeroLote: string;
  cantidadEnviada: number;
  precioUnitario: number;
  sku: string;
  stockActualLote: number;
  varianteNombre: string;
  productoNombre: string;
  rechazos: DetalleRechazoOrdenDetail[];
}

export interface OrdenDespachoDetail {
  id: number;
  numeroOrden: string;
  clienteId: number;
  clienteNombre: string;
  choferId: number | null;
  choferNombre: string | null;
  almacenTransitoId: number;
  almacenTransitoNombre: string;
  fechaSalida: string;
  estado: EstadoOrdenDespacho;
  totalOriginal: number;
  totalAbonado: number;
  saldoNetoCobrar: number;
  montoFacturadoNeto: number;
  totalRechazado: number;
  detalles: DetalleOrdenDetail[];
}
