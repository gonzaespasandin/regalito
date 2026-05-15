import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Tables } from "@/lib/database.types";
import { slugify } from "@/lib/slug";
import type { GiftFormInput } from "./schema";

type SupabaseDb = SupabaseClient<Database>;

const GIFT_ADMIN_SELECT = "*, city:cities(*), category:categories(*)";
const UNIQUE_VIOLATION = "23505";

export type AdminGift = Tables<"gifts"> & {
  city: Tables<"cities"> | null;
  category: Tables<"categories"> | null;
};

export type GiftMutationResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

/** Todos los gifts (cualquier estado), con ciudad y categoría. */
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

/** Mapea el input del form al shape de la fila `gifts` (snake_case). */
function toGiftRow(input: GiftFormInput) {
  return {
    name: input.name,
    business_name: input.businessName,
    description: input.description,
    city_id: input.cityId,
    category_id: input.categoryId,
    address: input.address,
    requirements: input.requirements.map((requirement) => requirement.value),
    source_url: input.sourceUrl?.trim() ? input.sourceUrl.trim() : null,
    image_url: input.imageUrl?.trim() ? input.imageUrl.trim() : null,
    status: input.status,
  };
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
  return { ok: true, id };
}

/** Borra un gift. */
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
