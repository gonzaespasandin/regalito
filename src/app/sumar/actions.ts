"use server";

import { giftSubmissionSchema } from "@/lib/submissions/schema";
import { createSubmission } from "@/lib/submissions/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SubmitResult = { ok: true } | { ok: false; error: string };

/**
 * Recibe una propuesta de regalito desde el formulario público.
 * Revalida en el servidor (no se confía en el cliente) y la inserta en la
 * cola de moderación. Usa el cliente con publishable key: la policy de RLS
 * de `submissions` ya permite ese INSERT (menor privilegio que service role).
 */
export async function submitGift(input: unknown): Promise<SubmitResult> {
  const parsed = giftSubmissionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Revisá los datos del formulario." };
  }

  try {
    const supabase = await createSupabaseServerClient();
    await createSubmission(supabase, parsed.data);
    return { ok: true };
  } catch {
    return {
      ok: false,
      error: "No pudimos guardar tu regalito. Probá de nuevo en un rato.",
    };
  }
}
