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
  tasaMoficada: z.number().nullable(),
  registroTasasId: z.number(),
  fuente: z.enum(['BCV', 'BINANCE_P2P', 'BYBIT_P2P', 'PARALELO']),
  fechaVigencia: z.string().nullable(),
  divisaOrigen: divisaSchema,
  divisaDestino: divisaSchema,
});

export const registroTasasSchema = z.object({
  id: z.number(),
  nombre: z.string().nullable(),
  createdAt: z.string(),
});

export const metodoPagoSchema = z.object({
  id: z.number(),
  codigo: z.string(),
  descripcion: z.string(),
  requiereReferencia: z.boolean().nullable(),
});

export const motivosRechazoSchema = z.object({
  id: z.number(),
  codigo: z.string(),
  descripcion: z.string(),
  requiere_merma: z.boolean(),
});

export const estadoDocumentoDeudaSchema = z.enum([
  'PENDIENTE',
  'PAGADO_PARCIAL',
  'PAGADO_TOTAL',
  'ANULADO',
]);

export const estadoTransaccionPagoSchema = z.enum([
  'APROBADO',
  'ANULADO',
  'RECHAZADO',
]);

export const tipoDocumentoDeudaSchema = z.enum(['FACTURA', 'NOTA_CREDITO']);

export const tipoDePagoSchema = z.enum([
  'ANTICIPO',
  'COBRO_FACTURA',
  'SALDO_A_FAVOR',
]);

export const tipoOperacionPagoSchema = z.enum(['INGRESO', 'EGRESO']);

export const tipoCuentaDestinoSchema = z.enum([
  'CAJA_FISICA',
  'BANCO',
  'BILLETERA_DIGITAL',
]);

export const listadoOrigenSchema = z.enum([
  'RUTA_LIQUIDADA',
  'VENTA_MOSTRADOR',
]);

export const cuentaDestinoSchema = z.object({
  id: z.number(),
  nombre: z.string(),
  divisaId: z.number(),
  tipo: tipoCuentaDestinoSchema,
  divisa: divisaSchema.optional(),
});


export type Almacen = z.infer<typeof almacenSchema>;
export type Chofer = z.infer<typeof choferSchema>;
export type Cliente = z.infer<typeof clienteSchema>;
export type Divisa = z.infer<typeof divisaSchema>;
export type TasaCambio = z.infer<typeof tasaCambioSchema>;
export type MetodoPago = z.infer<typeof metodoPagoSchema>;
export type MotivoRechazo = z.infer<typeof motivosRechazoSchema>;
export type RegistroTasas = z.infer<typeof registroTasasSchema>;
export type EstadoDocumentoDeudaType = z.infer<typeof estadoDocumentoDeudaSchema>;
export type EstadoTransaccionPagoType = z.infer<typeof estadoTransaccionPagoSchema>;
export type TipoDocumentoDeudaType = z.infer<typeof tipoDocumentoDeudaSchema>;
export type TipoDePagoType = z.infer<typeof tipoDePagoSchema>;
export type TipoOperacionPagoType = z.infer<typeof tipoOperacionPagoSchema>;
export type CuentaDestino = z.infer<typeof cuentaDestinoSchema>;