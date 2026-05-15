import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { GiftImportForm } from "@/components/admin/gift-import-form";

const columns = [
  { name: "marca", note: "Local o marca. Requerido." },
  { name: "titulo", note: "Qué regalan. Requerido." },
  { name: "descripcion", note: "Detalle del regalito. Requerido." },
  { name: "ciudad", note: "Nombre o slug de una ciudad existente. Requerido." },
  {
    name: "categoria",
    note: "Nombre o slug de una categoría existente. Requerido.",
  },
  { name: "direccion", note: "Dirección o 'Todas las sucursales'. Requerido." },
  {
    name: "requisitos",
    note: "Uno o varios, separados por ';' o saltos de línea. Requerido.",
  },
  { name: "fuente", note: "URL donde se confirma la promo. Opcional." },
  { name: "imagen", note: "URL de la imagen de marca. Opcional." },
  {
    name: "estado",
    note: "active / inactive / draft (o activo / inactivo / borrador). Opcional, default draft.",
  },
];

export default function ImportGiftsPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <Link
        href="/admin/regalos"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver a regalitos
      </Link>

      <h1 className="mt-6 text-3xl font-bold tracking-tight">
        Importar desde Excel
      </h1>
      <p className="mt-2 text-muted-foreground">
        Subí un archivo <code>.xlsx</code>. La primera fila tiene que tener los
        nombres de las columnas. Las filas inválidas se omiten y te avisamos
        cuáles.
      </p>

      <div className="mt-6 overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-4 py-2 font-medium">Columna</th>
              <th className="px-4 py-2 font-medium">Detalle</th>
            </tr>
          </thead>
          <tbody>
            {columns.map((column) => (
              <tr key={column.name} className="border-b border-border last:border-0">
                <td className="px-4 py-2 font-mono text-xs">{column.name}</td>
                <td className="px-4 py-2 text-muted-foreground">
                  {column.note}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8">
        <GiftImportForm />
      </div>
    </main>
  );
}
