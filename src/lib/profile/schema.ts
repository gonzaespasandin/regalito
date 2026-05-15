import { z } from "zod";

/**
 * Schema del form de perfil. El email y el avatar vienen de Google y no
 * se editan acá. El cumpleaños es opcional — habilita el recordatorio.
 */
export const profileFormSchema = z.object({
  displayName: z
    .string()
    .trim()
    .max(80, "El nombre es demasiado largo")
    .optional()
    .or(z.literal("")),
  birthday: z
    .union([
      z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Usá el formato AAAA-MM-DD")
        .refine((value) => !Number.isNaN(Date.parse(value)), "Fecha inválida"),
      z.literal(""),
    ])
    .optional(),
});

export type ProfileFormInput = z.infer<typeof profileFormSchema>;
