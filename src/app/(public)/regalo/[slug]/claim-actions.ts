"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/user";
import { claimFormSchema } from "@/lib/claims/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ClaimActionResult = { ok: true } | { ok: false; error: string };

const INVALID = "Revisá los datos del formulario.";

/**
 * Crea o actualiza el claim del usuario actual para un gift (upsert por
 * unique constraint profile_id+gift_id). Devuelve void/result según falle.
 */
export async function submitClaimAction(
  giftId: string,
  input: unknown,
): Promise<ClaimActionResult> {
  const current = await getCurrentUser();
  if (!current) return { ok: false, error: "Tenés que loguearte primero." };

  const parsed = claimFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: INVALID };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("gift_claims").upsert(
    {
      profile_id: current.user.id,
      gift_id: giftId,
      outcome: parsed.data.outcome,
      comment:
        parsed.data.comment && parsed.data.comment.trim()
          ? parsed.data.comment.trim()
          : null,
    },
    { onConflict: "profile_id,gift_id" },
  );

  if (error) return { ok: false, error: "No se pudo guardar tu respuesta." };

  revalidatePath("/", "layout");
  return { ok: true };
}

/** Borra el claim del usuario actual sobre este gift. */
export async function deleteClaimAction(giftId: string): Promise<void> {
  const current = await getCurrentUser();
  if (!current) return;

  const supabase = await createSupabaseServerClient();
  await supabase
    .from("gift_claims")
    .delete()
    .eq("gift_id", giftId)
    .eq("profile_id", current.user.id);

  revalidatePath("/", "layout");
}
