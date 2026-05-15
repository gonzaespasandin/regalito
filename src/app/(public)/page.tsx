import { Hero } from "@/components/hero";
import { GiftCard } from "@/components/gifts/gift-card";
import { GiftFilters } from "@/components/gifts/gift-filters";
import { GiftsEmptyState } from "@/components/gifts/gifts-empty-state";
import { getCategories, getCities, getGifts } from "@/lib/gifts/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SearchParams = Promise<{ ciudad?: string; categoria?: string }>;

export default async function Home({
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
    <main className="flex-1">
      <Hero />

      <section
        id="regalitos"
        className="mx-auto w-full max-w-5xl scroll-mt-20 px-6 pb-24"
      >
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold tracking-tight">
            Todos los regalitos
          </h2>
          <p className="text-sm text-muted-foreground">
            Filtrá por ciudad y categoría para encontrar los tuyos.
          </p>
        </div>

        <div className="mt-6">
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
      </section>
    </main>
  );
}
