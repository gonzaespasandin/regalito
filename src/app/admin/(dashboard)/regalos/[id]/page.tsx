import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";

import { GiftForm } from "@/components/admin/gift-form";
import { Button } from "@/components/ui/button";
import { getGiftById } from "@/lib/gifts/admin";
import { getCategories, getCities } from "@/lib/gifts/queries";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { deleteGiftAction, updateGiftAction } from "../actions";

export default async function EditGiftPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const gift = await getGiftById(createSupabaseAdminClient(), id);
  if (!gift) {
    notFound();
  }

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
        Editar regalito
      </h1>

      <GiftForm
        cities={cities}
        categories={categories}
        gift={gift}
        action={updateGiftAction.bind(null, gift.id)}
        submitLabel="Guardar cambios"
      />

      <div className="mt-10 flex items-center justify-between gap-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
        <div>
          <p className="text-sm font-medium">Borrar este regalito</p>
          <p className="text-sm text-muted-foreground">
            Esta acción no se puede deshacer.
          </p>
        </div>
        <form action={deleteGiftAction.bind(null, gift.id)}>
          <Button type="submit" variant="destructive">
            <Trash2 className="size-4" />
            Borrar
          </Button>
        </form>
      </div>
    </main>
  );
}
