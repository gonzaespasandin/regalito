import { BirthdayBanner } from "@/components/profile/birthday-banner";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth/user";

/** Layout de la parte pública del sitio: header + footer de marca. */
export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const current = await getCurrentUser();
  const showBirthdayBanner = Boolean(current && !current.profile.birthday);

  return (
    <>
      {showBirthdayBanner ? <BirthdayBanner /> : null}
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
