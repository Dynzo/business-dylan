import type { SiteContentKey } from "@/lib/site-content";

type SiteContent = Record<SiteContentKey, string>;

type LeadEmailData = {
  id: string;
  name: string;
  email: string;
  company: string;
  message: string;
};

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

function detailsTable(data: LeadEmailData): string {
  return `
    <table style="border-collapse: collapse;">
      <tr><td style="padding: 4px 12px 4px 0; color: #666;">Naam</td><td>${data.name}</td></tr>
      <tr><td style="padding: 4px 12px 4px 0; color: #666;">E-mail</td><td>${data.email}</td></tr>
      ${data.company ? `<tr><td style="padding: 4px 12px 4px 0; color: #666;">Bedrijf</td><td>${data.company}</td></tr>` : ""}
      <tr><td style="padding: 4px 12px 4px 0; color: #666; vertical-align: top;">Bericht</td><td style="white-space: pre-line;">${data.message}</td></tr>
    </table>
  `;
}

export function leadConfirmationEmail(
  data: LeadEmailData,
  content: SiteContent
): { subject: string; html: string } {
  return {
    subject: content.email_lead_confirmation_subject,
    html: `
      <div style="font-family: sans-serif; color: #1a1a1a;">
        <h2>Bedankt voor je bericht, ${data.name}!</h2>
        <p>${content.email_lead_confirmation_intro}</p>
        ${detailsTable(data)}
        <p style="margin-top: 16px; color: #666; font-size: 14px;">Referentienummer: ${data.id}</p>
      </div>
    `,
  };
}

export function adminNewLeadEmail(
  data: LeadEmailData,
  opts: { hasBriefing: boolean }
): { subject: string; html: string } {
  return {
    subject: `Nieuwe lead: ${data.company || data.name}`,
    html: `
      <div style="font-family: sans-serif; color: #1a1a1a;">
        <h2>Nieuwe lead binnengekomen</h2>
        ${detailsTable(data)}
        <p style="margin-top: 16px;">
          ${
            opts.hasBriefing
              ? "De research-agent heeft al een briefing klaargezet."
              : "Er is (nog) geen briefing beschikbaar voor deze lead."
          }
          Bekijk de lead in het beheerpaneel:
        </p>
        <p><a href="${siteUrl}/admin/leads/${data.id}">${siteUrl}/admin/leads/${data.id}</a></p>
      </div>
    `,
  };
}
