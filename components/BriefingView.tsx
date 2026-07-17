import type { Briefing, Company } from "@/lib/types";

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 print:border-zinc-300 print:bg-white">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400 print:text-zinc-600">
        {title}
      </h3>
      <div className="mt-2 text-zinc-200 print:text-black">{children}</div>
    </div>
  );
}

export function BriefingView({ briefing, company }: { briefing: Briefing; company: Company }) {
  const { content } = briefing;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-zinc-800 pb-4 print:border-zinc-300">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-50 print:text-black">
            {company.name || company.domain}
          </h2>
          <p className="text-sm text-zinc-500 print:text-zinc-600">{company.domain}</p>
        </div>
        <p className="text-xs text-zinc-500 print:text-zinc-600">
          Bijgewerkt: {new Date(company.updated_at).toLocaleDateString("nl-NL")}
        </p>
      </div>

      <Block title="Samenvatting">
        <p className="whitespace-pre-line">{content.summary || "—"}</p>
      </Block>

      <div className="grid gap-4 sm:grid-cols-2">
        <Block title="Sector & omvang">
          <p>{content.sector || "—"}</p>
          <p className="mt-1 text-zinc-400 print:text-zinc-600">{content.size_estimate || "—"}</p>
        </Block>
        <Block title="Kwaliteit online aanwezigheid (Web-kans)">
          <p>{content.website_quality || "—"}</p>
        </Block>
      </div>

      <Block title="Tech-/datasignalen (Data-kans)">
        {content.tech_signals.length > 0 ? (
          <ul className="flex flex-col gap-1">
            {content.tech_signals.map((signal) => (
              <li key={signal} className="flex gap-2">
                <span className="text-zinc-600">—</span>
                <span>{signal}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-zinc-500">Geen signalen gevonden.</p>
        )}
      </Block>

      <Block title="Nieuws & vacatures">
        {content.news_signals.length > 0 ? (
          <ul className="flex flex-col gap-1">
            {content.news_signals.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-zinc-600">—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-zinc-500">Niets gevonden.</p>
        )}
      </Block>

      <Block title="Angle — hoe Web / Data / AI hier passen">
        <p className="font-medium whitespace-pre-line">{briefing.angle || content.angle || "—"}</p>
      </Block>

      {briefing.draft_reply && (
        <Block title="Concept-antwoordmail">
          <p className="whitespace-pre-line font-mono text-sm">{briefing.draft_reply}</p>
        </Block>
      )}

      <p className="text-xs text-zinc-600 print:text-zinc-500">
        Model: {briefing.model_used || "onbekend"} · Gegenereerd:{" "}
        {new Date(briefing.created_at).toLocaleString("nl-NL")}
      </p>
    </div>
  );
}
