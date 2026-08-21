import { z } from 'zod';

export const varianteKardexSchema = z.object({
  id: z.number(),
  sku: z.string(),
  nombre: z.string(),
});

export const kardexSearchSchema = z.object({
  id: z.number().optional(),
  nombre: z.string(),
  variantes: z.array(varianteKardexSchema),
});

export type KardexSearch = z.infer<typeof kardexSearchSchema>;
export type VarianteKardex = z.infer<typeof varianteKardexSchema>;
