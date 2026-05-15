import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { GiftForm } from "@/components/admin/gift-form";
import { RejectSubmissionForm } from "@/components/admin/reject-submission-form";
import { Badge } from "@/components/ui/badge";
import type { Database } from "@/lib/database.types";
import { getCategories, getCities } from "@/lib/gifts/queries";
import type { GiftFormInput } from "@/lib/gifts/schema";
import {
  getSubmissionById,
  type AdminSubmission,
  type SubmissionPayload,
} from "@/lib/submissions/queries";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { approveSubmissionAction } from "../actions";

type SubmissionStatus = Database["public"]["Enums"]["submission_status"];

const statusLabel: Record<SubmissionStatus, string> = {
  pending: "Pendiente",
  approved: "Aprobada",
  rejected: "Rechazada",
};

const statusVariant: Record<
  SubmissionStatus,
  "default" | "secondary" | "outline"
> = {
  pending: "default",
  approved: "secondary",
  rejected: "outline",
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildInitial(
  payload: SubmissionPayload,
  cityId: string,
  categoryId: string,
): GiftFormInput {
  return {
    businessName: payload.business_name,
    name: payload.name,
    description: payload.description,
    cityId,
    categoryId,
    address: payload.address,
    requirements:
      payload.requirements.length > 0
        ? payload.requirements.map((value) => ({ value }))
        : [{ value: "" }],
    sourceUrl: payload.source_url ?? "",
    imageUrl: "",
    status: "draft",
  };
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 text-sm">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span>{value}</span>
    </div>
  );
}

function SubmissionMeta({ submission }: { submission: AdminSubmission }) {
  const submitter =
    submission.submitter_name && submission.submitter_email
      ? `${submission.submitter_name} (${submission.submitter_email})`
      : submission.submitter_name ?? submission.submitter_email ?? "Anónimo";

  return (
    <div className="grid gap-4 rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:grid-cols-2">
      <MetaRow label="Estado" value={
        <Badge variant={statusVariant[submission.status]}>
          {statusLabel[submission.status]}
        </Badge>
      } />
      <MetaRow label="Recibido" value={formatDateTime(submission.created_at)} />
      <MetaRow label="De" value={submitter} />
      <MetaRow
        label="Fuente"
        value={
          submission.payload.source_url ? (
            <a
              href={submission.payload.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-foreground underline-offset-4 hover:underline"
            >
              Abrir <ExternalLink className="size-3.5" />
            </a>
          ) : (
            "—"
          )
        }
      />
      {submission.reviewed_at && (
        <MetaRow
          label="Revisada"
          value={`${formatDateTime(submission.reviewed_at)} · ${
            submission.reviewer_email ?? "—"
          }`}
        />
      )}
      {submission.notes && (
        <div className="sm:col-span-2">
          <MetaRow
            label="Notas internas"
            value={
              <span className="block whitespace-pre-wrap text-sm">
                {submission.notes}
              </span>
            }
          />
        </div>
      )}
    </div>
  );
}

function ReadOnlyPayload({ payload }: { payload: SubmissionPayload }) {
  return (
    <dl className="flex flex-col gap-4 rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
      <div>
        <dt className="text-xs uppercase tracking-wide text-muted-foreground">
          Local o marca
        </dt>
        <dd>{payload.business_name}</dd>
      </div>
      <div>
        <dt className="text-xs uppercase tracking-wide text-muted-foreground">
          Regalito
        </dt>
        <dd>{payload.name}</dd>
      </div>
      <div>
        <dt className="text-xs uppercase tracking-wide text-muted-foreground">
          Descripción
        </dt>
        <dd className="whitespace-pre-wrap text-sm">{payload.description}</dd>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
            Ciudad
          </dt>
          <dd>{payload.city_slug}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
            Categoría
          </dt>
          <dd>{payload.category_slug}</dd>
        </div>
      </div>
      <div>
        <dt className="text-xs uppercase tracking-wide text-muted-foreground">
          Dirección
        </dt>
        <dd>{payload.address}</dd>
      </div>
      <div>
        <dt className="text-xs uppercase tracking-wide text-muted-foreground">
          Requisitos
        </dt>
        <dd>
          <ul className="list-disc pl-5 text-sm">
            {payload.requirements.map((requirement, index) => (
              <li key={index}>{requirement}</li>
            ))}
          </ul>
        </dd>
      </div>
    </dl>
  );
}

export default async function ReviewSubmissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const adminClient = createSupabaseAdminClient();
  const submission = await getSubmissionById(adminClient, id);
  if (!submission) notFound();

  const supabase = await createSupabaseServerClient();
  const [cities, categories] = await Promise.all([
    getCities(supabase),
    getCategories(supabase),
  ]);

  const city = cities.find((item) => item.slug === submission.payload.city_slug);
  const category = categories.find(
    (item) => item.slug === submission.payload.category_slug,
  );

  const initial = buildInitial(
    submission.payload,
    city?.id ?? "",
    category?.id ?? "",
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <Link
        href="/admin/submissions"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver a propuestas
      </Link>

      <h1 className="mt-6 text-3xl font-bold tracking-tight">
        {submission.payload.name}
      </h1>
      <p className="mt-1 text-muted-foreground">
        {submission.payload.business_name}
      </p>

      <div className="mt-6">
        <SubmissionMeta submission={submission} />
      </div>

      {submission.status === "pending" ? (
        <>
          {(!city || !category) && (
            <p className="mt-6 rounded-lg bg-amber-100/70 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
              {!city && (
                <>
                  La ciudad <code>{submission.payload.city_slug}</code> del envío
                  no existe. Elegí una antes de aprobar.
                </>
              )}
              {!city && !category && <br />}
              {!category && (
                <>
                  La categoría <code>{submission.payload.category_slug}</code> del
                  envío no existe. Elegí una antes de aprobar.
                </>
              )}
            </p>
          )}

          <section className="mt-10">
            <h2 className="mb-4 text-xl font-bold tracking-tight">
              Aprobar y publicar
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Ajustá lo que haga falta (podés subir una imagen de marca) y
              publicá. Se crea como <strong>borrador</strong>; cambialo a activo
              cuando lo quieras visible.
            </p>
            <GiftForm
              cities={cities}
              categories={categories}
              initial={initial}
              action={approveSubmissionAction.bind(null, submission.id)}
              submitLabel="Aprobar y crear regalito"
            />
          </section>

          <section className="mt-12 rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
            <h2 className="mb-1 text-lg font-bold tracking-tight">
              Rechazar propuesta
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Las notas son internas — quedan guardadas para tu referencia.
            </p>
            <RejectSubmissionForm submissionId={submission.id} />
          </section>
        </>
      ) : (
        <section className="mt-8">
          <h2 className="mb-4 text-xl font-bold tracking-tight">
            Datos enviados
          </h2>
          <ReadOnlyPayload payload={submission.payload} />
        </section>
      )}
    </main>
  );
}
