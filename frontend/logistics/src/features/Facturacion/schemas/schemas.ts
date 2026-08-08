import { z } from 'zod';
import {
  listadoOrigenSchema,
  estadoDocumentoDeudaSchema,
  tipoDocumentoDeudaSchema,
  tipoDePagoSchema,
  estadoTransaccionPagoSchema,
} from '@/types/zodType';

export const documentoDeudaListadoSchema = z.object({
  id: z.number(),
  sistemaOrigen: listadoOrigenSchema,
  numeroOrden: z.string(),
  identificadorCliente: z.string(),
  montoTotalBase: z.number(),
  estado: estadoDocumentoDeudaSchema,
  tipoDocumento: tipoDocumentoDeudaSchema,
  fechaEmision: z.string(),
});

export const paginatedDocumentosSchema = z.object({
  data: z.array(documentoDeudaListadoSchema),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
});

export const pagosVinculadosDocumentoSchema = z.object({
  id: z.number(),
  documentoId: z.number().nullable(),
  ordenId: z.number().nullable(),
  tipoDePago: tipoDePagoSchema,
  metodoPago: z.string(),
  divisaPago: z.string(),
  montoOrigen: z.number(),
  numeroReferencia: z.string().optional(),
  estado: estadoTransaccionPagoSchema,
  fechaPago: z.string(),
  cuentaDestinoId: z.number().nullable(),
  cuentaDestino: z.string(),
  motivoAnulacion: z.string().optional(),
});

export const documentoDeudaDetalleSchema = z.object({
  id: z.number(),
  sistemaOrigen: listadoOrigenSchema,
  ordenId: z.number(),
  numeroOrden: z.string(),
  identificadorCliente: z.string(),
  montoTotalBase: z.number(),
  saldoPendienteBase: z.number(),
  totalAbonado: z.number(),
  estado: estadoDocumentoDeudaSchema,
  tipoDocumento: tipoDocumentoDeudaSchema,
  fechaEmision: z.string(),
  transaccionesPago: z.array(pagosVinculadosDocumentoSchema),
});

export type DocumentoDeudaListadoType = z.infer<typeof documentoDeudaListadoSchema>;
export type PaginatedDocumentosType = z.infer<typeof paginatedDocumentosSchema>;
export type DocumentoDeudaDetalleType = z.infer<typeof documentoDeudaDetalleSchema>;
export type PagosVinculadosDocumentoType = z.infer<typeof pagosVinculadosDocumentoSchema>;

export type DocumentoDeudaListado = DocumentoDeudaListadoType;
export type PaginatedDocumentos = PaginatedDocumentosType;
export type DocumentoDeudaDetalle = DocumentoDeudaDetalleType;
export type PagosVinculadosDocumento = PagosVinculadosDocumentoType;
