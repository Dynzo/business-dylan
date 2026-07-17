import { anthropic } from "@ai-sdk/anthropic";
import { generateObject, generateText } from "ai";
import { logAgentRun } from "@/lib/agents/agent-log";
import { briefingContentSchema } from "@/lib/agents/schema";
import { detectTech } from "@/lib/agents/tools/detect-tech";
import { fetchSiteContent } from "@/lib/agents/tools/fetch-site";
import { webSearch } from "@/lib/agents/tools/web-search";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { BriefingContent } from "@/lib/types";

// Goedkoop model voor de tussenstap (ruw materiaal samenvatten), sterker model voor de synthese.
const HAIKU = anthropic("claude-haiku-4-5-20251001");
const SONNET = anthropic("claude-sonnet-5");

export type RunResearchParams = {
  companyName: string;
  domain: string;
  leadId?: string | null;
};

export type RunResearchResult = {
  briefingId: string;
  companyId: string;
  content: BriefingContent;
};

// Kern-agent: bedrijf/domein in, gestructureerde briefing uit. Cachet het resultaat in
// `companies` (keyed op domain) en slaat de briefing op in `briefings`. Wordt zowel door de
// enrichment-agent (nieuwe lead) als door de standalone demo (/admin/research) aangeroepen.
export async function runResearchAgent(params: RunResearchParams): Promise<RunResearchResult> {
  if (!supabaseAdmin) {
    throw new Error("Supabase admin is niet geconfigureerd — kan geen research uitvoeren.");
  }

  try {
    const [searchResults, siteContent, techSignals] = await Promise.all([
      webSearch(`${params.companyName} ${params.domain} bedrijf nieuws vacatures`),
      fetchSiteContent(`https://${params.domain}`),
      detectTech(params.domain),
    ]);

    const { text: condensed } = await generateText({
      model: HAIKU,
      prompt: `Vat het volgende onderzoeksmateriaal over ${params.companyName} (${params.domain}) samen in maximaal 300 woorden. Focus op: wat het bedrijf doet, sector, geschatte omvang, en relevant nieuws of vacatures (met name data/AI-vacatures).

Zoekresultaten:
${searchResults.map((r) => `- ${r.title}: ${r.content}`).join("\n") || "Geen zoekresultaten gevonden."}

Website-inhoud:
${(siteContent ?? "Kon niet worden opgehaald.").slice(0, 4000)}`,
    });

    const { object, usage } = await generateObject({
      model: SONNET,
      schema: briefingContentSchema,
      prompt: `Je bent een technisch consultant (diensten: Web, Data, AI/agents) die een prospect onderzoekt vóór een salesgesprek.

Bedrijf: ${params.companyName} (${params.domain})

Samengevat onderzoeksmateriaal:
${condensed}

Technische signalen van de website:
${techSignals.join("\n")}

Schrijf een gestructureerde briefing. Wees concreet en to-the-point, geen vage marketingtaal. De
"angle" moet expliciet benoemen hoe de Web-, Data- en/of AI-pijler hier zouden passen, gebaseerd
op wat daadwerkelijk gevonden is — als iets niet duidelijk is, zeg dat, verzin niets.`,
    });

    const { data: company, error: companyError } = await supabaseAdmin
      .from("companies")
      .upsert(
        {
          domain: params.domain,
          name: params.companyName,
          sector: object.sector,
          size_estimate: object.size_estimate,
          summary: object.summary,
          website_quality: object.website_quality,
          tech_signals: object.tech_signals,
          news: object.news_signals,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "domain" }
      )
      .select()
      .single();

    if (companyError || !company) {
      throw new Error(`Kon company niet opslaan: ${companyError?.message}`);
    }

    const { data: briefing, error: briefingError } = await supabaseAdmin
      .from("briefings")
      .insert({
        lead_id: params.leadId ?? null,
        company_id: company.id,
        content: object,
        angle: object.angle,
        draft_reply: "",
        model_used: "claude-sonnet-5",
      })
      .select()
      .single();

    if (briefingError || !briefing) {
      throw new Error(`Kon briefing niet opslaan: ${briefingError?.message}`);
    }

    await logAgentRun({
      agent: "research",
      input: { companyName: params.companyName, domain: params.domain, leadId: params.leadId ?? null },
      status: "success",
      tokens: usage.totalTokens ?? null,
    });

    return { briefingId: briefing.id, companyId: company.id, content: object as BriefingContent };
  } catch (error) {
    await logAgentRun({
      agent: "research",
      input: { companyName: params.companyName, domain: params.domain, leadId: params.leadId ?? null },
      status: "error",
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
