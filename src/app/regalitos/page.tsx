import type { Metadata } from "next";

import { GiftCard } from "@/components/gifts/gift-card";
import { GiftFilters } from "@/components/gifts/gift-filters";
import { GiftsEmptyState } from "@/components/gifts/gifts-empty-state";
import { getCategories, getCities, getGifts } from "@/lib/gifts/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Regalitos — regalito",
  description:
    "Explorá todos los regalos de cumpleaños disponibles en Argentina. Filtrá por ciudad y categoría.",
};

type SearchParams = Promise<{ ciudad?: string; categoria?: string }>;

export default async function RegalitosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { ciudad, categoria } = await searchParams;
  const supabase = await createSupabaseServerClient();

  const [cities, categories] = await Promise.all([
    getCities(supabase),
    getCategories(supabase),
  ]);

  const city = ciudad ? cities.find((c) => c.slug === ciudad) : undefined;
  const category = categoria
    ? categories.find((c) => c.slug === categoria)
    : undefined;

  const gifts = await getGifts(supabase, {
    cityId: city?.id,
    categoryId: category?.id,
  });

  const hasFilters = Boolean(city || category);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-16">
      <header className="flex flex-col gap-3">
        <h1 className="text-4xl font-bold tracking-tight">Regalitos</h1>
        <p className="max-w-xl text-muted-foreground">
          Todos los regalos de cumpleaños que juntamos hasta ahora. Filtrá por
          ciudad y categoría para encontrar los tuyos.
        </p>
      </header>

      <div className="mt-8">
        <GiftFilters cities={cities} categories={categories} />
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        {gifts.length} regalito{gifts.length === 1 ? "" : "s"}
        {hasFilters ? " con esos filtros" : ""}
      </p>

      {gifts.length > 0 ? (
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {gifts.map((gift) => (
            <GiftCard key={gift.id} gift={gift} />
          ))}
        </div>
      ) : (
        <div className="mt-4">
          <GiftsEmptyState filtered={hasFilters} />
        </div>
      )}
    </main>
  );
}
