import { z } from 'zod'

export const detallesOrdenDespachoSchema = z.object({
    id: z.number().optional(),
    loteId: z.number().int().positive({ message: "ID de lote inválido" }),
    cantidadEnviada: z.number().min(0).positive({ message: "La cantidad debe ser mayor a 0" }),
    precioUnitario: z.number().positive({ message: "El precio debe ser mayor a 0" })
})

export const ordenDespachoSchema = z.object({
    clienteId: z.number().int().positive({ message: "ID de cliente inválido" }),
    choferId: z.number().int().positive({ message: "ID de chofer inválido" }),
    fechaSalida: z.date(),
    almacenTransitoId: z.number().int().positive({ message: "ID de almacén inválido" }),
    saldoNetoCobrar: z.number().positive({ message: "El total debe ser mayor a 0" }),
    detallesOrdenDespacho: z.array(detallesOrdenDespachoSchema).optional()
})

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
  totalFactudaroOriginal: z.number(),
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
  sku: z.string(),
  varianteNombre: z.string(),
  productoNombre: z.string(),
  rechazos: z.array(detalleRechazoOrdenSchema),
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
  totalFacturadoOriginal: z.number(),
  saldoNetoCobrar: z.number(),
  totalRechazado: z.number(),
  detalles: z.array(detalleOrdenDetailSchema),
});

export type DetalleRechazoOrden = z.infer<typeof detalleRechazoOrdenSchema>;
export type DetalleOrdenDetail = z.infer<typeof detalleOrdenDetailSchema>;
export type OrdenDespachoDetail = z.infer<typeof ordenDespachoDetailSchema>;