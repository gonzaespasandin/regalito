"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  importGiftsAction,
  type ImportResult,
} from "@/app/admin/(dashboard)/regalos/import-actions";

export function GiftImportForm() {
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!file) return;

    setSubmitting(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    setResult(await importGiftsAction(formData));
    setSubmitting(false);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-input bg-card px-3 text-sm transition-colors hover:bg-muted">
          <Upload className="size-4" />
          {file ? file.name : "Elegir archivo .xlsx"}
          <input
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="sr-only"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
        </label>
        <Button
          type="submit"
          disabled={!file || submitting}
          className="gradient-brand border-0 text-white hover:opacity-90"
        >
          {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
          {submitting ? "Importando..." : "Importar"}
        </Button>
      </div>

      {result && !result.ok && (
        <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {result.error}
        </p>
      )}

      {result && result.ok && (
        <div className="flex flex-col gap-3 rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
          <p className="inline-flex items-center gap-2 font-medium">
            <CheckCircle2 className="size-5 text-primary" />
            {result.imported} regalito{result.imported === 1 ? "" : "s"}{" "}
            importado{result.imported === 1 ? "" : "s"}
            {result.skipped > 0 ? ` · ${result.skipped} omitido(s)` : ""}
          </p>
          {result.errors.length > 0 && (
            <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
              {result.errors.map((rowError, index) => (
                <li key={index}>
                  {rowError.row > 0 ? `Fila ${rowError.row}: ` : ""}
                  {rowError.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </form>
  );
}
