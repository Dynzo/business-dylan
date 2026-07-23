import { supabase } from "@/lib/supabase";

// Standaardwaarden — worden gebruikt zolang er geen rij in site_content bestaat voor die key.
// Beheerbaar via /admin/content. Werknaam totdat er een merknaam gekozen is (zie businessplan).
export const SITE_CONTENT_DEFAULTS = {
  hero_title: "Wingcrest — Web · Data · AI",
  hero_tagline: "Groeit met je mee.",
  hero_text:
    "Van websites en webapplicaties, via een solide dataplatform als fundament, tot AI-toepassingen en agents die processen automatiseren. Je stapt in op elk niveau en groeit mee, trede voor trede.",

  section1_heading: "Web → Data → AI",
  section1_text1:
    "Een goede website of applicatie brengt data voort. Die data breng je samen in een platform. Op dat platform draaien analytics en applicaties. En daar bovenop komen AI-toepassingen en agents.",
  section1_text2:
    "Je hoeft niet alles in één keer te kiezen: je stapt in waar je nu staat, en groeit stap voor stap mee.",
  section1_highlight: "Eén technische partner voor de hele weg — van eerste website tot eerste agent.",

  section_growth_heading: "Nog niet zo ver met data of AI?",
  section_growth_intro:
    "Ook dat is een goed startpunt — voor beide is er een laagdrempelige eerste stap, geen groot project.",
  section_data_text:
    "Data verspreid over spreadsheets en systemen die niet met elkaar praten? Een dataquickscan brengt in kaart wat er mogelijk is.",
  section_ai_text:
    "Nog niet gestart met AI, of alleen af en toe ChatGPT? Uitleg, kansen én risico's, en een eerste toepassing waar je zelf de snelheid van bepaalt.",

  section2_heading: "AI-toepassingen die je zelf kunt ervaren",
  section2_text1:
    "Deze site is zelf het bewijs: stuur een bericht via het contactformulier, en een research-agent zoekt automatisch openbare informatie op over je bedrijf — kwaliteit van de huidige website, tech-signalen, recent nieuws — en zet dat om in een concrete briefing.",
  section2_text2:
    "Geen black box: alleen bedrijfsniveau, alleen openbare bronnen, en altijd een mens die meekijkt voordat er iets de deur uit gaat.",

  philosophy_quote: "Sterke techniek, heldere taal, geen jargon.",

  cta_heading: "Laten we kennismaken",
  cta_text: "Vertel kort waar je tegenaan loopt — we denken vrijblijvend met je mee.",

  email_lead_confirmation_subject: "We hebben je bericht ontvangen",
  email_lead_confirmation_intro:
    "Bedankt voor je bericht. Je krijgt binnen 1-2 werkdagen reactie.",

  privacy_policy_body: `[Eenmanszaak, naam en KVK-nummer volgen zodra ingeschreven], gevestigd op [adres volgt], is verantwoordelijk voor de verwerking van persoonsgegevens zoals beschreven in deze privacyverklaring.

## Contactgegevens
[Bedrijfsnaam volgt]
[Adres volgt]
KVK-nummer: volgt binnenkort
E-mail: contactgegevens volgen binnenkort

## Welke persoonsgegevens verwerken wij
Bij het versturen van een bericht via het contactformulier verwerken wij:
- Naam
- E-mailadres
- Bedrijfsnaam (indien opgegeven)
- De inhoud van je bericht

## Geautomatiseerd onderzoek naar je bedrijf
Als je een bedrijfsnaam en een bedrijfsdomein (geen gmail/hotmail/outlook-achtig adres) opgeeft, zoekt
een geautomatiseerde agent openbare, bedrijfsniveau-informatie op (zoals de kwaliteit van je huidige
website, technische signalen en openbaar nieuws) om je bericht sneller en gerichter te kunnen
beantwoorden. Dit onderzoek blijft bewust beperkt tot bedrijfsniveau en openbare bronnen — er worden
geen persoonlijke profielen of persoonsgegevens over jou als individu verzameld. Elke uitkomst wordt
door een mens bekeken voordat er gereageerd wordt; er wordt nooit automatisch een e-mail verstuurd.

## Waarom verwerken wij deze gegevens
Wij gebruiken deze gegevens om:
- contact met je op te nemen over je bericht
- je aanvraag beter te begrijpen en gerichter te kunnen beantwoorden

## Grondslag
De verwerking is gebaseerd op ons gerechtvaardigd belang om vragen en aanvragen van (potentiële)
klanten te kunnen beantwoorden.

## Bewaartermijn
Wij bewaren je gegevens niet langer dan noodzakelijk voor het doel waarvoor ze zijn verzameld.

## Delen met derden
Wij delen gegevens alleen met partijen die noodzakelijk zijn voor onze dienstverlening:
- Supabase (database- en hostingpartij)
- Resend (verzendt bevestigings- en notificatiemails namens ons)
- Anthropic (verwerkt berichttekst en openbare bedrijfsinformatie voor de research- en
  enrichment-agent)
- Tavily (zoek-API die de agent gebruikt voor openbaar webonderzoek)

Wij verkopen jouw gegevens nooit aan derden.

## Cookies
Deze website gebruikt alleen functionele cookies die noodzakelijk zijn voor het inloggen in het
beheerpaneel. Wij gebruiken geen tracking- of advertentiecookies.

## Jouw rechten
Je hebt het recht om je persoonsgegevens in te zien, te corrigeren of te laten verwijderen. Ook kun je
bezwaar maken tegen de verwerking. Neem hiervoor contact met ons op via de contactgegevens hierboven.
Je hebt ook het recht om een klacht in te dienen bij de Autoriteit Persoonsgegevens
(autoriteitpersoonsgegevens.nl).

## Wijzigingen
Wij kunnen deze privacyverklaring aanpassen. De meest actuele versie is altijd op deze pagina te
vinden.`,
} as const;

export type SiteContentKey = keyof typeof SITE_CONTENT_DEFAULTS;

// Per render opnieuw op te vragen zodat een wijziging via /admin/content direct zichtbaar is.
export async function getSiteContent(): Promise<Record<SiteContentKey, string>> {
  const result = { ...SITE_CONTENT_DEFAULTS };

  if (!supabase) return result;

  const { data, error } = await supabase.from("site_content").select("key, value");
  if (error) {
    console.error("Kon site_content niet laden:", error.message);
    return result;
  }

  for (const row of data ?? []) {
    if (row.key in result) {
      (result as Record<string, string>)[row.key] = row.value;
    }
  }

  return result;
}
