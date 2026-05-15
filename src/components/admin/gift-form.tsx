"use client";

import { useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Tables } from "@/lib/database.types";
import type { AdminGift } from "@/lib/gifts/admin";
import { giftFormSchema, type GiftFormInput } from "@/lib/gifts/schema";
import {
  uploadGiftImageAction,
  type GiftActionResult,
} from "@/app/admin/(dashboard)/regalos/actions";
import { cn } from "@/lib/utils";

type GiftFormProps = {
  cities: Tables<"cities">[];
  categories: Tables<"categories">[];
  gift?: AdminGift;
  action: (input: GiftFormInput) => Promise<GiftActionResult>;
  submitLabel: string;
};

const selectClass = cn(
  "h-9 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none",
  "transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
);

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

function buildDefaults(gift?: AdminGift): GiftFormInput {
  if (!gift) {
    return {
      businessName: "",
      name: "",
      description: "",
      cityId: "",
      categoryId: "",
      address: "",
      requirements: [{ value: "" }],
      sourceUrl: "",
      imageUrl: "",
      status: "draft",
    };
  }
  return {
    businessName: gift.business_name,
    name: gift.name,
    description: gift.description,
    cityId: gift.city_id,
    categoryId: gift.category_id,
    address: gift.address,
    requirements:
      gift.requirements.length > 0
        ? gift.requirements.map((value) => ({ value }))
        : [{ value: "" }],
    sourceUrl: gift.source_url ?? "",
    imageUrl: gift.image_url ?? "",
    status: gift.status,
  };
}

export function GiftForm({
  cities,
  categories,
  gift,
  action,
  submitLabel,
}: GiftFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<GiftFormInput>({
    resolver: zodResolver(giftFormSchema),
    defaultValues: buildDefaults(gift),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "requirements",
  });

  const imageUrl = useWatch({ control, name: "imageUrl" });

  async function onImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);
    const result = await uploadGiftImageAction(formData);

    if (result.ok) {
      setValue("imageUrl", result.url, { shouldValidate: true });
    } else {
      setUploadError(result.error);
    }
    setUploading(false);
  }

  async function onSubmit(values: GiftFormInput) {
    setServerError(null);
    const result = await action(values);
    // En éxito la action redirige y nunca devuelve; solo llega un objeto si falló.
    if (result && !result.ok) {
      setServerError(result.error);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
      noValidate
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="businessName">Local o marca</Label>
        <Input id="businessName" {...register("businessName")} />
        <FieldError message={errors.businessName?.message} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="name">¿Qué regalan?</Label>
        <Input id="name" {...register("name")} />
        <FieldError message={errors.name?.message} />
        {gift && (
          <p className="-mt-1 text-xs text-muted-foreground">
            Slug actual: <code>{gift.slug}</code> — no cambia al editar el
            título.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea id="description" rows={4} {...register("description")} />
        <FieldError message={errors.description?.message} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="cityId">Ciudad</Label>
          <select id="cityId" className={selectClass} {...register("cityId")}>
            <option value="">Elegí una ciudad</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
          <FieldError message={errors.cityId?.message} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="categoryId">Categoría</Label>
          <select
            id="categoryId"
            className={selectClass}
            {...register("categoryId")}
          >
            <option value="">Elegí una categoría</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <FieldError message={errors.categoryId?.message} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="address">Dirección</Label>
        <Input id="address" {...register("address")} />
        <FieldError message={errors.address?.message} />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Requisitos</Label>
        <div className="flex flex-col gap-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-2">
              <div className="flex flex-1 flex-col gap-1">
                <Input {...register(`requirements.${index}.value`)} />
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

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="sourceUrl">Link de la fuente (opcional)</Label>
          <Input
            id="sourceUrl"
            placeholder="https://..."
            {...register("sourceUrl")}
          />
          <FieldError message={errors.sourceUrl?.message} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="image">Imagen de la marca (opcional)</Label>
          <div className="flex items-center gap-3">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt="Imagen del regalito"
                className="size-14 shrink-0 rounded-lg object-cover ring-1 ring-foreground/10"
              />
            ) : null}
            <label
              className={cn(
                "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-input bg-card px-3 text-sm transition-colors hover:bg-muted",
                uploading && "pointer-events-none opacity-60",
              )}
            >
              {uploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              {uploading
                ? "Subiendo..."
                : imageUrl
                  ? "Cambiar imagen"
                  : "Subir imagen"}
              <input
                id="image"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={onImageChange}
                disabled={uploading}
              />
            </label>
          </div>
          <FieldError message={uploadError ?? errors.imageUrl?.message} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="status">Estado</Label>
        <select id="status" className={selectClass} {...register("status")}>
          <option value="draft">Borrador</option>
          <option value="active">Activo (visible en el sitio)</option>
          <option value="inactive">Inactivo</option>
        </select>
        <FieldError message={errors.status?.message} />
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
        {isSubmitting ? "Guardando..." : submitLabel}
      </Button>
    </form>
  );
}
