const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export const isTurnstileConfigured = Boolean(process.env.TURNSTILE_SECRET_KEY);

// CAPTCHA-check tegen bot-spam op /api/leads. Zonder secret key wordt de check overgeslagen (met
// een duidelijke waarschuwing) zodat lokale ontwikkeling niet blokkeert — dit MOET in productie
// geconfigureerd zijn, anders is er geen bot-bescherming op het contactformulier.
export async function verifyTurnstileToken(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn("Turnstile is niet geconfigureerd — CAPTCHA-check overgeslagen.");
    return true;
  }

  if (!token) return false;

  try {
    const response = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    });

    if (!response.ok) return false;
    const data = (await response.json()) as { success?: boolean };
    return data.success === true;
  } catch (error) {
    console.error("Turnstile-verificatie mislukt:", error);
    return false;
  }
}
