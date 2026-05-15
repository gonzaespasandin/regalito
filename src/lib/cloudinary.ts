import "server-only";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const GIFTS_FOLDER = "regalito/gifts";

/**
 * Sube una imagen de marca a Cloudinary y devuelve su `secure_url`.
 * Convierte el File a data URI porque el SDK no recibe File directamente.
 */
export async function uploadGiftImage(file: File): Promise<string> {
  const bytes = Buffer.from(await file.arrayBuffer());
  const dataUri = `data:${file.type};base64,${bytes.toString("base64")}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: GIFTS_FOLDER,
    resource_type: "image",
  });

  return result.secure_url;
}

/**
 * Inserta `f_auto,q_auto` en una URL de Cloudinary para que sirva el formato
 * y la calidad óptimos. El resize y el cache los hace `next/image`.
 */
export function optimizedImageUrl(url: string): string {
  if (!url.includes("/upload/")) return url;
  return url.replace("/upload/", "/upload/f_auto,q_auto/");
}
