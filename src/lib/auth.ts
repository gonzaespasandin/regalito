import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_SESSION_COOKIE = "regalito_admin_session";
export const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 días

function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("Falta la variable de entorno ADMIN_SESSION_SECRET");
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("base64url");
}

/** Comparación en tiempo constante para no filtrar info por timing. */
function safeEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
}

/** Valida email + contraseña contra las credenciales del `.env`. */
export function verifyAdminCredentials(
  email: string,
  password: string,
): boolean {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase() ?? "";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "";
  if (!adminEmail || !adminPassword) return false;

  const emailOk = safeEqual(email.trim().toLowerCase(), adminEmail);
  const passwordOk = safeEqual(password, adminPassword);
  // Se evalúan ambos siempre para no filtrar cuál falló por timing.
  return emailOk && passwordOk;
}

/** Token de sesión firmado: `<expiraciónEpoch>.<hmac>`. */
export function createSessionToken(): string {
  const expiresAt = Math.floor(Date.now() / 1000) + ADMIN_SESSION_TTL_SECONDS;
  const payload = String(expiresAt);
  return `${payload}.${sign(payload)}`;
}

function isValidToken(token: string | undefined): boolean {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  if (!safeEqual(signature, sign(payload))) return false;

  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt)) return false;
  return expiresAt > Math.floor(Date.now() / 1000);
}

/** True si el request trae una cookie de sesión de admin válida y vigente. */
export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return isValidToken(store.get(ADMIN_SESSION_COOKIE)?.value);
}

/**
 * Guard de admin. Redirige a /admin/login si no hay sesión válida. Se usa en
 * el layout del panel y en cada server action de admin (defensa en
 * profundidad: las actions son invocables directo). Devuelve el email del admin.
 */
export async function requireAdmin(): Promise<string> {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
  return process.env.ADMIN_EMAIL ?? "";
}
