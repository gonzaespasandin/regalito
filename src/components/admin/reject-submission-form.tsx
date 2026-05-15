"use client";

import { useState } from "react";
import { XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { rejectSubmissionAction } from "@/app/admin/(dashboard)/submissions/actions";

export function RejectSubmissionForm({ submissionId }: { submissionId: string }) {
  const [notes, setNotes] = useState("");

  return (
    <form action={rejectSubmissionAction} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={submissionId} />
      <Textarea
        name="notes"
        rows={4}
        maxLength={500}
        placeholder="Notas internas (opcional). No se le envían al submitter."
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
      />
      <Button
        type="submit"
        variant="destructive"
        size="sm"
        className="self-start"
      >
        <XCircle className="size-4" />
        Rechazar propuesta
      </Button>
    </form>
  );
}
