import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ProfileForm } from "@/components/profile/profile-form";
import { getCurrentUser } from "@/lib/auth/user";

export const metadata: Metadata = {
  title: "Mi perfil — regalito",
};

export default async function PerfilPage() {
  const current = await getCurrentUser();
  if (!current) redirect("/");

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Mi perfil</h1>
        <p className="text-muted-foreground">
          Completá tu cumpleaños para que te avisemos de los regalitos que
          podés cobrar.
        </p>
      </header>

      <div className="mt-10">
        <ProfileForm profile={current.profile} />
      </div>
    </main>
  );
}
