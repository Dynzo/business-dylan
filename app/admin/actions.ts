"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sendEmail } from "@/lib/email";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase-server";
import type { LeadStatus } from "@/lib/types";

// Gooit als er geen ingelogde beheerder is; anders niets (supabaseAdmin is dan altijd beschikbaar
// zodra dit process draait, want zonder secret key kan de admin-omgeving niet functioneren).
async function requireAdmin() {
  const supabase = await createClient();
  const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  if (!data?.user || !supabaseAdmin) {
    throw new Error("Niet ingelogd.");
  }
}

export async function login(
  _prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return "Vul e-mailadres en wachtwoord in.";
  }

  const supabase = await createClient();
  if (!supabase) return "Supabase is niet geconfigureerd.";

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return "Inloggen mislukt. Controleer je e-mailadres en wachtwoord.";

  redirect("/admin");
}

export async function logout() {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/admin");
}

// === Leads ====================================================================================

function revalidateLeadPaths(id: string) {
  revalidatePath("/admin");
  revalidatePath(`/admin/leads/${id}`);
}

export async function updateLeadStatus(id: string, status: LeadStatus) {
  await requireAdmin();

  const { error } = await supabaseAdmin!.from("leads").update({ status }).eq("id", id);
  if (error) throw new Error("Kon de status niet bijwerken.");

  revalidateLeadPaths(id);
}

// Verstuurt de (eventueel bewerkte) concept-antwoordmail. Nooit automatisch — een mens keurt hier
// altijd eerst de tekst goed voordat er iets de deur uit gaat.
export async function sendLeadReply(id: string, formData: FormData) {
  await requireAdmin();

  const subject = formData.get("subject");
  const body = formData.get("body");
  if (typeof subject !== "string" || !subject.trim()) {
    throw new Error("Vul een onderwerp in.");
  }
  if (typeof body !== "string" || !body.trim()) {
    throw new Error("Vul een berichttekst in.");
  }

  const { data: lead, error } = await supabaseAdmin!
    .from("leads")
    .select("email")
    .eq("id", id)
    .single();

  if (error || !lead) throw new Error("Lead niet gevonden.");

  await sendEmail({
    to: lead.email,
    subject: subject.trim(),
    html: `<div style="font-family: sans-serif; color: #1a1a1a; white-space: pre-line;">${body.trim()}</div>`,
  });

  await supabaseAdmin!.from("leads").update({ status: "contacted" }).eq("id", id);
  revalidateLeadPaths(id);
}

// === Diensten (pillars/services) ==============================================================

function serviceFieldsFromForm(formData: FormData) {
  const pillarId = formData.get("pillar_id");
  const name = formData.get("name");
  const description = formData.get("description");
  const includesRaw = formData.get("includes");
  const priceLabel = formData.get("price_label");
  const ctaLabel = formData.get("cta_label");
  const orderIndex = Number(formData.get("order_index"));

  if (typeof pillarId !== "string" || !pillarId) {
    throw new Error("Kies een pijler.");
  }
  if (typeof name !== "string" || !name.trim()) {
    throw new Error("Vul een naam in.");
  }

  const includes =
    typeof includesRaw === "string"
      ? includesRaw
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
      : [];

  return {
    pillar_id: pillarId,
    name: name.trim(),
    description: typeof description === "string" ? description.trim() : "",
    includes,
    price_label: typeof priceLabel === "string" ? priceLabel.trim() : "",
    cta_label: typeof ctaLabel === "string" && ctaLabel.trim() ? ctaLabel.trim() : "Neem contact op",
    order_index: Number.isInteger(orderIndex) ? orderIndex : 0,
    active: formData.get("active") === "on",
  };
}

function revalidateServicePaths() {
  revalidatePath("/admin/diensten");
  revalidatePath("/");
  revalidatePath("/diensten");
}

export async function addService(formData: FormData) {
  await requireAdmin();
  const fields = serviceFieldsFromForm(formData);

  const { error } = await supabaseAdmin!.from("services").insert(fields);
  if (error) throw new Error("Kon de dienst niet toevoegen.");

  revalidateServicePaths();
}

export async function updateService(id: string, formData: FormData) {
  await requireAdmin();
  const fields = serviceFieldsFromForm(formData);

  const { error } = await supabaseAdmin!.from("services").update(fields).eq("id", id);
  if (error) throw new Error("Kon de dienst niet bijwerken.");

  revalidateServicePaths();
  redirect("/admin/diensten");
}

export async function deleteService(id: string) {
  await requireAdmin();
  await supabaseAdmin!.from("services").delete().eq("id", id);
  revalidateServicePaths();
}

// === Site-content ==============================================================================

export async function updateSiteContent(formData: FormData) {
  await requireAdmin();

  const updates = Array.from(formData.entries())
    .filter(([, value]) => typeof value === "string")
    .map(([key, value]) => ({ key, value: (value as string).trim() }));

  if (updates.length === 0) return;

  const { error } = await supabaseAdmin!.from("site_content").upsert(updates, {
    onConflict: "key",
  });
  if (error) throw new Error("Kon de tekst niet opslaan.");

  revalidatePath("/admin/content");
  revalidatePath("/");
  revalidatePath("/privacybeleid");
}
