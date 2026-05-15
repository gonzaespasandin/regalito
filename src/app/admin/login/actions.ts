"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_TTL_SECONDS,
  createSessionToken,
  verifyAdminCredentials,
} from "@/lib/auth";

const credentialsSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export type LoginResult = { ok: false; error: string } | void;

/**
 * Login del admin con email + contraseña (credenciales del `.env`).
 * En éxito setea una cookie de sesión firmada y redirige al panel.
 */
export async function login(
  email: string,
  password: string,
): Promise<LoginResult> {
  const parsed = credentialsSchema.safeParse({ email, password });
  const credentialsOk =
    parsed.success &&
    verifyAdminCredentials(parsed.data.email, parsed.data.password);

  if (!credentialsOk) {
    return { ok: false, error: "Email o contraseña incorrectos." };
  }

  const store = await cookies();
  store.set(ADMIN_SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  });

  redirect("/admin");
}

export async function signOut(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_SESSION_COOKIE);
  redirect("/admin/login");
}
