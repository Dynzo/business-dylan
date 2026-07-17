import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;

export const isEmailConfigured = Boolean(resendApiKey);
export const isAdminEmailConfigured = Boolean(adminEmail);

const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendEmail(params: { to: string; subject: string; html: string }) {
  if (!resend) {
    console.warn("Resend is niet geconfigureerd — e-mail niet verstuurd:", params.subject);
    return;
  }

  const { error } = await resend.emails.send({
    from: fromEmail,
    to: params.to,
    subject: params.subject,
    html: params.html,
  });

  if (error) {
    console.error("Versturen van e-mail mislukt:", error.message);
  }
}

export function getAdminEmail(): string | null {
  return adminEmail ?? null;
}
