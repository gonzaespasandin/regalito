import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Database } from "@/lib/database.types";
import { getAllGifts } from "@/lib/gifts/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { cn } from "@/lib/utils";

type GiftStatus = Database["public"]["Enums"]["gift_status"];

const statusLabel: Record<GiftStatus, string> = {
  active: "Activo",
  draft: "Borrador",
  inactive: "Inactivo",
};

const statusVariant: Record<
  GiftStatus,
  "default" | "secondary" | "outline"
> = {
  active: "default",
  draft: "secondary",
  inactive: "outline",
};

export default async function AdminGiftsPage() {
  const gifts = await getAllGifts(createSupabaseAdminClient());

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Regalitos</h1>
          <p className="text-muted-foreground">
            {gifts.length} regalito{gifts.length === 1 ? "" : "s"} en total.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/regalos/importar"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Importar desde Excel
          </Link>
          <Link
            href="/admin/regalos/nuevo"
            className={cn(
              buttonVariants(),
              "gradient-brand border-0 text-white hover:opacity-90",
            )}
          >
            Cargar un regalito
          </Link>
        </div>
      </header>

      <div className="mt-8 overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
        {gifts.length === 0 ? (
          <p className="px-5 py-16 text-center text-sm text-muted-foreground">
            Todavía no hay regalitos cargados.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Regalito</TableHead>
                <TableHead>Ciudad</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gifts.map((gift) => (
                <TableRow key={gift.id}>
                  <TableCell>
                    <span className="font-medium">{gift.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {gift.business_name}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {gift.city?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {gift.category?.name ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[gift.status]}>
                      {statusLabel[gift.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/admin/regalos/${gift.id}`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                      )}
                    >
                      Editar
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </main>
  );
}
