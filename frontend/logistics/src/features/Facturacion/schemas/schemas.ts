import { z } from 'zod';
import { listadoOrigenSchema, estadoDocumentoDeudaSchema, tipoDocumentoDeudaSchema, tipoDePagoSchema, estadoTransaccionPagoSchema } from '@/types/zodType';

export const documentoDeudaListadoSchema = z.object({
  id: z.number(),
  sistema_origen: listadoOrigenSchema,
  numero_orden: z.string(),
  identificador_cliente: z.string(),
  monto_total_base: z.number(),
  estado: estadoDocumentoDeudaSchema,
  tipo_documento: tipoDocumentoDeudaSchema,
  fecha_emision: z.string(),
});

export const pagosVinculadosDocumentoSchema = z.object({
  id: z.number(),
  documento_id: z.number().nullable(),
  orden_id: z.number().nullable(),
  tipo_de_pago: tipoDePagoSchema,
  metodo_pago: z.string(),
  divisa_pago: z.string(),
  monto_origen: z.number(),
  numero_referencia: z.string().optional(),
  estado: estadoTransaccionPagoSchema,
  fecha_pago: z.string(),
  cuenta_destino_id: z.number().nullable(),
  cuenta_destino: z.string(),
  motivo_anulacion: z.string().optional(),
});

export const documentoDeudaDetalleSchema = z.object({
  id: z.number(),
  sistema_origen: listadoOrigenSchema,
  orden_id: z.number(),
  numero_orden: z.string(),
  identificador_cliente: z.string(),
  monto_total_base: z.number(),
  saldo_pendiente_base: z.number(),
  estado: estadoDocumentoDeudaSchema,
  tipo_documento: tipoDocumentoDeudaSchema,
  fecha_emision: z.string(),
  transacciones_pago: z.array(pagosVinculadosDocumentoSchema),
});


export type DocumentoDeudaListadoType = z.infer<typeof documentoDeudaListadoSchema>;
export type DocumentoDeudaDetalleType = z.infer<typeof documentoDeudaDetalleSchema>;
export type PagosVinculadosDocumentoType = z.infer<typeof pagosVinculadosDocumentoSchema>;