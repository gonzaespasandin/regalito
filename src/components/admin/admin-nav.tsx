"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gift, Inbox, LayoutDashboard, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/admin/login/actions";

const links = [
  { href: "/admin", label: "Inicio", icon: LayoutDashboard },
  { href: "/admin/regalos", label: "Regalitos", icon: Gift },
  { href: "/admin/submissions", label: "Propuestas", icon: Inbox },
];

export function AdminNav({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-6">
        <nav className="flex items-center gap-1">
          <Link href="/admin" className="mr-3 font-bold tracking-tight">
            regalito{" "}
            <span className="font-normal text-muted-foreground">admin</span>
          </Link>
          {links.map((link) => {
            const active =
              link.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <link.icon className="size-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {email}
          </span>
          <form action={signOut}>
            <Button type="submit" variant="ghost" size="sm">
              <LogOut className="size-4" />
              Salir
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
