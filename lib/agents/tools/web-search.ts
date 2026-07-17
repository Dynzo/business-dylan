const TAVILY_API_URL = "https://api.tavily.com";

export type SearchResult = {
  title: string;
  url: string;
  content: string;
};

export const isTavilyConfigured = Boolean(process.env.TAVILY_API_KEY);

// Zoek-API voor de research-agent i.p.v. zelf scrapen. Geeft stil een lege lijst terug zonder
// API-key, zodat het ontbreken van Tavily de rest van de agent-run niet laat crashen.
export async function webSearch(query: string, maxResults = 5): Promise<SearchResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    console.warn("Tavily is niet geconfigureerd — websearch overgeslagen.");
    return [];
  }

  const response = await fetch(`${TAVILY_API_URL}/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      query,
      max_results: maxResults,
      search_depth: "basic",
    }),
  });

  if (!response.ok) {
    console.error("Tavily search mislukt:", response.status, await response.text().catch(() => ""));
    return [];
  }

  const data = await response.json();
  return (data.results ?? []).map((r: { title?: string; url?: string; content?: string }) => ({
    title: r.title ?? "",
    url: r.url ?? "",
    content: r.content ?? "",
  }));
}
