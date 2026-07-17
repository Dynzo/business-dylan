import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { logAgentRun } from "@/lib/agents/agent-log";
import { runResearchAgent } from "@/lib/agents/research-agent";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Generieke consumer-mailproviders — bij deze domeinen is er niets bedrijfsniveau te onderzoeken,
// en zou research op een persoonlijk mailadres uitgevoerd worden. AVG-bewust: geen research zonder
// een herkenbaar bedrijfsdomein.
const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "hotmail.com",
  "hotmail.nl",
  "outlook.com",
  "outlook.nl",
  "live.com",
  "live.nl",
  "yahoo.com",
  "yahoo.nl",
  "icloud.com",
  "me.com",
  "protonmail.com",
  "proton.me",
  "aol.com",
  "gmx.com",
  "gmx.net",
  "ziggo.nl",
  "kpnmail.nl",
  "telfort.nl",
  "planet.nl",
  "home.nl",
]);

export function extractCompanyDomain(email: string): string | null {
  const domain = email.split("@")[1]?.toLowerCase().trim();
  if (!domain || FREE_EMAIL_DOMAINS.has(domain)) return null;
  return domain;
}

export type EnrichmentLead = {
  id: string;
  name: string;
  email: string;
  company: string;
};

// Hard backstop tegen kostenmisbruik: /api/leads is een publiek, ongeauthenticeerd endpoint. Deze
// cap begrenst de schade als iemand het formulier spamt, los van de rate-limit op /api/leads zelf.
// TODO(later): enrichment loskoppelen van het publieke request-pad (bv. Vercel Cron met eigen
// batch-cap, of alleen handmatig via /admin) i.p.v. deze twee guardrails.
const ENRICHMENT_DAILY_CAP = Number(process.env.ENRICHMENT_DAILY_CAP ?? 25);

async function dailyEnrichmentCapReached(): Promise<boolean> {
  if (!supabaseAdmin) return true;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { count } = await supabaseAdmin
    .from("agent_runs")
    .select("id", { count: "exact", head: true })
    .eq("agent", "enrichment")
    .gte("created_at", startOfDay.toISOString());

  return (count ?? 0) >= ENRICHMENT_DAILY_CAP;
}

// Best-effort: draait na het opslaan van de lead. Een fout hier mag de lead-flow nooit breken —
// de aanroeper (app/api/leads/route.ts) vangt fouten af en logt, maar laat de lead altijd staan.
export async function runEnrichmentAgent(lead: EnrichmentLead) {
  const domain = extractCompanyDomain(lead.email);
  if (!domain) return null;
  if (!supabaseAdmin) return null;

  if (await dailyEnrichmentCapReached()) {
    console.warn(`Dagelijkse cap voor enrichment-agent bereikt (${ENRICHMENT_DAILY_CAP}) — overgeslagen.`);
    await logAgentRun({
      agent: "enrichment",
      input: { leadId: lead.id, domain },
      status: "error",
      error: `Dagelijkse cap bereikt (${ENRICHMENT_DAILY_CAP}) — overgeslagen.`,
    });
    return null;
  }

  try {
    const research = await runResearchAgent({
      companyName: lead.company || domain,
      domain,
      leadId: lead.id,
    });

    const { text: draftReplyRaw, usage } = await generateText({
      model: anthropic("claude-sonnet-5"),
      prompt: `Schrijf een korte, persoonlijke concept-antwoordmail (Nederlands, informeel-professioneel, maximaal 150 woorden) aan ${lead.name}, die net een bericht stuurde. Verwijs kort naar hun bedrijf (${lead.company || domain}) en naar precies één concreet punt uit de onderstaande briefing, zonder opdringerig te zijn. Sluit af met een voorstel voor een kort, vrijblijvend gesprek. Geen onderwerpregel, alleen de mailtekst, geen aanhef-plaatshouders.

Briefing:
${JSON.stringify(research.content, null, 2)}`,
    });

    const draftReply = draftReplyRaw.trim();

    await supabaseAdmin.from("briefings").update({ draft_reply: draftReply }).eq("id", research.briefingId);
    await supabaseAdmin.from("leads").update({ status: "qualified" }).eq("id", lead.id);

    await logAgentRun({
      agent: "enrichment",
      input: { leadId: lead.id, domain },
      status: "success",
      tokens: usage.totalTokens ?? null,
    });

    return research;
  } catch (error) {
    console.error("Enrichment-agent mislukt:", error);
    await logAgentRun({
      agent: "enrichment",
      input: { leadId: lead.id, domain },
      status: "error",
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}
