import Image from "next/image";
import Link from "next/link";
import { Gift, Heart, MapPin, ThumbsDown, ThumbsUp } from "lucide-react";

import type { ClaimCounts } from "@/lib/claims/queries";
import { optimizedImageUrl } from "@/lib/cloudinary";
import type { Tables } from "@/lib/database.types";
import type { GiftWithRelations } from "@/lib/gifts/queries";
import { cn } from "@/lib/utils";
import { toggleFavoriteAction } from "@/app/(public)/favoritos/actions";
import { quickClaimAction } from "@/app/(public)/regalo/[slug]/claim-actions";

type Outcome = Tables<"gift_claims">["outcome"];

type GiftCardProps = {
  gift: GiftWithRelations;
  /** Favorito del user actual. undefined = anónimo (no mostramos el botón). */
  isFavorited?: boolean;
  /** Contadores de claims (pude/no pude). null = sin datos. */
  claimCounts?: ClaimCounts | null;
  /** Reacción del user actual. undefined = anónimo, null = logueado sin reacción, outcome = reaccionó. */
  ownClaim?: Outcome | null;
};

export function GiftCard({
  gift,
  isFavorited,
  claimCounts,
  ownClaim,
}: GiftCardProps) {
  const requirementsCount = gift.requirements.length;
  const showFavoriteButton = typeof isFavorited === "boolean";
  const showClaimButtons = ownClaim !== undefined;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10 transition-all hover:-translate-y-0.5 hover:ring-foreground/20">
      <Link href={`/regalo/${gift.slug}`} className="flex flex-1 flex-col">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-secondary">
          {gift.image_url ? (
            <Image
              src={optimizedImageUrl(gift.image_url)}
              alt={gift.business_name}
              fill
              sizes="(min-width: 768px) 33vw, 100vw"
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="gradient-brand flex h-full w-full items-center justify-center">
              <Gift className="size-10 text-white/90" />
            </div>
          )}
          {gift.category && (
            <span className="absolute top-3 left-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium backdrop-blur">
              {gift.category.name}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-5">
          <p className="text-sm font-medium text-muted-foreground">
            {gift.business_name}
          </p>
          <h3 className="text-lg font-semibold leading-snug">{gift.name}</h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {gift.description}
          </p>
          <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-3 text-xs text-muted-foreground">
            {gift.cities.length > 0 && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" />
                {gift.cities[0].name}
                {gift.cities.length > 1 ? ` +${gift.cities.length - 1}` : ""}
              </span>
            )}
            <span>
              {requirementsCount} requisito{requirementsCount === 1 ? "" : "s"}
            </span>
            {claimCounts && claimCounts.claimed + claimCounts.failed > 0 ? (
              <span className="inline-flex items-center gap-1">
                <ThumbsUp className="size-3.5 text-emerald-600" />
                {Math.round(
                  (claimCounts.claimed /
                    (claimCounts.claimed + claimCounts.failed)) *
                    100,
                )}
                % ({claimCounts.claimed + claimCounts.failed})
              </span>
            ) : null}
          </div>
        </div>
      </Link>

      {showFavoriteButton ? (
        <form
          action={toggleFavoriteAction.bind(null, gift.id)}
          className="absolute right-3 top-3 z-10"
        >
          <button
            type="submit"
            aria-label={
              isFavorited ? "Quitar de favoritos" : "Guardar como favorito"
            }
            className={cn(
              "flex size-9 cursor-pointer items-center justify-center rounded-full bg-background/90 text-foreground/80 shadow-sm ring-1 ring-foreground/10 backdrop-blur transition-colors",
              "hover:bg-background hover:text-primary",
            )}
          >
            <Heart
              className={cn(
                "size-4 transition-colors",
                isFavorited && "fill-primary text-primary",
              )}
            />
          </button>
        </form>
      ) : null}

      {showClaimButtons ? (
        <div className="absolute bottom-3 right-3 z-10 flex gap-1.5">
          <form action={quickClaimAction.bind(null, gift.id, "claimed")}>
            <button
              type="submit"
              aria-label={
                ownClaim === "claimed"
                  ? "Quitar tu respuesta"
                  : "Marcar que pudiste reclamarlo"
              }
              title={
                ownClaim === "claimed"
                  ? "Tu respuesta: pudiste reclamarlo"
                  : "Marcar 'Pude reclamarlo'"
              }
              className={cn(
                "flex size-9 cursor-pointer items-center justify-center rounded-full shadow-sm ring-1 transition-colors",
                ownClaim === "claimed"
                  ? "bg-emerald-600 text-white ring-emerald-600 hover:bg-emerald-700"
                  : "bg-background/90 text-foreground/80 ring-foreground/10 backdrop-blur hover:bg-background hover:text-emerald-600",
              )}
            >
              <ThumbsUp className="size-4" />
            </button>
          </form>
          <form action={quickClaimAction.bind(null, gift.id, "failed")}>
            <button
              type="submit"
              aria-label={
                ownClaim === "failed"
                  ? "Quitar tu respuesta"
                  : "Marcar que no pudiste reclamarlo"
              }
              title={
                ownClaim === "failed"
                  ? "Tu respuesta: no pudiste reclamarlo"
                  : "Marcar 'No pude reclamarlo'"
              }
              className={cn(
                "flex size-9 cursor-pointer items-center justify-center rounded-full shadow-sm ring-1 transition-colors",
                ownClaim === "failed"
                  ? "bg-foreground text-background ring-foreground hover:bg-foreground/90"
                  : "bg-background/90 text-foreground/80 ring-foreground/10 backdrop-blur hover:bg-background hover:text-foreground",
              )}
            >
              <ThumbsDown className="size-4" />
            </button>
          </form>
        </div>
      ) : null}
    </article>
  );
}
