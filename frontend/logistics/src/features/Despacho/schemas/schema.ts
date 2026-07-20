import { z } from 'zod'

export const detallesOrdenDespachoSchema = z.object({
    loteId: z.number().int().positive({ message: "ID de lote inválido" }),
    cantidadEnviada: z.number().positive({ message: "La cantidad debe ser mayor a 0" }),
    precioUnitario: z.number().nonnegative({ message: "El precio no puede ser negativo" })
})

export const ordenDespachoSchema = z.object({
    clienteId: z.number().int().positive({ message: "ID de cliente inválido" }),
    choferId: z.number().int().positive({ message: "ID de chofer inválido" }),
    fechaSalida: z.date(),
    almacenTransitoId: z.number().int().positive({ message: "ID de almacén inválido" }),
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