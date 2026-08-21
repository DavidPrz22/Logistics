import { z } from 'zod';

export const varianteKardexSchema = z.object({
  id: z.number(),
  sku: z.string(),
  nombre: z.string(),
  precioBase: z.number().optional(),
});

export const kardexSearchSchema = z.object({
  id: z.number().optional(),
  nombre: z.string(),
  variantes: z.array(varianteKardexSchema),
});

export const kardexMovimientoRowSchema = z.object({
  id: z.number(),
  fechaMovimiento: z.string(),
  tipoMovimiento: z.enum(['ENTRADA', 'SALIDA']),
  cantidad: z.number(),
  saldo: z.number(),
  costoUnitario: z.number(),
  precioUnitario: z.number().optional(),
  numeroLote: z.string(),
  loteId: z.number(),
  almacen: z.object({
    id: z.number(),
    nombre: z.string(),
    tipo: z.enum(['PRINCIPAL', 'TRANSITO', 'MERMA']).optional(),
  }),
  documento: z.string(),
  operacion: z.string(),
  ordenId: z.number().nullable().optional(),
  usuario: z.string().optional(),
  referencia: z.string().optional(),
});

export const kardexDetailSchema = z.object({
  producto: z.object({
    id: z.number(),
    nombre: z.string(),
    descripcion: z.string().nullable().optional(),
  }),
  varianteActual: z.object({
    id: z.number(),
    sku: z.string(),
    nombre: z.string(),
    precioBase: z.number(),
    existenciaTotal: z.number(),
  }),
  variantes: z.array(varianteKardexSchema),
  movimientos: z.array(kardexMovimientoRowSchema),
  resumen: z.object({
    existenciaActual: z.number(),
    totalEntradas: z.number(),
    totalSalidas: z.number(),
    totalMovimientos: z.number(),
  }),
});

export type KardexMovimientoRow = z.infer<typeof kardexMovimientoRowSchema>;
export type KardexDetail = z.infer<typeof kardexDetailSchema>;
export type KardexSearch = z.infer<typeof kardexSearchSchema>;
export type VarianteKardex = z.infer<typeof varianteKardexSchema>;
