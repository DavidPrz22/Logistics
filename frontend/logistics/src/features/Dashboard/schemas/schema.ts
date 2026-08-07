import { z } from 'zod';

export const tasaModificadaItemSchema = z.object({
  id: z.number(),
  tasaModificada: z
    .number()
    .positive({ message: 'La tasa debe ser mayor a 0' })
    .multipleOf(0.0001, { message: 'Máximo 4 decimales permitidos' }),
});

export const updateTasasCambioSchema = z.object({
  tasas: z.array(tasaModificadaItemSchema),
});

export type UpdateTasasCambio = z.infer<typeof updateTasasCambioSchema>;
export type TasaModificadaItem = z.infer<typeof tasaModificadaItemSchema>;
