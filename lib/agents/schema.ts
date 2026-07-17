import { z } from "zod";

// Gestructureerde output van de research-agent — zelfde vorm als BriefingContent in lib/types.ts.
export const briefingContentSchema = z.object({
  summary: z
    .string()
    .describe("Korte samenvatting: wat het bedrijf doet, in welke sector, en geschatte omvang."),
  sector: z.string().describe("De sector/branche van het bedrijf."),
  size_estimate: z
    .string()
    .describe("Geschatte omvang, bijvoorbeeld aantal medewerkers of 'klein MKB'."),
  website_quality: z
    .string()
    .describe(
      "Beoordeling van de kwaliteit van de huidige website — kans voor de Web-pijler. Concreet, geen vage taal."
    ),
  tech_signals: z
    .array(z.string())
    .describe(
      "Concrete technische/data-signalen op de site (bv. CMS, wel/geen analytics, ontbrekende viewport-tag) — kans voor de Data-pijler."
    ),
  news_signals: z
    .array(z.string())
    .describe("Relevant openbaar nieuws of vacatures, bijvoorbeeld data/AI-vacatures als koopsignaal."),
  angle: z
    .string()
    .describe(
      "Concreet hoe de Web-, Data- en/of AI-pijler hier zouden passen, gebaseerd op wat daadwerkelijk gevonden is — geen generieke marketingtaal."
    ),
});

export type BriefingContentSchema = z.infer<typeof briefingContentSchema>;
