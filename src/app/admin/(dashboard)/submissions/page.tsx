import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Database } from "@/lib/database.types";
import { getSubmissions } from "@/lib/submissions/queries";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { cn } from "@/lib/utils";

type SubmissionStatus = Database["public"]["Enums"]["submission_status"];
type StatusFilter = SubmissionStatus | "all";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "pending", label: "Pendientes" },
  { value: "approved", label: "Aprobadas" },
  { value: "rejected", label: "Rechazadas" },
  { value: "all", label: "Todas" },
];

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

function parseStatus(value: string | string[] | undefined): StatusFilter {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === "approved" || raw === "rejected" || raw === "all") return raw;
  return "pending";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function AdminSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[] }>;
}) {
  const { status: statusParam } = await searchParams;
  const status = parseStatus(statusParam);

  const submissions = await getSubmissions(createSupabaseAdminClient(), {
    status: status === "all" ? undefined : status,
  });

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Propuestas</h1>
        <p className="text-muted-foreground">
          Revisá los regalitos que mandó la comunidad desde <code>/sumar</code>.
        </p>
      </header>

      <div className="mt-6 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => {
          const active = filter.value === status;
          const href =
            filter.value === "pending"
              ? "/admin/submissions"
              : `/admin/submissions?status=${filter.value}`;
          return (
            <Link
              key={filter.value}
              href={href}
              className={cn(
                "inline-flex items-center rounded-full border px-3 py-1 text-sm transition-colors",
                active
                  ? "border-foreground/20 bg-secondary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
        {submissions.length === 0 ? (
          <p className="px-5 py-16 text-center text-sm text-muted-foreground">
            No hay propuestas en este filtro.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Regalito</TableHead>
                <TableHead>Ciudad / Categoría</TableHead>
                <TableHead>De</TableHead>
                <TableHead>Recibido</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission) => {
                const submitter =
                  submission.submitter_name ?? submission.submitter_email ?? "—";
                return (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <span className="font-medium">
                        {submission.payload.name}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {submission.payload.business_name}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <span className="block">{submission.payload.city_slug}</span>
                      <span className="block text-xs">
                        {submission.payload.category_slug}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {submitter}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(submission.created_at)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[submission.status]}>
                        {statusLabel[submission.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/admin/submissions/${submission.id}`}
                        className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
                      >
                        Revisar
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </main>
  );
}
