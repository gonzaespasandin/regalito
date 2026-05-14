import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ComingSoon({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <main className="mx-auto flex max-w-xl flex-1 flex-col items-center justify-center px-6 py-32 text-center">
      <span className="mb-6 inline-flex items-center rounded-full border border-border bg-secondary px-4 py-1.5 text-sm font-medium text-muted-foreground">
        🚧 Próximamente
      </span>
      <h1 className="text-balance text-4xl font-bold tracking-tight">{title}</h1>
      <p className="mt-4 text-pretty text-muted-foreground">{description}</p>
      <Link
        href="/"
        className={cn(buttonVariants({ variant: "outline" }), "mt-8")}
      >
        Volver al inicio
      </Link>
    </main>
  );
}
