// Directe fetch van de homepage (geen Tavily nodig) om een paar concrete, verifieerbare
// tech-signalen te detecteren — input voor de Data-kans in de briefing. Bewust een korte lijst
// van simpele, betrouwbare signalen i.p.v. een uitgebreide tech-stack-detector.
export async function detectTech(domain: string): Promise<string[]> {
  const signals: string[] = [];
  const url = `https://${domain}`;

  let html: string;
  let finalUrl: string;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; research-agent/1.0)" },
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timeout);

    if (!response.ok) {
      signals.push(`Website gaf status ${response.status} terug bij het ophalen.`);
      return signals;
    }

    finalUrl = response.url;
    html = await response.text();
  } catch {
    return ["Website kon niet automatisch bezocht worden (timeout of blokkade)."];
  }

  signals.push(
    finalUrl.startsWith("https://")
      ? "Website gebruikt HTTPS."
      : "Website gebruikt geen HTTPS — verbeterpunt."
  );

  const cmsSignals: [RegExp, string][] = [
    [/wp-content|wordpress/i, "Gebouwd op WordPress."],
    [/cdn\.shopify\.com/i, "Gebouwd op Shopify."],
    [/wixstatic\.com|static\.wixstatic/i, "Gebouwd op Wix."],
    [/webflow\.com|w-webflow/i, "Gebouwd op Webflow."],
    [/squarespace/i, "Gebouwd op Squarespace."],
  ];
  const cmsMatch = cmsSignals.find(([pattern]) => pattern.test(html));
  signals.push(cmsMatch ? cmsMatch[1] : "Geen bekend CMS/platform gedetecteerd (mogelijk maatwerk).");

  signals.push(
    /googletagmanager\.com|gtag\(|google-analytics\.com/i.test(html)
      ? "Google Analytics/Tag Manager aanwezig."
      : "Geen Google Analytics/Tag Manager gevonden."
  );

  if (!/<meta[^>]+viewport/i.test(html)) {
    signals.push("Geen viewport meta-tag gevonden — mogelijk niet (volledig) mobielvriendelijk.");
  }

  return signals;
}
