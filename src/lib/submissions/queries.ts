import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";
import type { GiftSubmissionInput } from "./schema";

type SupabaseDb = SupabaseClient<Database>;

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
  const payload = {
    business_name: input.businessName,
    name: input.name,
    description: input.description,
    city_slug: input.citySlug,
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
