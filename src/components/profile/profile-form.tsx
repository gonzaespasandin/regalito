"use client";

import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Tables } from "@/lib/database.types";
import { profileFormSchema, type ProfileFormInput } from "@/lib/profile/schema";
import { updateProfileAction } from "@/app/(public)/perfil/actions";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

export function ProfileForm({ profile }: { profile: Tables<"profiles"> }) {
  const [saved, setSaved] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormInput>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: profile.display_name ?? "",
      birthday: profile.birthday ?? "",
    },
  });

  async function onSubmit(values: ProfileFormInput) {
    setServerError(null);
    const result = await updateProfileAction(values);
    if (result.ok) {
      setSaved(true);
    } else {
      setServerError(result.error);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
      noValidate
    >
      <div className="flex items-center gap-4 rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
        {profile.avatar_url ? (
          <Image
            src={profile.avatar_url}
            alt={profile.display_name ?? profile.email}
            width={56}
            height={56}
            className="size-14 rounded-full ring-1 ring-foreground/10"
            unoptimized
          />
        ) : (
          <div className="size-14 rounded-full bg-secondary" />
        )}
        <div className="flex flex-col">
          <span className="text-sm font-medium">{profile.email}</span>
          <span className="text-xs text-muted-foreground">
            Tu email y avatar vienen de Google.
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="displayName">Cómo te mostramos</Label>
        <Input
          id="displayName"
          placeholder="Tu nombre"
          {...register("displayName")}
        />
        <FieldError message={errors.displayName?.message} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="birthday">Cumpleaños (opcional)</Label>
        <Input id="birthday" type="date" {...register("birthday")} />
        <p className="-mt-1 text-xs text-muted-foreground">
          Nos sirve para avisarte de los regalitos que podés cobrar cerca de tu
          cumple. No lo compartimos con nadie.
        </p>
        <FieldError message={errors.birthday?.message} />
      </div>

      {serverError && (
        <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {serverError}
        </p>
      )}

      {saved && !serverError && (
        <p className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="size-4" />
          Listo, perfil actualizado.
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="gradient-brand h-11 self-start border-0 px-7 text-white hover:opacity-90"
      >
        {isSubmitting ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  );
}
