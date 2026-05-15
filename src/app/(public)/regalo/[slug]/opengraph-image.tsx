import { ImageResponse } from "next/og";

import { getGiftBySlug } from "@/lib/gifts/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const alt = "regalito — regalos de cumpleaños en Argentina";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const gift = await getGiftBySlug(supabase, slug);

  const businessName = gift?.business_name ?? "regalito";
  const name = gift?.name ?? "Regalos de cumpleaños en Argentina";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 40, fontWeight: 700 }}>regalito</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 34, opacity: 0.9 }}>{businessName}</div>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.1 }}>
            {name}
          </div>
        </div>
        <div style={{ fontSize: 30, opacity: 0.9 }}>
          Cobrate un regalito en tu cumple
        </div>
      </div>
    ),
    size,
  );
}
