import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";

// Centrale sessie-guard voor alles onder /admin behalve /admin zelf (die toont het inlogformulier
// inline in plaats van te redirecten). Voorkomt dat elke subpagina de auth-check moet herhalen.
export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  if (!data?.user) {
    redirect("/admin");
  }

  return <>{children}</>;
}
