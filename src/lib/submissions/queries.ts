import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Tables } from "@/lib/database.types";
import type { GiftSubmissionInput } from "./schema";

type SupabaseDb = SupabaseClient<Database>;

type SubmissionStatus = Database["public"]["Enums"]["submission_status"];

/** Shape del jsonb `payload` (lo arma `createSubmission`, mismo snake_case que `gifts`). */
export type SubmissionPayload = {
  business_name: string;
  name: string;
  description: string;
  city_slugs: string[];
  category_slug: string;
  address: string;
  requirements: string[];
  source_url: string | null;
};

export type AdminSubmission = Omit<Tables<"submissions">, "payload"> & {
  payload: SubmissionPayload;
};

/**
 * Inserta una propuesta en la cola de moderación (`submissions`, status
 * 'pending' por default). El `payload` jsonb guarda los datos del regalito
 * con el mismo shape (snake_case) que la tabla `gifts`; el admin lo revisa
 * y, si aprueba, crea el `gift` definitivo.
 */
export async function createSubmission(
  supabase: SupabaseDb,
  input: GiftSubmissionInput,
): Promise<void> {
  const payload: SubmissionPayload = {
    business_name: input.businessName,
    name: input.name,
    description: input.description,
    city_slugs: input.citySlugs,
    category_slug: input.categorySlug,
    address: input.address,
    requirements: input.requirements.map((requirement) => requirement.value),
    source_url: input.sourceUrl?.trim() ? input.sourceUrl.trim() : null,
  };

  const { error } = await supabase.from("submissions").insert({
    payload,
    submitter_name: input.submitterName?.trim() ? input.submitterName.trim() : null,
    submitter_email: input.submitterEmail?.trim()
      ? input.submitterEmail.trim()
      : null,
  });

  if (error) throw error;
}

/** Submissions filtradas por status (o todas si no se pasa). Ordenadas por fecha desc. */
export async function getSubmissions(
  supabase: SupabaseDb,
  filters: { status?: SubmissionStatus } = {},
): Promise<AdminSubmission[]> {
  let query = supabase
    .from("submissions")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as AdminSubmission[];
}

/** Submission por id. `null` si no existe. */
export async function getSubmissionById(
  supabase: SupabaseDb,
  id: string,
): Promise<AdminSubmission | null> {
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as AdminSubmission | null;
}

/** Marca la submission como aprobada (no crea el gift — eso lo hace la action). */
export async function markSubmissionApproved(
  supabase: SupabaseDb,
  id: string,
  reviewerEmail: string,
): Promise<void> {
  const { error } = await supabase
    .from("submissions")
    .update({
      status: "approved",
      reviewed_at: new Date().toISOString(),
      reviewer_email: reviewerEmail,
    })
    .eq("id", id);

  if (error) throw error;
}

/** Marca la submission como rechazada, guardando las notas del admin. */
export async function markSubmissionRejected(
  supabase: SupabaseDb,
  id: string,
  reviewerEmail: string,
  notes: string | null,
): Promise<void> {
  const { error } = await supabase
    .from("submissions")
    .update({
      status: "rejected",
      reviewed_at: new Date().toISOString(),
      reviewer_email: reviewerEmail,
      notes: notes && notes.trim() ? notes.trim() : null,
    })
    .eq("id", id);

  if (error) throw error;
}
