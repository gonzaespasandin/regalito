import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowLeft, Check, ExternalLink, Gift, MapPin } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { optimizedImageUrl } from "@/lib/cloudinary";
import { getGiftBySlug } from "@/lib/gifts/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const gift = await getGiftBySlug(supabase, slug);

  if (!gift) {
    return { title: "Regalito no encontrado — regalito" };
  }

  const title = `${gift.name} — ${gift.business_name} | regalito`;
  return {
    title,
    description: gift.description,
    openGraph: { title, description: gift.description },
  };
}

export default async function GiftPage({ params }: { params: Params }) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const gift = await getGiftBySlug(supabase, slug);

  if (!gift) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <Link
        href="/#regalitos"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver al listado
      </Link>

      <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-secondary">
        {gift.image_url ? (
          <Image
            src={optimizedImageUrl(gift.image_url)}
            alt={gift.business_name}
            fill
            sizes="(min-width: 768px) 768px, 100vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="gradient-brand flex h-full w-full items-center justify-center">
            <Gift className="size-16 text-white/90" />
          </div>
        )}
        {gift.category && (
          <span className="absolute top-4 left-4 rounded-full bg-background/90 px-3 py-1 text-sm font-medium backdrop-blur">
            {gift.category.name}
          </span>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-2">
        <p className="text-sm font-medium text-muted-foreground">
          {gift.business_name}
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {gift.name}
        </h1>
      </div>

      <p className="mt-4 text-pretty text-muted-foreground">
        {gift.description}
      </p>

      {gift.requirements.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">Requisitos</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {gift.requirements.map((requirement) => (
              <li key={requirement} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{requirement}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8 grid gap-4 rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Dónde</p>
          <p className="mt-1 inline-flex items-center gap-1.5 text-sm">
            <MapPin className="size-4" />
            {gift.address}
            {gift.city ? ` · ${gift.city.name}` : ""}
          </p>
        </div>
        {gift.source_url && (
          <div>
            <p className="text-xs font-medium text-muted-foreground">Fuente</p>
            <a
              href={gift.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              Dónde lo confirmamos
              <ExternalLink className="size-3.5" />
            </a>
          </div>
        )}
      </section>

      <aside className="mt-6 flex items-start gap-3 rounded-2xl bg-amber-100/60 px-5 py-4 text-sm text-amber-950 ring-1 ring-amber-200">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
        <p>
          <strong>Confirmá antes de ir.</strong> No somos la verdad absoluta:
          muchos locales no tienen una fuente oficial que confirme la promo y
          los regalitos pueden cambiar, variar por sucursal o vencer sin aviso.
          {gift.source_url
            ? " Si podés, revisá la fuente arriba o consultá directo con el local."
            : " Te recomendamos consultar directo con el local antes de pasar."}
        </p>
      </aside>

      <div className="mt-8">
        <Link
          href="/sumar"
          className={cn(
            buttonVariants(),
            "gradient-brand border-0 text-white hover:opacity-90",
          )}
        >
          ¿Conocés otro regalito? Sumalo
        </Link>
      </div>
    </main>
  );
}
