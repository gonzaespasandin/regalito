import "server-only";

import { cache } from "react";
import type { QueryData, SupabaseClient } from "@supabase/supabase-js";

import type { Database, Tables } from "@/lib/database.types";

type SupabaseDb = SupabaseClient<Database>;

/**
 * Query base de gifts con sus ciudades (M:N vía `gift_cities`) y su categoría
 * embebidas. Se usa tanto para derivar el tipo `GiftWithRelations` como para
 * las queries concretas.
 */
function giftsWithRelations(supabase: SupabaseDb) {
  return supabase
    .from("gifts")
    .select("*, cities(*), category:categories(*)");
}

export type GiftWithRelations = QueryData<
  ReturnType<typeof giftsWithRelations>
>[number];

export type GiftFilters = {
  cityId?: string;
  categoryId?: string;
};

/**
 * Filtra los `gift_id` que tienen una ciudad específica. Se hace en una
 * query separada porque PostgREST no permite filtrar por la tabla del lado
 * "many" sin perder el resto de las ciudades embebidas.
 */
async function giftIdsByCity(
  supabase: SupabaseDb,
  cityId: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("gift_cities")
    .select("gift_id")
    .eq("city_id", cityId);

  if (error) throw error;
  return (data ?? []).map((row) => row.gift_id);
}

/**
 * Regalitos activos, con sus ciudades y categoría. Filtra opcionalmente por
 * ciudad y/o categoría. El llamador resuelve los slugs de la URL a ids.
 */
export const getGifts = cache(
  async (
    supabase: SupabaseDb,
    filters: GiftFilters = {},
  ): Promise<GiftWithRelations[]> => {
    let query = giftsWithRelations(supabase)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (filters.cityId) {
      const ids = await giftIdsByCity(supabase, filters.cityId);
      if (ids.length === 0) return [];
      query = query.in("id", ids);
    }
    if (filters.categoryId) {
      query = query.eq("category_id", filters.categoryId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  },
);

/** Un regalito activo por slug. `null` si no existe o no está activo. */
export const getGiftBySlug = cache(
  async (
    supabase: SupabaseDb,
    slug: string,
  ): Promise<GiftWithRelations | null> => {
    const { data, error } = await giftsWithRelations(supabase)
      .eq("slug", slug)
      .eq("status", "active")
      .maybeSingle();

    if (error) throw error;
    return data;
  },
);

/** Catálogo de ciudades, ordenado por nombre. Para los selects de filtro. */
export const getCities = cache(
  async (supabase: SupabaseDb): Promise<Tables<"cities">[]> => {
    const { data, error } = await supabase
      .from("cities")
      .select("*")
      .order("name");

    if (error) throw error;
    return data ?? [];
  },
);

/** Catálogo de categorías, ordenado por nombre. Para los selects de filtro. */
export const getCategories = cache(
  async (supabase: SupabaseDb): Promise<Tables<"categories">[]> => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) throw error;
    return data ?? [];
  },
);
