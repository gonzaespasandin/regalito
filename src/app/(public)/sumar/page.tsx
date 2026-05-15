import type { Metadata } from "next";

import { SubmitGiftForm } from "@/components/submissions/submit-gift-form";
import { getCategories, getCities } from "@/lib/gifts/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Sumá un regalito — regalito",
  description:
    "¿Conocés un local o marca que regala algo por tu cumpleaños? Sumalo a regalito. Cada propuesta pasa por una revisión antes de publicarse.",
};

export default async function SumarPage() {
  const supabase = await createSupabaseServerClient();
  const [cities, categories] = await Promise.all([
    getCities(supabase),
    getCategories(supabase),
  ]);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <header className="flex flex-col gap-3">
        <h1 className="text-4xl font-bold tracking-tight">Sumá un regalito</h1>
        <p className="text-muted-foreground">
          ¿Conocés un local o marca que regala algo por tu cumpleaños?
          Contanos los detalles. Revisamos cada propuesta antes de publicarla,
          así la info queda confiable.
        </p>
      </header>

      <SubmitGiftForm cities={cities} categories={categories} />
    </main>
  );
}
