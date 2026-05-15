import Image from "next/image";
import Link from "next/link";
import { Gift, MapPin } from "lucide-react";

import { optimizedImageUrl } from "@/lib/cloudinary";
import type { GiftWithRelations } from "@/lib/gifts/queries";

export function GiftCard({ gift }: { gift: GiftWithRelations }) {
  const requirementsCount = gift.requirements.length;

  return (
    <Link
      href={`/regalo/${gift.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10 transition-all hover:-translate-y-0.5 hover:ring-foreground/20"
    >
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
          {gift.city && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" />
              {gift.city.name}
            </span>
          )}
          <span>
            {requirementsCount} requisito{requirementsCount === 1 ? "" : "s"}
          </span>
        </div>
      </div>
    </Link>
  );
}
