"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import { uploadGiftImage } from "@/lib/cloudinary";
import {
  createGift,
  deleteGift,
  updateGift,
} from "@/lib/gifts/admin";
import { giftFormSchema } from "@/lib/gifts/schema";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type GiftActionResult = { ok: false; error: string } | void;
export type UploadResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

const INVALID = "Revisá los datos del formulario.";

export async function createGiftAction(input: unknown): Promise<GiftActionResult> {
  await requireAdmin();

  const parsed = giftFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: INVALID };

  const result = await createGift(createSupabaseAdminClient(), parsed.data);
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/admin/regalos");
  redirect("/admin/regalos");
}

export async function updateGiftAction(
  id: string,
  input: unknown,
): Promise<GiftActionResult> {
  await requireAdmin();

  const parsed = giftFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: INVALID };

  const result = await updateGift(createSupabaseAdminClient(), id, parsed.data);
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/admin/regalos");
  redirect("/admin/regalos");
}

export async function deleteGiftAction(id: string): Promise<void> {
  await requireAdmin();

  await deleteGift(createSupabaseAdminClient(), id);

  revalidatePath("/admin/regalos");
  redirect("/admin/regalos");
}

/** Sube la imagen de marca a Cloudinary y devuelve su URL. */
export async function uploadGiftImageAction(
  formData: FormData,
): Promise<UploadResult> {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Elegí una imagen." };
  }
  if (!file.type.startsWith("image/")) {
    return { ok: false, error: "El archivo tiene que ser una imagen." };
  }

  try {
    const url = await uploadGiftImage(file);
    return { ok: true, url };
  } catch {
    return { ok: false, error: "No se pudo subir la imagen. Probá de nuevo." };
  }
}
