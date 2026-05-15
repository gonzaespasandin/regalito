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

  if (!profile) return null;
  return { user: data.user, profile };
});
