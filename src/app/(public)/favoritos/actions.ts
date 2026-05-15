"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/user";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Toggle del favorito para un gift. Si ya existe lo borra, si no lo crea.
 * Sigue la RLS de `favorites`: el server client opera como el usuario
 * logueado vía cookies, así solo afecta sus propios favoritos.
 *
 * Devuelve `void` para ser usable directo como `<form action>`. Si falla
 * (anónimo, error de DB), simplemente no toggleamos — la UI lo refleja.
 */
export async function toggleFavoriteAction(giftId: string): Promise<void> {
  const current = await getCurrentUser();
  if (!current) return;

  const supabase = await createSupabaseServerClient();

  const { data: existing } = await supabase
    .from("favorites")
    .select("gift_id")
    .eq("gift_id", giftId)
    .maybeSingle();

  if (existing) {
    await supabase.from("favorites").delete().eq("gift_id", giftId);
  } else {
    await supabase
      .from("favorites")
      .insert({ gift_id: giftId, profile_id: current.user.id });
  }

  revalidatePath("/", "layout");
}
