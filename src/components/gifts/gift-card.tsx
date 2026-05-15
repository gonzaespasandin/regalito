import Image from "next/image";
import Link from "next/link";
import { Gift, Heart, MapPin } from "lucide-react";

import { optimizedImageUrl } from "@/lib/cloudinary";
import type { GiftWithRelations } from "@/lib/gifts/queries";
import { cn } from "@/lib/utils";
import { toggleFavoriteAction } from "@/app/(public)/favoritos/actions";

type GiftCardProps = {
  gift: GiftWithRelations;
  /** Si el user actual la marcó como favorita. Si es undefined no mostramos el botón (anónimo). */
  isFavorited?: boolean;
};

export function GiftCard({ gift, isFavorited }: GiftCardProps) {
  const requirementsCount = gift.requirements.length;
  const showFavoriteButton = typeof isFavorited === "boolean";

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
          <div className="mt-auto flex items-center gap-4 pt-3 text-xs text-muted-foreground">
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
              "flex size-9 items-center justify-center rounded-full bg-background/90 text-foreground/80 shadow-sm ring-1 ring-foreground/10 backdrop-blur transition-colors",
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
    </article>
  );
}
