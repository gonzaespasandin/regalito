"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { getCategories, getCities } from "@/lib/gifts/queries";
import { parseGiftsExcel, type ImportRowError } from "@/lib/gifts/import";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type ImportResult =
  | { ok: false; error: string }
  | {
      ok: true;
      imported: number;
      skipped: number;
      errors: ImportRowError[];
    };

/**
 * Importa gifts en lote desde un `.xlsx`. Valida fila por fila, inserta las
 * válidas una a una (un slug repetido no frena al resto) y devuelve el
 * resumen con los errores por fila.
 */
export async function importGiftsAction(
  formData: FormData,
): Promise<ImportResult> {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Elegí un archivo .xlsx." };
  }

  const supabase = createSupabaseAdminClient();
  const [cities, categories] = await Promise.all([
    getCities(supabase),
    getCategories(supabase),
  ]);

  let parsed;
  try {
    parsed = await parseGiftsExcel(await file.arrayBuffer(), cities, categories);
  } catch {
    return { ok: false, error: "No se pudo leer el archivo. ¿Es un .xlsx válido?" };
  }

  const errors: ImportRowError[] = [...parsed.errors];
  let imported = 0;

  for (const gift of parsed.valid) {
    const { error } = await supabase.from("gifts").insert(gift);
    if (error) {
      errors.push({
        row: 0,
        message:
          error.code === "23505"
            ? `"${gift.name}": ya existe un regalito con ese título`
            : `"${gift.name}": no se pudo insertar`,
      });
    } else {
      imported += 1;
    }
  }

  revalidatePath("/admin/regalos");

  return { ok: true, imported, skipped: errors.length, errors };
}
