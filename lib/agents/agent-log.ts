import { supabaseAdmin } from "@/lib/supabase-admin";
import type { AgentName, AgentRunStatus } from "@/lib/types";

// cost_estimate blijft leeg totdat de actuele Anthropic-tarieven bevestigd zijn — tokens zijn wel
// exact (rechtstreeks van de AI SDK), dus die geven al een bruikbaar beeld voor kostenbeheer.
export async function logAgentRun(params: {
  agent: AgentName;
  input: Record<string, unknown>;
  status: AgentRunStatus;
  tokens?: number | null;
  error?: string | null;
}) {
  if (!supabaseAdmin) return;

  const { error } = await supabaseAdmin.from("agent_runs").insert({
    agent: params.agent,
    input: params.input,
    status: params.status,
    tokens: params.tokens ?? null,
    error: params.error ?? null,
  });

  if (error) {
    console.error("Kon agent_run niet loggen:", error.message);
  }
}
