import "server-only";

import ExcelJS from "exceljs";
import { z } from "zod";

import type { Database, Tables } from "@/lib/database.types";
import { slugify } from "@/lib/slug";

type GiftStatus = Database["public"]["Enums"]["gift_status"];

/** Fila lista para insertar en `gifts` + sus ciudades. */
export type ParsedGiftRow = {
  slug: string;
  name: string;
  business_name: string;
  description: string;
  requirements: string[];
  address: string;
  image_url: string | null;
  source_url: string | null;
  city_ids: string[];
  category_id: string;
  status: GiftStatus;
};

export type ImportRowError = { row: number; message: string };

export type ParseResult = {
  valid: ParsedGiftRow[];
  errors: ImportRowError[];
};

const rowSchema = z.object({
  marca: z.string().trim().min(2, "marca demasiado corta").max(80),
  titulo: z.string().trim().min(4, "titulo demasiado corto").max(120),
  descripcion: z.string().trim().min(10, "descripcion demasiado corta").max(600),
  ciudad: z.string().trim().min(1, "falta la ciudad"),
  categoria: z.string().trim().min(1, "falta la categoria"),
  direccion: z.string().trim().min(2, "falta la direccion").max(160),
  requisitos: z.string().trim().min(1, "falta al menos un requisito"),
  fuente: z.string().trim().optional(),
  imagen: z.string().trim().optional(),
  estado: z.string().trim().optional(),
});

const STATUS_MAP: Record<string, GiftStatus> = {
  active: "active",
  activo: "active",
  inactive: "inactive",
  inactivo: "inactive",
  draft: "draft",
  borrador: "draft",
};

type RawRow = Record<string, string>;

/** Lee la primera hoja del .xlsx y devuelve filas indexadas por header. */
async function readRows(
  buffer: ArrayBuffer,
): Promise<{ row: number; data: RawRow }[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const sheet = workbook.worksheets[0];
  if (!sheet) return [];

  const rows: { row: number; data: RawRow }[] = [];
  let headers: string[] = [];

  sheet.eachRow((row, rowNumber) => {
    const values = (row.values as unknown[])
      .slice(1)
      .map((value) => String(value ?? "").trim());

    if (rowNumber === 1) {
      headers = values.map((header) => header.toLowerCase());
      return;
    }
    if (values.every((value) => value === "")) return; // fila vacía

    const data: RawRow = {};
    headers.forEach((header, index) => {
      data[header] = values[index] ?? "";
    });
    rows.push({ row: rowNumber, data });
  });

  return rows;
}

function findBySlugOrName<T extends { id: string; slug: string; name: string }>(
  catalog: T[],
  value: string,
): T | undefined {
  const needle = value.trim().toLowerCase();
  return catalog.find(
    (item) =>
      item.slug.toLowerCase() === needle ||
      item.name.toLowerCase() === needle,
  );
}

/**
 * Parsea un .xlsx de gifts: valida cada fila, resuelve ciudad/categoría
 * contra los catálogos y arma las filas listas para insertar. Las filas
 * inválidas se reportan en `errors` sin frenar el resto.
 */
export async function parseGiftsExcel(
  buffer: ArrayBuffer,
  cities: Tables<"cities">[],
  categories: Tables<"categories">[],
): Promise<ParseResult> {
  const rawRows = await readRows(buffer);
  const valid: ParsedGiftRow[] = [];
  const errors: ImportRowError[] = [];

  for (const { row, data } of rawRows) {
    const parsed = rowSchema.safeParse(data);
    if (!parsed.success) {
      errors.push({
        row,
        message: parsed.error.issues.map((issue) => issue.message).join("; "),
      });
      continue;
    }
    const value = parsed.data;

    const cityTokens = value.ciudad
      .split(/[;,\n]/)
      .map((token) => token.trim())
      .filter(Boolean);
    const matchedCities = cityTokens.map((token) => ({
      token,
      city: findBySlugOrName(cities, token),
    }));
    const unknownCities = matchedCities
      .filter((match) => !match.city)
      .map((match) => match.token);
    if (cityTokens.length === 0 || unknownCities.length > 0) {
      errors.push({
        row,
        message:
          cityTokens.length === 0
            ? "falta la ciudad"
            : `ciudad(es) desconocida(s): ${unknownCities.join(", ")}`,
      });
      continue;
    }
    const cityIds = Array.from(
      new Set(matchedCities.map((match) => match.city!.id)),
    );
    const category = findBySlugOrName(categories, value.categoria);
    if (!category) {
      errors.push({
        row,
        message: `categoria desconocida: ${value.categoria}`,
      });
      continue;
    }

    const requirements = value.requisitos
      .split(/[;\n]/)
      .map((requirement) => requirement.trim())
      .filter(Boolean);
    if (requirements.length === 0) {
      errors.push({ row, message: "falta al menos un requisito" });
      continue;
    }

    const status = value.estado
      ? STATUS_MAP[value.estado.toLowerCase()]
      : "draft";
    if (!status) {
      errors.push({ row, message: `estado inválido: ${value.estado}` });
      continue;
    }

    valid.push({
      slug: slugify(value.titulo),
      name: value.titulo,
      business_name: value.marca,
      description: value.descripcion,
      requirements,
      address: value.direccion,
      image_url: value.imagen ? value.imagen : null,
      source_url: value.fuente ? value.fuente : null,
      city_ids: cityIds,
      category_id: category.id,
      status,
    });
  }

  return { valid, errors };
}
