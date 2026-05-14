import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";

/**
 * Cliente Supabase con service role: BYPASSA RLS.
 * Usar solo en Server Actions de admin (CRUD de gifts, cola de submissions,
 * subida de imágenes a Storage). Nunca importar desde código de cliente.
 */
export function createSupabaseAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}
