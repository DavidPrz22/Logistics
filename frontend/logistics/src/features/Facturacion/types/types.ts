import type { EstadoDocumentoDeudaType, EstadoTransaccionPagoType, TipoDocumentoDeudaType } from '@/types/zodType';

export type EstadoDocumentoDeuda = EstadoDocumentoDeudaType;
export type EstadoTransaccionPago = EstadoTransaccionPagoType;
export type TipoDocumentoDeuda = TipoDocumentoDeudaType;

export interface FacturacionSearchParams {
  q: string;
  estado: string;
  tipo: string;
  fecha: string;
  page: number;
}
