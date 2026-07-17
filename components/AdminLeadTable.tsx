import Link from "next/link";
import type { Lead, LeadStatus } from "@/lib/types";

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "Nieuw",
  researching: "Onderzoek loopt",
  qualified: "Briefing klaar",
  contacted: "Benaderd",
  archived: "Gearchiveerd",
};

const STATUS_STYLES: Record<LeadStatus, string> = {
  new: "bg-blue-500/10 text-blue-300",
  researching: "bg-amber-500/10 text-amber-300",
  qualified: "bg-emerald-500/10 text-emerald-300",
  contacted: "bg-zinc-500/10 text-zinc-300",
  archived: "bg-zinc-800 text-zinc-500",
};

export function AdminLeadTable({
  leads,
  leadIdsWithBriefing,
}: {
  leads: Lead[];
  leadIdsWithBriefing: Set<string>;
}) {
  if (leads.length === 0) {
    return <p className="text-zinc-400">Nog geen leads.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/60">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-zinc-800 text-zinc-400">
          <tr>
            <th className="px-4 py-3">Datum</th>
            <th className="px-4 py-3">Naam / bedrijf</th>
            <th className="px-4 py-3">E-mail</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Briefing</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="border-t border-zinc-800 transition-colors hover:bg-zinc-900">
              <td className="px-4 py-3 text-zinc-400">
                {new Date(lead.created_at).toLocaleDateString("nl-NL")}
              </td>
              <td className="px-4 py-3">
                <div className="text-zinc-100">{lead.name}</div>
                {lead.company && <div className="text-xs text-zinc-500">{lead.company}</div>}
              </td>
              <td className="px-4 py-3 text-zinc-400">{lead.email}</td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[lead.status]}`}>
                  {STATUS_LABELS[lead.status]}
                </span>
              </td>
              <td className="px-4 py-3 text-zinc-400">
                {leadIdsWithBriefing.has(lead.id) ? "✓" : "—"}
              </td>
              <td className="px-4 py-3">
                <Link href={`/admin/leads/${lead.id}`} className="text-zinc-300 underline hover:text-white">
                  Bekijken
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
