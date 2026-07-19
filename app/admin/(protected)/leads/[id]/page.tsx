import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { archiveLead, sendLeadReply } from "@/app/admin/actions";
import { BriefingView } from "@/components/BriefingView";
import { PrintButton } from "@/components/PrintButton";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { Briefing, Company, Lead } from "@/lib/types";

export const metadata: Metadata = {
  title: "Lead",
  robots: { index: false, follow: false },
};

export default async function AdminLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!supabaseAdmin) notFound();

  const { data: lead } = await supabaseAdmin.from("leads").select("*").eq("id", id).single();
  if (!lead) notFound();

  const { data: briefing } = await supabaseAdmin
    .from("briefings")
    .select("*, companies(*)")
    .eq("lead_id", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const typedLead = lead as Lead;
  const typedBriefing = (briefing as (Briefing & { companies: Company | null }) | null) ?? null;

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 print:max-w-none">
      <Link
        href="/admin"
        className="print:hidden text-sm text-zinc-400 underline hover:text-zinc-100"
      >
        ← Terug naar leads
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-50 print:text-black">{typedLead.name}</h1>
          <p className="text-zinc-400 print:text-zinc-700">{typedLead.email}</p>
          {typedLead.company && <p className="text-zinc-400 print:text-zinc-700">{typedLead.company}</p>}
        </div>
        <div className="print:hidden flex items-center gap-3">
          {typedLead.status !== "archived" && (
            <form
              action={async () => {
                "use server";
                await archiveLead(id);
              }}
            >
              <button
                type="submit"
                className="rounded-lg border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-800"
              >
                Archiveren
              </button>
            </form>
          )}
          {typedBriefing && <PrintButton />}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 print:hidden">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Bericht</h2>
        <p className="mt-2 whitespace-pre-line text-zinc-200">{typedLead.message}</p>
        <p className="mt-3 text-xs text-zinc-500">
          Binnengekomen: {new Date(typedLead.created_at).toLocaleString("nl-NL")}
        </p>
      </div>

      <div className="mt-8">
        {typedBriefing && typedBriefing.companies ? (
          <BriefingView briefing={typedBriefing} company={typedBriefing.companies} />
        ) : (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 text-zinc-400">
            {typedLead.company_domain
              ? "Er is nog geen briefing voor deze lead — de enrichment-agent kan zijn overgeslagen of gefaald. Zie agent_runs voor details."
              : "Geen bedrijfsdomein bekend bij deze lead — er is bewust geen research uitgevoerd."}
          </div>
        )}
      </div>

      {typedBriefing && (
        <div className="print:hidden mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h2 className="text-lg font-semibold text-zinc-100">Antwoord versturen</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Concept van de enrichment-agent — controleer en bewerk voordat je verstuurt. Er wordt
            nooit automatisch gemaild.
          </p>
          <form
            action={async (formData) => {
              "use server";
              await sendLeadReply(id, formData);
            }}
            className="mt-4 flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1">
              <label htmlFor="subject" className="text-sm font-medium text-zinc-300">
                Onderwerp
              </label>
              <input
                id="subject"
                name="subject"
                type="text"
                defaultValue={`Re: je bericht${typedLead.company ? ` — ${typedLead.company}` : ""}`}
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-700"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="body" className="text-sm font-medium text-zinc-300">
                Bericht
              </label>
              <textarea
                id="body"
                name="body"
                rows={10}
                defaultValue={typedBriefing.draft_reply}
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-700"
              />
            </div>
            <button
              type="submit"
              className="btn-shine self-start rounded-full bg-zinc-100 px-6 py-3 font-semibold text-zinc-950 transition-transform duration-300 hover:-translate-y-0.5 hover:bg-white"
            >
              Versturen
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
