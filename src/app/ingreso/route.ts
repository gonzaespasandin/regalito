import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Página de aterrizaje post-login. Supabase redirige acá con `?code=...`
 * tras la vuelta de Google; lo intercambiamos por una sesión y mandamos al
 * `?next` o al home. El path "/ingreso" es solo cosmético: el usuario lo
 * ve por ~200 ms antes del segundo redirect.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(new URL("/?auth_error=missing_code", url));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/?auth_error=exchange_failed", url));
  }

  return NextResponse.redirect(new URL(next, url));
}
