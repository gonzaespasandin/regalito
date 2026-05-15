"use client";

import Image from "next/image";
import { useState } from "react";
import { CheckCircle2, Pencil, ThumbsDown, ThumbsUp, Trash2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { signInWithGoogle } from "@/app/auth/actions";
import {
  deleteClaimAction,
  submitClaimAction,
} from "@/app/(public)/regalo/[slug]/claim-actions";
import type { ClaimCounts, ClaimWithProfile } from "@/lib/claims/queries";
import type { Tables } from "@/lib/database.types";
import { cn } from "@/lib/utils";

type ClaimSectionProps = {
  giftId: string;
  counts: ClaimCounts;
  ownClaim: Tables<"gift_claims"> | null;
  isLoggedIn: boolean;
  signInNext: string;
  comments: ClaimWithProfile[];
};

type Outcome = Tables<"gift_claims">["outcome"];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function OutcomeBadge({ outcome }: { outcome: Outcome }) {
  if (outcome === "claimed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
        <CheckCircle2 className="size-3.5" />
        Pudo reclamarlo
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
      <XCircle className="size-3.5" />
      No pudo
    </span>
  );
}

function Stats({ counts }: { counts: ClaimCounts }) {
  const total = counts.claimed + counts.failed;
  if (total === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Todavía nadie contó si lo pudo reclamar. ¡Sé el primero!
      </p>
    );
  }
  const successRate = Math.round((counts.claimed / total) * 100);
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <span className="inline-flex items-center gap-1.5 font-medium">
        <ThumbsUp className="size-4 text-emerald-600" />
        {counts.claimed} pudieron
      </span>
      <span className="inline-flex items-center gap-1.5 font-medium">
        <ThumbsDown className="size-4 text-muted-foreground" />
        {counts.failed} no pudieron
      </span>
      <span className="text-xs text-muted-foreground">
        ({successRate}% de éxito sobre {total} respuestas)
      </span>
    </div>
  );
}

