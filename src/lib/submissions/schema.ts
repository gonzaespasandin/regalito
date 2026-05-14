import { z } from "zod";

/**
 * Schema único de una propuesta de regalito. Fuente de verdad compartida
 * por el formulario (cliente) y la server action (servidor).
 */
export const giftSubmissionSchema = z.object({
  businessName: z
    .string()
    .trim()
    .min(2, "Poné el nombre del local o marca")
    .max(80, "El nombre es demasiado largo"),
  name: z
    .string()
    .trim()
    .min(4, "Contanos qué regalan")
    .max(120, "El título es demasiado largo"),
  description: z
    .string()
    .trim()
    .min(10, "Sumá una descripción un poco más larga")
    .max(600, "La descripción es demasiado larga"),
  citySlug: z.string().min(1, "Elegí una ciudad"),
  categorySlug: z.string().min(1, "Elegí una categoría"),
  address: z
    .string()
    .trim()
    .min(2, "Poné la dirección o 'Todas las sucursales'")
    .max(160, "La dirección es demasiado larga"),
  requirements: z
    .array(
      z.object({
        value: z
          .string()
          .trim()
          .min(2, "Requisito demasiado corto")
          .max(160, "Requisito demasiado largo"),
      }),
    )
    .min(1, "Agregá al menos un requisito")
    .max(8, "Con 8 requisitos alcanza"),
  sourceUrl: z
    .union([z.string().trim().url("Tiene que ser un link válido"), z.literal("")])
    .optional(),
  submitterName: z
    .string()
    .trim()
    .max(80, "El nombre es demasiado largo")
    .optional(),
  submitterEmail: z
    .union([z.string().trim().email("Ese email no parece válido"), z.literal("")])
    .optional(),
});

export type GiftSubmissionInput = z.infer<typeof giftSubmissionSchema>;
