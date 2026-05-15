"use client";

import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Tables } from "@/lib/database.types";
import {
  giftSubmissionSchema,
  type GiftSubmissionInput,
} from "@/lib/submissions/schema";
import { submitGift } from "@/app/(public)/sumar/actions";
import { cn } from "@/lib/utils";

type SubmitGiftFormProps = {
  cities: Tables<"cities">[];
  categories: Tables<"categories">[];
};

const selectClass = cn(
  "h-9 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none",
  "transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
);

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

export function SubmitGiftForm({ cities, categories }: SubmitGiftFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GiftSubmissionInput>({
    resolver: zodResolver(giftSubmissionSchema),
    defaultValues: {
      businessName: "",
      name: "",
      description: "",
      citySlug: "",
      categorySlug: "",
      address: "",
      requirements: [{ value: "" }],
      sourceUrl: "",
      submitterName: "",
      submitterEmail: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "requirements",
  });

  async function onSubmit(values: GiftSubmissionInput) {
    setServerError(null);
    const result = await submitGift(values);
    if (result.ok) {
      reset();
      setSubmitted(true);
    } else {
      setServerError(result.error);
    }
  }

  if (submitted) {
    return (
      <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border py-16 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-secondary">
          <CheckCircle2 className="size-6 text-primary" />
        </span>
        <div>
          <h2 className="text-lg font-semibold">¡Gracias por sumarlo!</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Tu regalito entró en la cola de revisión. Si está todo bien, en
            poco lo vas a ver publicado.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setSubmitted(false)}
          className="gradient-brand border-0 text-white hover:opacity-90"
        >
          Cargar otro
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-10 flex flex-col gap-6"
      noValidate
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="businessName">Local o marca</Label>
        <Input
          id="businessName"
          placeholder="Ej: Starbucks"
          {...register("businessName")}
        />
        <FieldError message={errors.businessName?.message} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="name">¿Qué regalan?</Label>
        <Input
          id="name"
          placeholder="Ej: Bebida gratis en tu cumpleaños"
          {...register("name")}
        />
        <FieldError message={errors.name?.message} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          rows={4}
          placeholder="Contá en qué consiste el regalito y cómo se cobra."
          {...register("description")}
        />
        <FieldError message={errors.description?.message} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="citySlug">Ciudad</Label>
          <select
            id="citySlug"
            className={selectClass}
            {...register("citySlug")}
          >
            <option value="">Elegí una ciudad</option>
            {cities.map((city) => (
              <option key={city.id} value={city.slug}>
                {city.name}
              </option>
            ))}
          </select>
          <FieldError message={errors.citySlug?.message} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="categorySlug">Categoría</Label>
          <select
            id="categorySlug"
            className={selectClass}
            {...register("categorySlug")}
          >
            <option value="">Elegí una categoría</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
          <FieldError message={errors.categorySlug?.message} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="address">Dirección</Label>
        <Input
          id="address"
          placeholder="Ej: Todas las sucursales"
          {...register("address")}
        />
        <FieldError message={errors.address?.message} />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Requisitos</Label>
        <p className="-mt-1 text-sm text-muted-foreground">
          Qué necesita la persona para cobrar el regalito.
        </p>
        <div className="flex flex-col gap-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-2">
              <div className="flex flex-1 flex-col gap-1">
                <Input
                  placeholder="Ej: Tener cuenta en la app del local"
                  {...register(`requirements.${index}.value`)}
                />
                <FieldError
                  message={errors.requirements?.[index]?.value?.message}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Quitar requisito"
                onClick={() => remove(index)}
                disabled={fields.length === 1}
              >
                <X />
              </Button>
            </div>
          ))}
        </div>
        <FieldError
          message={
            errors.requirements?.message ?? errors.requirements?.root?.message
          }
        />
        {fields.length < 8 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="self-start"
            onClick={() => append({ value: "" })}
          >
            <Plus />
            Agregar requisito
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="sourceUrl">Link de la fuente (opcional)</Label>
        <Input
          id="sourceUrl"
          placeholder="https://..."
          {...register("sourceUrl")}
        />
        <p className="-mt-1 text-sm text-muted-foreground">
          Dónde se confirma la promo: web del local, post de Instagram, etc.
        </p>
        <FieldError message={errors.sourceUrl?.message} />
      </div>

      <div className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
        <p className="text-sm font-medium">Tus datos (opcional)</p>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="submitterName">Nombre</Label>
            <Input
              id="submitterName"
              placeholder="Cómo te llamás"
              {...register("submitterName")}
            />
            <FieldError message={errors.submitterName?.message} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="submitterEmail">Email</Label>
            <Input
              id="submitterEmail"
              placeholder="Por si necesitamos consultarte algo"
              {...register("submitterEmail")}
            />
            <FieldError message={errors.submitterEmail?.message} />
          </div>
        </div>
      </div>

      {serverError && (
        <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {serverError}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="gradient-brand h-11 self-start border-0 px-7 text-white hover:opacity-90"
      >
        {isSubmitting ? "Enviando..." : "Sumar el regalito"}
      </Button>
    </form>
  );
}
