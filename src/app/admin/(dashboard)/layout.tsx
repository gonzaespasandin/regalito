import type { Metadata } from "next";

import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Panel — regalito",
  robots: { index: false },
};

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Guard: redirige a /admin/login si no hay una sesión válida.
  // /admin/login vive fuera de este route group.
  const email = await requireAdmin();

  return (
    <>
      <AdminNav email={email} />
      <div className="flex-1 bg-background">{children}</div>
    </>
  );
}
