import { NextResponse } from "next/server";
import { runResearchAgent } from "@/lib/agents/research-agent";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase-server";

// Tool-loop + twee LLM-calls kunnen langer duren dan Next's default van 10s.
export const maxDuration = 60;

// Admin-only: dit endpoint triggert dezelfde betaalde agent-calls als de enrichment-agent, dus
// nooit publiek bereikbaar maken. Gebruikt voor de standalone research-demo op /admin/research.
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  if (!data?.user || !supabaseAdmin) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { companyName?: string; domain?: string } | null;
  const domain = body?.domain?.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");

  if (!domain) {
    return NextResponse.json({ error: "Vul een domein in." }, { status: 400 });
  }

  try {
    const result = await runResearchAgent({
      companyName: body?.companyName?.trim() || domain,
      domain,
      leadId: null,
    });

    const { data: briefing, error } = await supabaseAdmin
      .from("briefings")
      .select("*, companies(*)")
      .eq("id", result.briefingId)
      .single();

    if (error || !briefing) {
      return NextResponse.json({ error: "Briefing opgeslagen, maar kon niet worden opgehaald." }, { status: 500 });
    }

    return NextResponse.json({ briefing, company: briefing.companies }, { status: 201 });
  } catch (error) {
    console.error("Research-agent mislukt:", error);
    return NextResponse.json({ error: "De research-agent is mislukt. Zie agent_runs voor details." }, { status: 500 });
  }
}
