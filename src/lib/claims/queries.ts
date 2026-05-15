import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Tables } from "@/lib/database.types";

type SupabaseDb = SupabaseClient<Database>;

export type ClaimCounts = { claimed: number; failed: number };

export type ClaimWithProfile = Tables<"gift_claims"> & {
  profile: Pick<
    Tables<"profiles">,
    "id" | "display_name" | "avatar_url"
  > | null;
};

/**
 * Contadores de claims para una lista de gifts. Devuelve un Map
 * para overlay barato en cada card.
 */
export async function getClaimCountsByGiftIds(
  supabase: SupabaseDb,
  giftIds: string[],
): Promise<Map<string, ClaimCounts>> {
  const result = new Map<string, ClaimCounts>();
  if (giftIds.length === 0) return result;

  const { data, error } = await supabase
    .from("gift_claim_counts")
    .select("*")
    .in("gift_id", giftIds);
  if (error) throw error;

  for (const row of data ?? []) {
    if (!row.gift_id) continue;
    result.set(row.gift_id, {
      claimed: row.claimed_count ?? 0,
      failed: row.failed_count ?? 0,
    });
  }
  return result;
}

/** Contadores para un solo gift (devuelve ceros si no tiene claims). */
export async function getClaimCounts(
  supabase: SupabaseDb,
  giftId: string,
): Promise<ClaimCounts> {
  const counts = await getClaimCountsByGiftIds(supabase, [giftId]);
  return counts.get(giftId) ?? { claimed: 0, failed: 0 };
}

/**
 * Claims de OTROS usuarios sobre un gift (excluye al user actual si pasa),
 * con su display_name/avatar embebidos. Ordenados por más reciente.
 */
export async function getClaimsForGift(
  supabase: SupabaseDb,
  giftId: string,
  options: { excludeProfileId?: string; limit?: number } = {},
): Promise<ClaimWithProfile[]> {
  let query = supabase
    .from("gift_claims")
    .select("*, profile:profiles(id, display_name, avatar_url)")
    .eq("gift_id", giftId)
    .order("created_at", { ascending: false });

  if (options.excludeProfileId) {
    query = query.neq("profile_id", options.excludeProfileId);
  }
  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ClaimWithProfile[];
}

/**
 * Para una lista de gifts, devuelve el outcome del claim del user actual
 * sobre cada uno (o nada si no reaccionó). Para el overlay en listados.
 */
export async function getOwnClaimsByGiftIds(
  supabase: SupabaseDb,
  profileId: string,
  giftIds: string[],
): Promise<Map<string, Tables<"gift_claims">["outcome"]>> {
  const result = new Map<string, Tables<"gift_claims">["outcome"]>();
  if (giftIds.length === 0) return result;

  const { data, error } = await supabase
    .from("gift_claims")
    .select("gift_id, outcome")
    .eq("profile_id", profileId)
    .in("gift_id", giftIds);
  if (error) throw error;

  for (const row of data ?? []) {
    result.set(row.gift_id, row.outcome);
  }
  return result;
}

/** Claim del user actual sobre un gift, si existe. */
export async function getOwnClaim(
  supabase: SupabaseDb,
  giftId: string,
  profileId: string,
): Promise<Tables<"gift_claims"> | null> {
  const { data, error } = await supabase
    .from("gift_claims")
    .select("*")
    .eq("gift_id", giftId)
    .eq("profile_id", profileId)
    .maybeSingle();
  if (error) throw error;
  return data;
}
