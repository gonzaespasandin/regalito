"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/user";
import { profileFormSchema } from "@/lib/profile/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ProfileActionResult = { ok: true } | { ok: false; error: string };

const INVALID = "Revisá los datos del formulario.";

/**
 * Actualiza el perfil del usuario logueado. La RLS de `profiles` ya
 * limita el update al dueño (auth.uid() = id); igual validamos acá
 * para devolver un error claro y evitar requests inútiles.
 */
export async function updateProfileAction(
  input: unknown,
): Promise<ProfileActionResult> {
  const current = await getCurrentUser();
  if (!current) return { ok: false, error: "Tenés que loguearte primero." };

  const parsed = profileFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: INVALID };

  const { displayName, birthday } = parsed.data;
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName && displayName.trim() ? displayName.trim() : null,
      birthday: birthday && birthday.trim() ? birthday : null,
    })
    .eq("id", current.user.id);

  if (error) return { ok: false, error: "No se pudo guardar el perfil." };

  revalidatePath("/perfil");
  revalidatePath("/", "layout");
  return { ok: true };
}
