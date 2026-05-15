import "server-only";

import { cache } from "react";
import type { User } from "@supabase/supabase-js";

import type { Tables } from "@/lib/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CurrentUser = {
  user: User;
  profile: Tables<"profiles">;
};

/**
 * Devuelve el user de Supabase + su perfil, o `null` si no hay sesión.
 * Importante: usa `getUser()` (no `getSession()`) porque verifica el JWT
 * contra el servidor — la skill `supabase` lo prohíbe expresamente del lado
 * server. `cache()` evita la doble query por render.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profile) return { user: data.user, profile };

  // Hay sesión válida pero el trigger no creó el profile (por ejemplo, el
  // user se registró antes de que la migración existiera). Lo armamos
  // acá con los metadatos de Google para que el caso quede recuperado.
  const meta = (data.user.user_metadata ?? {}) as Record<string, unknown>;
  const displayName =
    typeof meta.full_name === "string"
      ? meta.full_name
      : typeof meta.name === "string"
        ? meta.name
        : null;
  const avatarUrl =
    typeof meta.avatar_url === "string"
      ? meta.avatar_url
      : typeof meta.picture === "string"
        ? meta.picture
        : null;

  const { data: created } = await supabase
    .from("profiles")
    .insert({
      id: data.user.id,
      email: data.user.email ?? "",
      display_name: displayName,
      avatar_url: avatarUrl,
    })
    .select("*")
    .single();

  if (!created) return null;
  return { user: data.user, profile: created };
});
