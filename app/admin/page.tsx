import type { Metadata } from "next";
import Link from "next/link";
import { logout } from "@/app/admin/actions";
import { AdminLeadTable } from "@/components/AdminLeadTable";
import { AdminLoginForm } from "@/components/AdminLoginForm";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase-server";
import type { Lead } from "@/lib/types";

export const metadata: Metadata = {
  title: "Beheer",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const supabase = await createClient();
  const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  const user = data?.user ?? null;

  if (!user) {
    return (
      <main className="mx-auto max-w-sm px-4 py-16">
        <h1 className="text-3xl font-semibold text-zinc-50">Beheer inloggen</h1>
        <p className="mt-2 text-zinc-400">Alleen voor de beheerder.</p>
        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <AdminLoginForm />
        </div>
      </main>
    );
  }

  let leads: Lead[] = [];
  let leadIdsWithBriefing = new Set<string>();

  if (supabaseAdmin) {
    const { data: leadsData } = await supabaseAdmin
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });
    leads = leadsData ?? [];

    const { data: briefingsData } = await supabaseAdmin
      .from("briefings")
      .select("lead_id")
      .not("lead_id", "is", null);
    leadIdsWithBriefing = new Set((briefingsData ?? []).map((b) => b.lead_id as string));
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-50">Leads</h1>
          <div className="mt-1 flex flex-wrap gap-x-2 text-sm">
            <Link href="/admin/diensten" className="text-zinc-400 underline hover:text-zinc-100">
              Diensten beheren
            </Link>
            <span className="text-zinc-700">·</span>
            <Link href="/admin/content" className="text-zinc-400 underline hover:text-zinc-100">
              Website-tekst beheren
            </Link>
            <span className="text-zinc-700">·</span>
            <Link href="/admin/research" className="text-zinc-400 underline hover:text-zinc-100">
              Research-agent (demo)
            </Link>
          </div>
        </div>
        <form action={logout}>
          <button type="submit" className="text-sm text-zinc-500 hover:text-zinc-200">
            Uitloggen
          </button>
        </form>
      </div>

      <div className="mt-8">
        <AdminLeadTable leads={leads} leadIdsWithBriefing={leadIdsWithBriefing} />
      </div>
    </main>
  );
}
