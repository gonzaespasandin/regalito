import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/lib/database.types";

/**
 * Middleware de Supabase Auth: refresca la sesión en cada request para que
 * los Server Components vean al usuario logueado. NO protege rutas — la
 * protección la hace cada página/action con `requireUser()`/`requireAdmin()`.
 *
 * El admin (/admin) usa su propia cookie HMAC, ajena a Supabase Auth, pero
 * el middleware no la toca, así que conviven sin problema.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // Toca la sesión para forzar el refresh del JWT si está por vencer.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    /**
     * Corre en todo, salvo:
     * - rutas internas de Next (`_next/...`)
     * - archivos estáticos comunes
     * - el favicon
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
