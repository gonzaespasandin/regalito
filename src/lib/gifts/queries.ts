import "server-only";

import { cache } from "react";
import type { QueryData, SupabaseClient } from "@supabase/supabase-js";

import type { Database, Tables } from "@/lib/database.types";

type SupabaseDb = SupabaseClient<Database>;

/**
 * Query base de gifts con su ciudad y categoría embebidas. Se usa tanto para
 * derivar el tipo `GiftWithRelations` como para las queries concretas.
 */
function giftsWithRelations(supabase: SupabaseDb) {
  return supabase
    .from("gifts")
    .select("*, city:cities(*), category:categories(*)");
}

export type GiftWithRelations = QueryData<
  ReturnType<typeof giftsWithRelations>
>[number];

export type GiftFilters = {
  cityId?: string;
  categoryId?: string;
};

/**
 * Regalitos activos, con su ciudad y categoría. Filtra opcionalmente por
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
      query = query.eq("city_id", filters.cityId);
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
