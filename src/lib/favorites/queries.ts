import "server-only";

import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";
import {
  type GiftWithRelations,
} from "@/lib/gifts/queries";

type SupabaseDb = SupabaseClient<Database>;

/**
 * Set de gift_ids favoritos del usuario actual. Para overlayear el corazón
 * en cada card sin hacer una query por card. Usa `cache()` para no repetir
 * la query en el mismo render. RLS limita la fila al dueño (auth.uid()).
 */
export const getFavoriteGiftIdSet = cache(
  async (supabase: SupabaseDb): Promise<Set<string>> => {
    const { data, error } = await supabase
      .from("favorites")
      .select("gift_id");
    if (error) throw error;
    return new Set((data ?? []).map((row) => row.gift_id));
  },
);

/**
 * Gifts favoritos del usuario actual, ordenados por cuándo los marcó
 * (más recientes primero). Incluye ciudades y categoría. RLS también
 * limita esto al dueño.
 */
export async function getFavoriteGifts(
  supabase: SupabaseDb,
): Promise<GiftWithRelations[]> {
  const { data, error } = await supabase
    .from("favorites")
    .select("gift:gifts(*, cities(*), category:categories(*))")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? [])
    .map((row) => row.gift)
    .filter((gift): gift is GiftWithRelations => Boolean(gift));
}
