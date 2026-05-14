import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center px-6 pt-24 pb-20 text-center sm:pt-32">
      <span className="mb-6 inline-flex items-center rounded-full border border-border bg-secondary px-4 py-1.5 text-sm font-medium text-muted-foreground">
        🎂 Hecho para cumpleañeros de Argentina
      </span>
      <h1 className="text-balance text-5xl font-bold tracking-tight sm:text-6xl">
        Cobrate un{" "}
        <span className="bg-gradient-to-r from-[#ff6b6b] to-[#ff8e53] bg-clip-text text-transparent">
          regalito
        </span>{" "}
        en tu cumple
      </h1>
      <p className="mt-6 max-w-xl text-pretty text-lg text-muted-foreground">
        Cafés gratis, postres, descuentos y más. Juntamos en un solo lugar todos
        los locales y marcas que te regalan algo por tu cumpleaños, con los
        requisitos bien claros y actualizados por la comunidad.
      </p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/regalitos"
          className={cn(
            buttonVariants({ size: "lg" }),
            "gradient-brand h-12 border-0 px-7 text-base text-white shadow-sm hover:opacity-90",
          )}
        >
          Ver los regalitos
        </Link>
        <Link
          href="/sumar"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "h-12 px-7 text-base",
          )}
        >
          Sumá el tuyo
        </Link>
      </div>
    </section>
  );
}
