import Image from "next/image";
import Link from "next/link";
import { LogOut, User as UserIcon } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { signInWithGoogle, signOut } from "@/app/auth/actions";
import { getCurrentUser } from "@/lib/auth/user";
import { cn } from "@/lib/utils";

export async function SiteHeader() {
  const current = await getCurrentUser();

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
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden sm:inline-flex")}
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
            <span className="sm:hidden">Sumalo</span>
            <span className="hidden sm:inline">¿Conocés uno? Sumalo</span>
          </Link>

          {current ? (
            <UserMenu
              avatarUrl={current.profile.avatar_url}
              email={current.profile.email}
              displayName={current.profile.display_name}
            />
          ) : (
            <form action={signInWithGoogle}>
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <GoogleLogo />
                Ingresar
              </Button>
            </form>
          )}
        </nav>
      </div>
    </header>
  );
}

function UserMenu({
  avatarUrl,
  email,
  displayName,
}: {
  avatarUrl: string | null;
  email: string;
  displayName: string | null;
}) {
  const label = displayName ?? email;
  return (
    <div className="group relative">
      <button
        type="button"
        className="flex items-center gap-2 rounded-full ring-1 ring-foreground/10 transition-colors hover:ring-foreground/20"
        aria-label="Abrir menú de usuario"
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={label}
            width={32}
            height={32}
            className="size-8 rounded-full"
            unoptimized
          />
        ) : (
          <span className="flex size-8 items-center justify-center rounded-full bg-secondary">
            <UserIcon className="size-4" />
          </span>
        )}
      </button>
      <div className="invisible absolute right-0 top-full z-50 mt-2 w-56 origin-top-right rounded-xl border border-border bg-card p-1 opacity-0 shadow-lg ring-1 ring-foreground/10 transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        <div className="px-3 py-2 text-xs text-muted-foreground">
          {label}
        </div>
        <Link
          href="/favoritos"
          className="block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-secondary"
        >
          Mis favoritos
        </Link>
        <Link
          href="/perfil"
          className="block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-secondary"
        >
          Mi perfil
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="size-4" />
            Salir
          </button>
        </form>
      </div>
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.85A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.11V7.04H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.96l3.66-2.85Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.04l3.66 2.85C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}
