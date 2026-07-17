const TAVILY_API_URL = "https://api.tavily.com";

// Haalt schone, samengevatte pagina-inhoud op via Tavily's extract-endpoint (i.p.v. zelf HTML te
// parsen). Geeft null terug zonder API-key of bij een fout — de research-agent moet hiermee door
// kunnen werken (bv. alleen op tech-signalen en zoekresultaten).
export async function fetchSiteContent(url: string): Promise<string | null> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    console.warn("Tavily is niet geconfigureerd — pagina-extractie overgeslagen.");
    return null;
  }

  try {
    const response = await fetch(`${TAVILY_API_URL}/extract`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ urls: [url] }),
    });

    if (!response.ok) {
      console.error("Tavily extract mislukt:", response.status, await response.text().catch(() => ""));
      return null;
    }

    const data = await response.json();
    const result = data.results?.[0];
    return result?.raw_content ?? null;
  } catch (error) {
    console.error("Tavily extract gaf een fout:", error);
    return null;
  }
}
