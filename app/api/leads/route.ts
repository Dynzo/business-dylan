import { NextResponse } from "next/server";
import { extractCompanyDomain, runEnrichmentAgent } from "@/lib/agents/enrichment-agent";
import { adminNewLeadEmail, leadConfirmationEmail } from "@/lib/email-templates";
import { getAdminEmail, sendEmail } from "@/lib/email";
import { getSiteContent } from "@/lib/site-content";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyTurnstileToken } from "@/lib/turnstile";
import type { LeadInput } from "@/lib/types";

// De tool-loop + twee LLM-calls van de enrichment-agent kunnen langer duren dan Next's default
// van 10s. Controleer bij het live zetten of je Vercel-plan maxDuration tot 60s toestaat.
export const maxDuration = 60;

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

function validate(body: Partial<LeadInput>): string | null {
  if (!body.name?.trim()) return "Vul je naam in.";
  if (!body.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return "Vul een geldig e-mailadres in.";
  }
  if (!body.message?.trim()) return "Vul een bericht in.";
  return null;
}

export async function POST(request: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Supabase is nog niet gekoppeld op de server." },
      { status: 503 }
    );
  }

  const body = (await request.json().catch(() => null)) as Partial<LeadInput> | null;
  if (!body) {
    return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 });
  }

  const validationError = validate(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const ip = getClientIp(request);

  // Laag 1: CAPTCHA — stopt scripted/bot-misbruik aan de bron, vóór er iets in de database komt.
  const isHuman = await verifyTurnstileToken(body.turnstileToken ?? "", ip);
  if (!isHuman) {
    return NextResponse.json(
      { error: "Verificatie mislukt. Herlaad de pagina en probeer het opnieuw." },
      { status: 403 }
    );
  }

  // Laag 2: rate-limits als backstop tegen wat de CAPTCHA toch doorlaat (bv. een menselijke
  // spammer). Per e-mail én per IP, zodat het ene niet het andere kan omzeilen. Zie ook
  // ENRICHMENT_DAILY_CAP in lib/agents/enrichment-agent.ts voor de backstop op agent-niveau.
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { count: recentByEmail } = await supabaseAdmin
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("email", (body.email as string).trim())
    .gte("created_at", oneDayAgo);

  if ((recentByEmail ?? 0) >= 3) {
    return NextResponse.json(
      { error: "Je hebt al meerdere berichten gestuurd. We nemen zo snel mogelijk contact op." },
      { status: 429 }
    );
  }

  if (ip !== "unknown") {
    const { count: recentByIp } = await supabaseAdmin
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("ip_address", ip)
      .gte("created_at", oneHourAgo);

    if ((recentByIp ?? 0) >= 5) {
      return NextResponse.json(
        { error: "Te veel berichten vanaf dit netwerk. Probeer het later opnieuw." },
        { status: 429 }
      );
    }
  }

  const companyDomain = extractCompanyDomain(body.email as string) ?? "";

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from("leads")
    .insert({
      name: (body.name as string).trim(),
      email: (body.email as string).trim(),
      company: body.company?.trim() ?? "",
      company_domain: companyDomain,
      message: (body.message as string).trim(),
      source: "contact-form",
      status: "new",
      ip_address: ip,
    })
    .select()
    .single();

  if (insertError || !inserted) {
    console.error("Kon lead niet opslaan:", insertError?.message);
    return NextResponse.json(
      { error: "Er ging iets mis bij het opslaan. Probeer het opnieuw." },
      { status: 500 }
    );
  }

  const emailData = {
    id: inserted.id as string,
    name: inserted.name as string,
    email: inserted.email as string,
    company: (inserted.company as string) ?? "",
    message: inserted.message as string,
  };

  // Best-effort: draait vóór de admin-mail zodat die kan melden of er al een briefing is. Een
  // falende of overgeslagen agent mag de lead-flow nooit blokkeren.
  const research = companyDomain
    ? await runEnrichmentAgent({
        id: emailData.id,
        name: emailData.name,
        email: emailData.email,
        company: emailData.company,
      })
    : null;

  const content = await getSiteContent();
  const confirmation = leadConfirmationEmail(emailData, content);
  await sendEmail({ to: emailData.email, ...confirmation });

  const adminEmail = getAdminEmail();
  if (adminEmail) {
    const notification = adminNewLeadEmail(emailData, { hasBriefing: Boolean(research) });
    await sendEmail({ to: adminEmail, ...notification });
  }

  return NextResponse.json({ id: inserted.id }, { status: 201 });
}
