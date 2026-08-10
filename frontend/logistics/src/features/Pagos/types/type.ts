export type TipoDePago = string; // Reemplaza por los valores reales de tu Enum (ej: 'CONTADO' | 'CREDITO')
export type EstadoTransaccionPago = 'APROBADO' | 'PENDIENTE' | 'RECHAZADO';
export type TipoOperacionPago = 'INGRESO' | 'EGRESO';



export type TransaccionTablaType = {
  id: number;                           // ID
  fecha: string;                 // Fecha
  cliente: string;                // Cliente / Origen (derivado de cliente u orden)
  tipo: TipoDePago;                     // Tipo
  metodo: string;                       // Método (nombre de metodoPago)
  referencia: string | null;            // Referencia
  estado: EstadoTransaccionPago;        // Estado
  montoOrigen: number;                  // Monto origen
  divisaSimbolo?: string;               // Opcional para mostrar en la celda de monto
}

export interface TransaccionPagoDetalleType {
  id: number;
  documentoId?: number | null;
  ordenId?: number | null;
  tipoDePago: TipoDePago;
  metodoPagoId: number;
  divisaPagoId: number;
  montoOrigen: number; // Puedes usar `number` o `Decimal` de Prisma/decimal.js según tu stack
  tasaAplicadaId: number;
  montoEquivalenteBase: number;
  numeroReferencia?: string | null;
  estado?: EstadoTransaccionPago | null;
  tipoOperacion?: TipoOperacionPago | null;
  fechaPago?: Date | string | null;
  cuentaDestinoId?: number | null;
  usuarioId: number;
}