export function ClaimSection({
  giftId,
  counts,
  ownClaim,
  isLoggedIn,
  signInNext,
  comments,
}: ClaimSectionProps) {
  const [outcomeChoice, setOutcomeChoice] = useState<Outcome | null>(
    ownClaim?.outcome ?? null,
  );
  const [commentDraft, setCommentDraft] = useState(ownClaim?.comment ?? "");
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(outcome: Outcome, comment: string) {
    setPending(true);
    setError(null);
    const result = await submitClaimAction(giftId, { outcome, comment });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setEditing(false);
  }

  async function remove() {
    setPending(true);
    await deleteClaimAction(giftId);
    setPending(false);
    setOutcomeChoice(null);
    setCommentDraft("");
    setEditing(false);
  }

  const showForm = isLoggedIn && (editing || (!ownClaim && outcomeChoice !== null));
  const showOwnClaim = isLoggedIn && ownClaim && !editing;
  const showIntro = isLoggedIn && !ownClaim && outcomeChoice === null;

  return (
    <section className="mt-12 border-t border-border pt-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold tracking-tight">
          ¿Pudiste reclamar este regalito?
        </h2>
        <Stats counts={counts} />
      </div>

      <div className="mt-6">
        {!isLoggedIn ? (
          <form
            action={signInWithGoogle}
            className="flex flex-col gap-3 rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:flex-row sm:items-center sm:justify-between"
          >
            <input type="hidden" name="next" value={signInNext} />
            <p className="text-sm text-muted-foreground">
              Ingresá con Google para contar cómo te fue y ayudar a la
              comunidad.
            </p>
            <Button type="submit" variant="outline" size="sm" className="gap-2">
              <GoogleLogo /> Ingresar
            </Button>
          </form>
        ) : showIntro ? (
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              size="lg"
              onClick={() => setOutcomeChoice("claimed")}
              className="h-12 flex-1 cursor-pointer border-0 bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <ThumbsUp className="size-5" />
              Pude reclamarlo
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={() => setOutcomeChoice("failed")}
              className="h-12 flex-1 cursor-pointer"
            >
              <ThumbsDown className="size-5" />
              No pude reclamarlo
            </Button>
          </div>
        ) : showOwnClaim && ownClaim ? (
          <div className="flex flex-col gap-3 rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
            <div className="flex items-center justify-between gap-3">
              <OutcomeBadge outcome={ownClaim.outcome} />
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setOutcomeChoice(ownClaim.outcome);
                    setCommentDraft(ownClaim.comment ?? "");
                    setEditing(true);
                  }}
                >
                  <Pencil className="size-4" />
                  Editar
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={remove}
                  disabled={pending}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                  Borrar
                </Button>
              </div>
            </div>
            {ownClaim.comment ? (
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {ownClaim.comment}
              </p>
            ) : (
              <p className="text-sm italic text-muted-foreground">
                Sin comentario. Editá para sumar uno.
              </p>
            )}
          </div>
        ) : null}

        {showForm && outcomeChoice ? (
          <ClaimForm
            outcome={outcomeChoice}
            commentDraft={commentDraft}
            onCommentChange={setCommentDraft}
            onOutcomeChange={setOutcomeChoice}
            onCancel={() => {
              if (ownClaim) {
                setOutcomeChoice(ownClaim.outcome);
                setCommentDraft(ownClaim.comment ?? "");
                setEditing(false);
              } else {
                setOutcomeChoice(null);
                setCommentDraft("");
              }
              setError(null);
            }}
            onSubmit={() => submit(outcomeChoice, commentDraft)}
            pending={pending}
            error={error}
          />
        ) : null}
      </div>

      {comments.length > 0 ? (
        <div className="mt-10">
          <h3 className="mb-4 text-lg font-semibold">Qué cuenta la comunidad</h3>
          <ul className="flex flex-col gap-4">
            {comments.map((claim) => (
              <li
                key={claim.id}
                className="flex gap-3 rounded-2xl bg-card p-4 ring-1 ring-foreground/10"
              >
                {claim.profile?.avatar_url ? (
                  <Image
                    src={claim.profile.avatar_url}
                    alt={claim.profile.display_name ?? "Usuario"}
                    width={36}
                    height={36}
                    className="size-9 shrink-0 rounded-full"
                    unoptimized
                  />
                ) : (
                  <div className="size-9 shrink-0 rounded-full bg-secondary" />
                )}
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">
                      {claim.profile?.display_name ?? "Alguien"}
                    </span>
                    <OutcomeBadge outcome={claim.outcome} />
                    <span className="text-xs text-muted-foreground">
                      {formatDate(claim.created_at)}
                    </span>
                  </div>
                  {claim.comment ? (
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                      {claim.comment}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function ClaimForm({
  outcome,
  commentDraft,
  onCommentChange,
  onOutcomeChange,
  onCancel,
  onSubmit,
  pending,
  error,
}: {
  outcome: Outcome;
  commentDraft: string;
  onCommentChange: (value: string) => void;
  onOutcomeChange: (outcome: Outcome) => void;
  onCancel: () => void;
  onSubmit: () => void;
  pending: boolean;
  error: string | null;
}) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="flex flex-col gap-4 rounded-2xl bg-card p-5 ring-1 ring-foreground/10"
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => onOutcomeChange("claimed")}
          className={cn(
            "inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
            outcome === "claimed"
              ? "border-emerald-600 bg-emerald-50 text-emerald-700"
              : "border-input text-muted-foreground hover:bg-muted",
          )}
        >
          <ThumbsUp className="size-4" />
          Pude reclamarlo
        </button>
        <button
          type="button"
          onClick={() => onOutcomeChange("failed")}
          className={cn(
            "inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
            outcome === "failed"
              ? "border-foreground/40 bg-muted text-foreground"
              : "border-input text-muted-foreground hover:bg-muted",
          )}
        >
          <ThumbsDown className="size-4" />
          No pude
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">
          {outcome === "claimed"
            ? "Contanos qué reclamaste (opcional)"
            : "Contanos qué te faltó o qué pasó (opcional)"}
        </label>
        <Textarea
          rows={3}
          maxLength={800}
          placeholder={
            outcome === "claimed"
              ? "Me dieron una bebida fría sin problemas, tuve que mostrar DNI."
              : "Me dijeron que la promo se terminó hace un mes."
          }
          value={commentDraft}
          onChange={(event) => onCommentChange(event.target.value)}
        />
      </div>

      {error ? (
        <p className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={pending}
          className="gradient-brand border-0 text-white hover:opacity-90"
        >
          {pending ? "Guardando..." : "Guardar respuesta"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={pending}
        >
          Cancelar
        </Button>
      </div>
    </form>
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
