import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Tables } from "@/lib/database.types";
import { slugify } from "@/lib/slug";
import type { GiftFormInput } from "./schema";

type SupabaseDb = SupabaseClient<Database>;

const GIFT_ADMIN_SELECT = "*, cities(*), category:categories(*)";
const UNIQUE_VIOLATION = "23505";

export type AdminGift = Tables<"gifts"> & {
  cities: Tables<"cities">[];
  category: Tables<"categories"> | null;
};

export type GiftMutationResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

/** Todos los gifts (cualquier estado), con ciudades y categoría. */
export async function getAllGifts(supabase: SupabaseDb): Promise<AdminGift[]> {
  const { data, error } = await supabase
    .from("gifts")
    .select(GIFT_ADMIN_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/** Un gift por id (cualquier estado). `null` si no existe. */
export async function getGiftById(
  supabase: SupabaseDb,
  id: string,
): Promise<AdminGift | null> {
  const { data, error } = await supabase
    .from("gifts")
    .select(GIFT_ADMIN_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/** Mapea el input del form al shape de la fila `gifts` (snake_case, sin ciudades). */
function toGiftRow(input: GiftFormInput) {
  return {
    name: input.name,
    business_name: input.businessName,
    description: input.description,
    category_id: input.categoryId,
    address: input.address,
    requirements: input.requirements.map((requirement) => requirement.value),
    source_url: input.sourceUrl?.trim() ? input.sourceUrl.trim() : null,
    image_url: input.imageUrl?.trim() ? input.imageUrl.trim() : null,
    status: input.status,
  };
}

/** Reemplaza el set de ciudades de un gift por el dado. */
async function syncGiftCities(
  supabase: SupabaseDb,
  giftId: string,
  cityIds: string[],
): Promise<{ error: string | null }> {
  const { error: deleteError } = await supabase
    .from("gift_cities")
    .delete()
    .eq("gift_id", giftId);
  if (deleteError) return { error: "No se pudieron actualizar las ciudades." };

  if (cityIds.length === 0) return { error: null };

  const rows = cityIds.map((cityId) => ({ gift_id: giftId, city_id: cityId }));
  const { error: insertError } = await supabase.from("gift_cities").insert(rows);
  if (insertError) return { error: "No se pudieron actualizar las ciudades." };

  return { error: null };
}

/** Crea un gift. El slug se genera del nombre y queda fijo de por vida. */
export async function createGift(
  supabase: SupabaseDb,
  input: GiftFormInput,
): Promise<GiftMutationResult> {
  const slug = slugify(input.name);
  const { data, error } = await supabase
    .from("gifts")
    .insert({ ...toGiftRow(input), slug })
    .select("id")
    .single();

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      return {
        ok: false,
        error: "Ya existe un regalito con ese nombre. Cambiá el título.",
      };
    }
    return { ok: false, error: "No se pudo crear el regalito." };
  }

  const sync = await syncGiftCities(supabase, data.id, input.cityIds);
  if (sync.error) {
    // Rollback manual: borrar el gift huérfano si no pudimos asignar ciudades.
    await supabase.from("gifts").delete().eq("id", data.id);
    return { ok: false, error: sync.error };
  }

  return { ok: true, id: data.id };
}

/** Actualiza un gift. El slug NO se regenera (slugs estables). */
export async function updateGift(
  supabase: SupabaseDb,
  id: string,
  input: GiftFormInput,
): Promise<GiftMutationResult> {
  const { error } = await supabase
    .from("gifts")
    .update(toGiftRow(input))
    .eq("id", id);

  if (error) {
    return { ok: false, error: "No se pudo actualizar el regalito." };
  }

  const sync = await syncGiftCities(supabase, id, input.cityIds);
  if (sync.error) return { ok: false, error: sync.error };

  return { ok: true, id };
}

/** Borra un gift. Las filas de `gift_cities` se borran en cascada. */
export async function deleteGift(
  supabase: SupabaseDb,
  id: string,
): Promise<GiftMutationResult> {
  const { error } = await supabase.from("gifts").delete().eq("id", id);

  if (error) {
    return { ok: false, error: "No se pudo borrar el regalito." };
  }
  return { ok: true, id };
}
