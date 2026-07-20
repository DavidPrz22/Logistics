import { z } from 'zod';

export const almacenSchema = z.object({
  id: z.number(),
  nombre: z.string(),
  tipo: z.enum(['PRINCIPAL', 'TRANSITO', 'MERMA']),
});

export const choferSchema = z.object({
  id: z.number(),
  nombre: z.string(),
  licenciaConducir: z.string(),
  telefono: z.string().nullable(),
});

export const clienteSchema = z.object({
  id: z.number(),
  nombre: z.string(),
  telefono: z.string().nullable(),
  direccion: z.string().nullable(),
});

export const divisaSchema = z.object({
  id: z.number(),
  codigo: z.string(),
  nombre: z.string(),
  esMonedaBase: z.boolean().nullable(),
});

export const tasaCambioSchema = z.object({
  id: z.number(),
  divisaOrigenId: z.number(),
  divisaDestinoId: z.number(),
  tasa: z.number(),
  origenTasa: z.string().nullable(),
  fechaVigencia: z.string().nullable(),
  divisaOrigen: divisaSchema,
  divisaDestino: divisaSchema,
});

export const metodoPagoSchema = z.object({
  id: z.number(),
  codigo: z.string(),
  descripcion: z.string(),
  requiereReferencia: z.boolean().nullable(),
});


export type Almacen = z.infer<typeof almacenSchema>;
export type Chofer = z.infer<typeof choferSchema>;
export type Cliente = z.infer<typeof clienteSchema>;
export type Divisa = z.infer<typeof divisaSchema>;
export type TasaCambio = z.infer<typeof tasaCambioSchema>;
export type MetodoPago = z.infer<typeof metodoPagoSchema>;
