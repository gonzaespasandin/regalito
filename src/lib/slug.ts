/**
 * Normaliza un texto a kebab-case sin acentos, apto para usar en una URL.
 * Ej: "Bebida gratis en tu cumple" -> "bebida-gratis-en-tu-cumple".
 */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Mn}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
