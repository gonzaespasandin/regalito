"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import { createGift } from "@/lib/gifts/admin";
import { giftFormSchema } from "@/lib/gifts/schema";
import {
  getSubmissionById,
  markSubmissionApproved,
  markSubmissionRejected,
} from "@/lib/submissions/queries";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type SubmissionActionResult = { ok: false; error: string } | void;

const INVALID = "Revisá los datos del formulario.";
const NOT_PENDING = "Esta propuesta ya fue revisada.";

/**
 * Aprueba una submission: crea el gift con los datos del form (que el admin
 * pudo ajustar) y marca la submission como aprobada. Si la creación del gift
 * falla (p.ej. slug duplicado), la submission queda pendiente.
 */
export async function approveSubmissionAction(
  submissionId: string,
  input: unknown,
): Promise<SubmissionActionResult> {
  const reviewerEmail = await requireAdmin();

  const parsed = giftFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: INVALID };

  const supabase = createSupabaseAdminClient();

  const submission = await getSubmissionById(supabase, submissionId);
  if (!submission) return { ok: false, error: "No encontramos esa propuesta." };
  if (submission.status !== "pending") {
    return { ok: false, error: NOT_PENDING };
  }

  const created = await createGift(supabase, parsed.data);
  if (!created.ok) return { ok: false, error: created.error };

  await markSubmissionApproved(supabase, submissionId, reviewerEmail);

  revalidatePath("/admin/submissions");
  revalidatePath("/admin/regalos");
  revalidatePath("/");
  redirect("/admin/submissions");
}

/** Rechaza una submission guardando las notas del admin. */
export async function rejectSubmissionAction(formData: FormData): Promise<void> {
  const reviewerEmail = await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const rawNotes = String(formData.get("notes") ?? "").trim();
  const notes = rawNotes.slice(0, 500);

  const supabase = createSupabaseAdminClient();
  const submission = await getSubmissionById(supabase, id);
  if (!submission || submission.status !== "pending") {
    redirect("/admin/submissions");
  }

  await markSubmissionRejected(supabase, id, reviewerEmail, notes || null);

  revalidatePath("/admin/submissions");
  redirect("/admin/submissions?status=rejected");
}
