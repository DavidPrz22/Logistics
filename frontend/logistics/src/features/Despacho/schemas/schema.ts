import { z } from 'zod'

export const detallesOrdenDespachoSchema = z.object({
    id: z.number().optional(),
    loteId: z.number().int().positive({ message: "ID de lote inválido" }),
    cantidadEnviada: z.number().min(0).positive({ message: "La cantidad debe ser mayor a 0" }),
    precioUnitario: z.number().positive({ message: "El precio debe ser mayor a 0" }),
    precioUnitarioVes: z.number().optional(),
    subtotalVes: z.number().optional()
})

export const ordenDespachoSchema = z.object({
    clienteId: z.number().int().positive({ message: "ID de cliente inválido" }),
    choferId: z.number().int().positive({ message: "ID de chofer inválido" }).optional(),
    fechaSalida: z.date(),
    almacenTransitoId: z.number().int().positive({ message: "ID de almacén inválido" }),
    tipoOrden: z.enum(['DESPACHO_RUTA', 'VENTA_MOSTRADOR']),
    totalFacturado: z.number().positive({ message: "El total debe ser mayor a 0" }),
    tasaCambioId: z.number().int().positive({ message: "Tasa de cambio requerida" }),
    detallesOrdenDespacho: z.array(detallesOrdenDespachoSchema).optional()
}).superRefine((data, ctx) => {
    if (data.tipoOrden === 'DESPACHO_RUTA' && !data.choferId) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "El chofer es obligatorio para Despacho a Ruta",
            path: ['choferId'],
        });
    }
});

export const loteSearchResultSchema = z.object({
  id: z.number(),
  varianteId: z.number(),
  numeroLote: z.string(),
  stockActual: z.number(),
  fechaVencimiento: z.string(),
  sku: z.string(),
  varianteNombre: z.string(),
  productoNombre: z.string(),
  precioBase: z.number(),
});


export type DetallesOrdenDespacho = z.infer<typeof detallesOrdenDespachoSchema>
export type OrdenDespacho = z.infer<typeof ordenDespachoSchema>
export type LoteSearchResult = z.infer<typeof loteSearchResultSchema>;

export const listOrdenDespachoSchema = z.object({
  id: z.number(),
  numeroOrden: z.string(),
  clienteNombre: z.string(),
  choferNombre: z.string(),
  FechaSalida: z.string(),
  estado: z.enum(['PREPARACION', 'EN_RUTA', 'LIQUIDADA']),
  tipoOrden: z.enum(['DESPACHO_RUTA', 'VENTA_MOSTRADOR']),
  totalOriginal: z.number(),
  saldoNetoCobrar: z.number(),
});

export type ListOrdenDespacho = z.infer<typeof listOrdenDespachoSchema>;

export const detalleRechazoOrdenSchema = z.object({
  id: z.number(),
  detalleOrdenId: z.number(),
  cantidadRechazada: z.number(),
  motivoRechazoId: z.number(),
  motivoRechazoCodigo: z.string(),
  motivoRechazoDescripcion: z.string(),
  almacenReingresoId: z.number(),
  almacenReingresoNombre: z.string(),
  usuarioId: z.number(),
  fechaRechazo: z.string(),
  observaciones: z.string().nullable(),
});

export const detalleOrdenDetailSchema = z.object({
  id: z.number(),
  ordenId: z.number(),
  loteId: z.number(),
  numeroLote: z.string(),
  stockActualLote: z.number(),
  cantidadEnviada: z.number(),
  precioUnitario: z.number(),
  precioUnitarioVes: z.number().nullable(),
  subtotalVes: z.number().nullable(),
  sku: z.string(),
  varianteNombre: z.string(),
  productoNombre: z.string(),
  rechazos: z.array(detalleRechazoOrdenSchema),
});

export const anticipoDetailSchema = z.object({
  id: z.number(),
  montoEquivalenteBase: z.number(),
  metodoPagoDescripcion: z.string(),
  fechaPago: z.string(),
  numeroReferencia: z.string().nullable(),
});

export const documentoDeudaDetailSchema = z.object({
  id: z.number(),
  estado: z.enum(['PENDIENTE', 'PAGADO_PARCIAL', 'PAGADO_TOTAL', 'ANULADO']),
  tipoDocumento: z.enum(['FACTURA', 'NOTA_CREDITO']),
});

export const tasaCambioInfoSchema = z.object({
  origen: z.string(),
  destino: z.string(),
  tasa: z.number(),
  fecha: z.string(),
});

export const ordenDespachoDetailSchema = z.object({
  id: z.number(),
  numeroOrden: z.string(),
  clienteId: z.number(),
  clienteNombre: z.string(),
  choferId: z.number().nullable(),
  choferNombre: z.string().nullable(),
  almacenTransitoId: z.number(),
  almacenTransitoNombre: z.string(),
  fechaSalida: z.string(),
  estado: z.enum(['PREPARACION', 'EN_RUTA', 'LIQUIDADA']),
  tasaCambioId: z.number().nullable(),
  tasaCambioValor: z.number().nullable(),
  tasaCambioInfo: tasaCambioInfoSchema.nullable(),
  tipoOrden: z.enum(['DESPACHO_RUTA', 'VENTA_MOSTRADOR']),
  totalOriginal: z.number(),
  totalOriginalVes: z.number(),
  saldoNetoCobrar: z.number(),
  totalAbonado: z.number(),
  montoFacturadoNeto: z.number(),
  montoFacturadoNetoVes: z.number(),
  totalRechazado: z.number(),
  anticipos: z.array(anticipoDetailSchema),
  documentoDeuda: documentoDeudaDetailSchema.nullable(),
  detalles: z.array(detalleOrdenDetailSchema),
});

export type TasaCambioInfo = z.infer<typeof tasaCambioInfoSchema>;

export type DetalleRechazoOrden = z.infer<typeof detalleRechazoOrdenSchema>;
export type DetalleOrdenDetail = z.infer<typeof detalleOrdenDetailSchema>;
export type OrdenDespachoDetail = z.infer<typeof ordenDespachoDetailSchema>;
export type AnticipoDetail = z.infer<typeof anticipoDetailSchema>;
export type DocumentoDeudaDetail = z.infer<typeof documentoDeudaDetailSchema>;


const detallesRechazoSchema = z.object({
  cantidadRechazada: z.number(),
  motivoRechazoId: z.number(),
  almacenReingresoId: z.number(),
  observaciones: z.string().optional()
})

const detallesLiquidacionSchema = z.object({
  detalleId: z.number(),
  rechazos: z.array(detallesRechazoSchema)
})

export const liquidacionSchema = z.object({
  ordenId: z.number(),
  detallesLiquidacion: z.array(detallesLiquidacionSchema) 
})

export type RechazoSchema = z.infer<typeof detallesRechazoSchema>
export type LiquidacionSchema = z.infer<typeof liquidacionSchema>