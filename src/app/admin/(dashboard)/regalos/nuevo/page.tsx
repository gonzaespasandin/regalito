import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { GiftForm } from "@/components/admin/gift-form";
import { getCategories, getCities } from "@/lib/gifts/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createGiftAction } from "../actions";

export default async function NewGiftPage() {
  const supabase = await createSupabaseServerClient();
  const [cities, categories] = await Promise.all([
    getCities(supabase),
    getCategories(supabase),
  ]);

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <Link
        href="/admin/regalos"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver a regalitos
      </Link>

      <h1 className="mt-6 mb-8 text-3xl font-bold tracking-tight">
        Cargar un regalito
      </h1>

      <GiftForm
        cities={cities}
        categories={categories}
        action={createGiftAction}
        submitLabel="Crear regalito"
      />
    </main>
  );
}
