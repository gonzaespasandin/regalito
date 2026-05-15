import Link from "next/link";
import { CheckCircle2, FileEdit, Gift, Inbox } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { cn } from "@/lib/utils";

async function countGifts(status: "active" | "draft" | "inactive") {
  const supabase = createSupabaseAdminClient();
  const { count } = await supabase
    .from("gifts")
    .select("*", { count: "exact", head: true })
    .eq("status", status);
  return count ?? 0;
}

async function countPendingSubmissions() {
  const supabase = createSupabaseAdminClient();
  const { count } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");
  return count ?? 0;
}

export default async function AdminDashboardPage() {
  const [active, draft, inactive, pending] = await Promise.all([
    countGifts("active"),
    countGifts("draft"),
    countGifts("inactive"),
    countPendingSubmissions(),
  ]);

  const stats = [
    { label: "Activos", value: active, icon: CheckCircle2 },
    { label: "Borradores", value: draft, icon: FileEdit },
    { label: "Inactivos", value: inactive, icon: Gift },
    { label: "Propuestas pendientes", value: pending, icon: Inbox },
  ];

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Panel</h1>
        <p className="text-muted-foreground">
          Gestioná los regalitos publicados y las propuestas de la comunidad.
        </p>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col gap-2 rounded-2xl bg-card p-5 ring-1 ring-foreground/10"
          >
            <stat.icon className="size-5 text-muted-foreground" />
            <span className="text-3xl font-bold">{stat.value}</span>
            <span className="text-sm text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/admin/regalos"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Ver todos los regalitos
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
    </main>
  );
}
