import type {
  EstadoDocumentoDeuda,
  TipoDocumentoDeuda,
  ListadoOrigen,
  EstadoTransaccionPago,
  TipoDePago,
} from 'prisma/generated/prisma/enums';

export interface DocumentoDeudaListado {
  id: number;
  sistema_origen: ListadoOrigen;
  numero_orden: string;
  identificador_cliente: string;
  monto_total_base: number;
  estado: EstadoDocumentoDeuda;
  tipo_documento: TipoDocumentoDeuda;
  fecha_emision: string;
}

export interface PagosVinculadosDocumento {
  id: number;
  documento_id: number | null;
  orden_id: number | null;
  tipo_de_pago: TipoDePago;
  metodo_pago: string;
  divisa_pago: string;
  monto_origen: number;
  numero_referencia?: string;
  estado: EstadoTransaccionPago;
  fecha_pago: string;
  cuenta_destino_id: number | null;
  cuenta_destino: string;
  motivo_anulacion?: string;
}

export interface DocumentoDeudaDetalle {
  id: number;
  sistema_origen: ListadoOrigen;
  orden_id: number;
  numero_orden: string;
  identificador_cliente: string;
  monto_total_base: number;
  saldo_pendiente_base: number;
  estado: EstadoDocumentoDeuda;
  tipo_documento: TipoDocumentoDeuda;
  fecha_emision: string;
  transacciones_pago: PagosVinculadosDocumento[];
}
