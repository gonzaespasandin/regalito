"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";

import type { Tables } from "@/lib/database.types";
import { cn } from "@/lib/utils";

type GiftFiltersProps = {
  cities: Tables<"cities">[];
  categories: Tables<"categories">[];
};

const selectClass = cn(
  "h-10 rounded-lg border border-input bg-card px-3 text-sm outline-none",
  "transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
);

/**
 * Barra de filtros del listado. El estado vive en la URL (?ciudad=&categoria=),
 * así que es shareable y el filtrado real lo hace el Server Component.
 */
export function GiftFilters({ cities, categories }: GiftFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const ciudad = searchParams.get("ciudad") ?? "";
  const categoria = searchParams.get("categoria") ?? "";
  const hasFilters = ciudad !== "" || categoria !== "";

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      const queryString = params.toString();
      router.push(queryString ? `/regalitos?${queryString}` : "/regalitos");
    },
    [router, searchParams],
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        aria-label="Filtrar por ciudad"
        value={ciudad}
        onChange={(event) => updateParam("ciudad", event.target.value)}
        className={selectClass}
      >
        <option value="">Todas las ciudades</option>
        {cities.map((city) => (
          <option key={city.id} value={city.slug}>
            {city.name}
          </option>
        ))}
      </select>

      <select
        aria-label="Filtrar por categoría"
        value={categoria}
        onChange={(event) => updateParam("categoria", event.target.value)}
        className={selectClass}
      >
        <option value="">Todas las categorías</option>
        {categories.map((category) => (
          <option key={category.id} value={category.slug}>
            {category.name}
          </option>
        ))}
      </select>

      {hasFilters && (
        <button
          type="button"
          onClick={() => router.push("/regalitos")}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-4" />
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
