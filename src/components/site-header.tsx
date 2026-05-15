import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-bold tracking-tight">
          regal
          <span className="bg-gradient-to-r from-[#ff6b6b] to-[#ff8e53] bg-clip-text text-transparent">
            ito
          </span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            href="/#regalitos"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Regalitos
          </Link>
          <Link
            href="/sumar"
            className={cn(
              buttonVariants({ size: "sm" }),
              "gradient-brand border-0 text-white hover:opacity-90",
            )}
          >
            ¿Conocés uno? Sumalo
          </Link>
        </nav>
      </div>
    </header>
  );
}
