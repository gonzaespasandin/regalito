import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart } from "lucide-react";

import { GiftCard } from "@/components/gifts/gift-card";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/user";
import { getClaimCountsByGiftIds } from "@/lib/claims/queries";
import { getFavoriteGifts } from "@/lib/favorites/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Mis favoritos — regalito",
};

export default async function FavoritosPage() {
  const current = await getCurrentUser();
  if (!current) redirect("/");

  const supabase = await createSupabaseServerClient();
  const gifts = await getFavoriteGifts(supabase);
  const claimCounts = await getClaimCountsByGiftIds(
    supabase,
    gifts.map((gift) => gift.id),
  );

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Mis favoritos</h1>
        <p className="text-muted-foreground">
          {gifts.length === 0
            ? "Todavía no guardaste ningún regalito."
            : `${gifts.length} regalito${gifts.length === 1 ? "" : "s"} guardado${gifts.length === 1 ? "" : "s"}.`}
        </p>
      </header>

      {gifts.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border py-16 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-secondary">
            <Heart className="size-6 text-primary" />
          </span>
          <p className="max-w-sm text-sm text-muted-foreground">
            Marcá el corazón en los regalitos que te interesen y los vas a
            encontrar acá.
          </p>
          <Link
            href="/#regalitos"
            className={cn(
              buttonVariants(),
              "gradient-brand border-0 text-white hover:opacity-90",
            )}
          >
            Ver los regalitos
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {gifts.map((gift) => (
            <GiftCard
              key={gift.id}
              gift={gift}
              isFavorited
              claimCounts={claimCounts.get(gift.id) ?? null}
            />
          ))}
        </div>
      )}
    </main>
  );
}
