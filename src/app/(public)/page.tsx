import { Hero } from "@/components/hero";
import { GiftCard } from "@/components/gifts/gift-card";
import { GiftFilters } from "@/components/gifts/gift-filters";
import { GiftsEmptyState } from "@/components/gifts/gifts-empty-state";
import { getCurrentUser } from "@/lib/auth/user";
import { getClaimCountsByGiftIds } from "@/lib/claims/queries";
import { getFavoriteGiftIdSet } from "@/lib/favorites/queries";
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

  const currentUser = await getCurrentUser();
  const [favoriteIds, claimCounts] = await Promise.all([
    currentUser ? getFavoriteGiftIdSet(supabase) : Promise.resolve(null),
    getClaimCountsByGiftIds(
      supabase,
      gifts.map((gift) => gift.id),
    ),
  ]);

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

        <p className="mt-4 rounded-xl bg-amber-100/60 px-4 py-2.5 text-xs text-amber-950 ring-1 ring-amber-200">
          Ojo: la info la armamos con aportes de la comunidad y muchos locales
          no tienen fuente oficial. Antes de ir, confirmá con el local — puede
          haber cambios o variar según la sucursal.
        </p>

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
              <GiftCard
                key={gift.id}
                gift={gift}
                isFavorited={favoriteIds ? favoriteIds.has(gift.id) : undefined}
                claimCounts={claimCounts.get(gift.id) ?? null}
              />
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
