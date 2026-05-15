"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Cake, X } from "lucide-react";

const DISMISS_KEY = "regalito_birthday_dismissed";

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getDismissed(): boolean {
  if (typeof window === "undefined") return true; // SSR: ocultar para evitar flash
  return window.localStorage.getItem(DISMISS_KEY) === "1";
}

/**
 * Banner que invita al usuario logueado a completar su cumple. Una vez
 * dismissado, queda guardado en localStorage. El padre decide cuándo
 * renderizarlo (solo si user logueado y birthday null).
 */
export function BirthdayBanner() {
  const dismissed = useSyncExternalStore(
    subscribe,
    getDismissed,
    () => true, // server snapshot: ocultar
  );

  if (dismissed) return null;

  function dismiss() {
    window.localStorage.setItem(DISMISS_KEY, "1");
    window.dispatchEvent(new StorageEvent("storage", { key: DISMISS_KEY }));
  }

  return (
    <div className="flex items-center gap-3 border-b border-border bg-secondary/60 px-6 py-2.5 text-sm">
      <Cake className="size-4 shrink-0 text-primary" />
      <p className="flex-1">
        Completá tu cumpleaños para que te avisemos qué regalitos podés cobrar.{" "}
        <Link
          href="/perfil"
          className="font-medium underline-offset-4 hover:underline"
        >
          Ir a mi perfil
        </Link>
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Cerrar"
        className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
