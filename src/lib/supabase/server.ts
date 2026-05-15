import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "@/lib/database.types";

/**
 * Cliente Supabase para el servidor (RSC y Server Actions).
 * Usa la publishable key, así que respeta RLS.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Invocado desde un RSC: escribir cookies no está permitido.
            // El refresh de sesión sucede en el middleware (src/middleware.ts);
            // ignorar acá es seguro y es el patrón recomendado por @supabase/ssr.
          }
        },
      },
    },
  );
}
