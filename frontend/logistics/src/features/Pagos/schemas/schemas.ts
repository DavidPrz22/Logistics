import { z } from "zod";

const basePagoSchema = z.object({
  metodoPagoId: z.number(),
  numeroReferencia: z.string().optional(),
  divisaPagoId: z.number(),
  tasaAplicadaId: z.number(),
  montoPago: z.number().min(0.01),
  cuentaDestinoId: z.number(),
  fechaPago: z.date(),
  usuario: z.string().optional(),
});

export const crearPagoSchema = z.discriminatedUnion('tipoPago', [
  basePagoSchema.extend({
    tipoPago: z.literal('ANTICIPO'),
    ordenId: z.number(),
  }),
  basePagoSchema.extend({
    tipoPago: z.literal('COBRO_FACTURA'),
    documentoId: z.number(),
  }),
]);

export type CrearPagoInput = z.infer<typeof crearPagoSchema>;

export const transaccionTablaSchema = z.object({
    id: z.number(),
    fecha: z.string(),
    cliente: z.string(),
    tipo: z.string(),
    metodo: z.string(),
    referencia: z.string().nullable(),
    estado: z.enum(['APROBADO', 'ANULADO', 'RECHAZADO']),
    montoOrigen: z.number(),
    divisaSimbolo: z.string().optional(),
});

export type TransaccionTabla = z.infer<typeof transaccionTablaSchema>;

export const paginatedTransaccionesSchema = z.object({
    data: z.array(transaccionTablaSchema),
    meta: z.object({
        total: z.number(),
        page: z.number(),
        limit: z.number(),
        totalPages: z.number(),
    }),
});

export type PaginatedTransacciones = z.infer<typeof paginatedTransaccionesSchema>;

export const ordenPendienteSchema = z.object({
    id: z.number(),
    numeroOrden: z.string(),
    estado: z.string(),
    clienteNombre: z.string(),
    totalOriginal: z.number(),
});

export type OrdenPendiente = z.infer<typeof ordenPendienteSchema>;

export const facturaPendienteSchema = z.object({
    id: z.number(),
    numeroOrden: z.string(),
    clienteNombre: z.string(),
    saldoPendienteBase: z.number(),
});

export type FacturaPendiente = z.infer<typeof facturaPendienteSchema>;