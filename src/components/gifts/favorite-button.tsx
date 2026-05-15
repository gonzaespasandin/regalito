import { Heart } from "lucide-react";

import { toggleFavoriteAction } from "@/app/(public)/favoritos/actions";
import { cn } from "@/lib/utils";

/**
 * Botón de favorito reutilizable (server). Renderiza solo si el llamador
 * pasa `isFavorited` (undefined = usuario anónimo, no mostramos nada).
 */
export function FavoriteButton({
  giftId,
  isFavorited,
  size = "md",
}: {
  giftId: string;
  isFavorited: boolean | undefined;
  size?: "sm" | "md";
}) {
  if (typeof isFavorited !== "boolean") return null;

  const dimensions =
    size === "sm" ? "size-9" : "h-10 gap-2 rounded-full px-4 text-sm";
  const iconSize = size === "sm" ? "size-4" : "size-4";

  return (
    <form action={toggleFavoriteAction.bind(null, giftId)}>
      <button
        type="submit"
        aria-label={isFavorited ? "Quitar de favoritos" : "Guardar como favorito"}
        className={cn(
          "inline-flex items-center justify-center rounded-full bg-background/90 text-foreground/80 shadow-sm ring-1 ring-foreground/10 transition-colors",
          "hover:bg-background hover:text-primary",
          dimensions,
        )}
      >
        <Heart
          className={cn(
            iconSize,
            "transition-colors",
            isFavorited && "fill-primary text-primary",
          )}
        />
        {size === "md" ? (
          <span>{isFavorited ? "Guardado" : "Guardar"}</span>
        ) : null}
      </button>
    </form>
  );
}
