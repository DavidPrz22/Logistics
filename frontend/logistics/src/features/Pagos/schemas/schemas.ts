import { z } from "zod";

const basePagoSchema = z.object({
  metodoPagoId: z.number(),
  numeroReferencia: z.string().optional(),
  divisaPagoId: z.number(),
  tasaAplicadaId: z.number().optional(),
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

export const transaccionPagoDetalleSchema = z.object({
  id: z.number(),
  fecha: z.string(),
  tipoDePago: z.string(),
  estado: z.string(),
  tipoOperacion: z.string(),
  montoOrigen: z.number(),
  montoEquivalenteBase: z.number(),
  montoCalculadoVes: z.number().nullable(),
  tasaAplicadaValor: z.number().nullable(),
  numeroReferencia: z.string().nullable(),
  motivoAnulacion: z.string().nullable(),
  metodoPago: z.object({
    id: z.number(),
    codigo: z.string(),
    descripcion: z.string(),
  }),
  divisa: z.object({
    id: z.number(),
    codigo: z.string(),
    nombre: z.string(),
  }),
  usuario: z.object({
    id: z.number(),
    nombreUsuario: z.string(),
  }),
  documento: z
    .object({
      id: z.number(),
      sistemaOrigen: z.string(),
      estado: z.string().nullable(),
      montoTotalBase: z.number(),
      saldoPendienteBase: z.number(),
      cliente: z.object({
        id: z.number(),
        nombre: z.string(),
      }),
      orden: z.object({
        id: z.number(),
        numeroOrden: z.string(),
      }),
    })
    .nullable(),
  orden: z
    .object({
      id: z.number(),
      numeroOrden: z.string(),
      estado: z.string().nullable(),
      cliente: z.object({
        id: z.number(),
        nombre: z.string(),
      }),
    })
    .nullable(),
  tasaAplicada: z
    .object({
      id: z.number(),
      tasa: z.number(),
      divisaOrigen: z.object({
        codigo: z.string(),
      }),
      divisaDestino: z.object({
        codigo: z.string(),
      }),
    })
    .nullable(),
  cuentaDestino: z
    .object({
      id: z.number(),
      nombre: z.string(),
      tipo: z.string(),
      divisa: z.object({
        codigo: z.string(),
      }),
    })
    .nullable(),
});

export type TransaccionPagoDetalle = z.infer<typeof transaccionPagoDetalleSchema>;

export const anularTransaccionSchema = z.object({
  motivo: z.string().min(4),
});

export type AnularTransaccionInput = z.infer<typeof anularTransaccionSchema>;