import Link from "next/link";
import { SearchX } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Estado vacío del listado. Distingue entre "no hay nada cargado" y
 * "los filtros no devolvieron resultados".
 */
export function GiftsEmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border py-20 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-secondary">
        <SearchX className="size-6 text-muted-foreground" />
      </span>
      <div>
        <h2 className="text-lg font-semibold">
          {filtered
            ? "No encontramos regalitos con esos filtros"
            : "Todavía no hay regalitos cargados"}
        </h2>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
          {filtered
            ? "Probá con otra ciudad o categoría, o sumá vos el que conozcas."
            : "Pronto vamos a ir cargando los primeros. ¿Conocés uno? Sumalo."}
        </p>
      </div>
      <div className="flex gap-3">
        {filtered && (
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Ver todos
          </Link>
        )}
        <Link
          href="/sumar"
          className={cn(
            buttonVariants(),
            "gradient-brand border-0 text-white hover:opacity-90",
          )}
        >
          Sumá un regalito
        </Link>
      </div>
    </div>
  );
}
