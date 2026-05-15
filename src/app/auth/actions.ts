"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Arranca el flow de Google OAuth: pide a Supabase la URL de Google y
 * redirige el navegador. Cuando Google vuelve, cae en /auth/callback.
 */
export async function signInWithGoogle(formData: FormData): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const headerList = await headers();
  const origin =
    headerList.get("origin") ??
    `https://${headerList.get("host") ?? "regalito.vercel.app"}`;

  const nextRaw = formData.get("next");
  const next = typeof nextRaw === "string" && nextRaw.startsWith("/") ? nextRaw : "/";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error || !data.url) {
    redirect("/?auth_error=oauth_start");
  }

  redirect(data.url);
}

/** Cierra la sesión actual y vuelve al home. */
export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
