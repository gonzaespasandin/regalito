import { z } from "zod";

export const claimOutcomeValues = ["claimed", "failed"] as const;

/**
 * Input para crear/actualizar un claim. Outcome es obligatorio (lo
 * eligió tocando un botón). Comentario opcional pero limitado.
 */
export const claimFormSchema = z.object({
  outcome: z.enum(claimOutcomeValues),
  comment: z
    .string()
    .trim()
    .max(800, "El comentario es demasiado largo")
    .optional()
    .or(z.literal("")),
});

export type ClaimFormInput = z.infer<typeof claimFormSchema>;
