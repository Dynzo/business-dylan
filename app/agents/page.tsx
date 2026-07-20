import type { Metadata } from "next";
import Link from "next/link";
import { AmbientBackground } from "@/components/AmbientBackground";
import { BriefingView } from "@/components/BriefingView";
import type { Briefing, Company } from "@/lib/types";

export const metadata: Metadata = {
  title: "Agents in actie",
  description:
    "Hoe de research-agent achter deze site werkt, en wat dat laat zien over agents die processen automatiseren.",
};

const PIPELINE = [
  {
    step: "Zoeken & lezen",
    text: "Een zoekopdracht (Tavily), de eigen website (samengevat), en een directe check op technische signalen (CMS, analytics, viewport).",
  },
  {
    step: "Samenvatten",
    text: "Een goedkoop model (Haiku) vat het ruwe materiaal samen tot maximaal 300 woorden.",
  },
  {
    step: "Structureren",
    text: "Een sterker model (Sonnet) zet dat om in een vaste briefing-structuur: sector, omvang, kansen, risico's, angle.",
  },
  {
    step: "Mens controleert",
    text: "Altijd een check voordat er iets naar een lead gemaild wordt — er wordt nooit automatisch gemaild.",
  },
];

// Ter illustratie: een fictief voorbeeldbedrijf, geen bestaand bedrijf en geen echte lead.
// Bewust niet een echte (nog onafgeronde) website als onderwerp, en bewust kansgericht
// geformuleerd — dit moet laten zien wat de agent oplevert, niet iemand afkraken.
const DEMO_COMPANY: Company = {
  id: "demo",
  domain: "installatiebedrijfdevries.nl",
  name: "Installatiebedrijf De Vries",
  sector: "Installatietechniek (verwarming, sanitair, elektra)",
  size_estimate: "Klein MKB, circa 15 medewerkers.",
  summary:
    "Installatiebedrijf De Vries is een regionale installateur voor verwarming, sanitair en elektra, actief in de particuliere en kleinzakelijke markt. Langere staat van dienst, circa 15 medewerkers.",
  website_quality:
    "Nette, overzichtelijke website met duidelijke dienstenpagina's en een contactformulier. Geen onlinekalender of offerteconfigurator — aanvragen verlopen nu via telefoon en e-mail.",
  tech_signals: [
    "HTTPS aanwezig",
    "WordPress als CMS",
    "Geen zichtbare koppeling met een planning- of CRM-systeem — aanvragen lijken handmatig verwerkt",
    "Geen analytics gevonden — geen zicht op waar aanvragen vandaan komen",
  ],
  news: [
    "Vacature voor 'allround monteur' online — wijst op groei of vervanging van personeel",
    "Geen vermeldingen van digitalisering- of AI-initiatieven",
  ],
  updated_at: "2026-07-20T00:00:00.000Z",
};

const DEMO_BRIEFING: Briefing = {
  id: "demo",
  lead_id: null,
  company_id: "demo",
  content: {
    summary: DEMO_COMPANY.summary,
    sector: DEMO_COMPANY.sector,
    size_estimate: DEMO_COMPANY.size_estimate,
    website_quality: DEMO_COMPANY.website_quality,
    tech_signals: DEMO_COMPANY.tech_signals,
    news_signals: DEMO_COMPANY.news,
    angle:
      "Web-pijler: de site staat er en oogt netjes, maar een offerteaanvraag- of planningsformulier zou de drempel voor nieuwe klanten verlagen. Data-pijler: planning en aanvragen lijken nu handmatig te verlopen — een eenvoudig systeem voor planning en klantgegevens zou tijd besparen en fouten voorkomen. AI-pijler: met een groeiend team (zie de vacature) kan een agent die eerste aanvragen triageert of veelgestelde vragen beantwoordt al snel tijd opleveren — een AI-bewustzijnssessie is daarvoor een logisch startpunt.",
  },
  angle: "",
  draft_reply: "",
  model_used: "claude-sonnet-5",
  created_at: "2026-07-20T00:00:00.000Z",
};

export default function AgentsPage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="relative overflow-hidden">
        <AmbientBackground />
        <div className="relative z-10 mx-auto max-w-3xl px-4 py-16 sm:py-20">
          <h1 className="animate-fade-up text-4xl font-semibold text-zinc-50">Agents in actie</h1>
          <p className="animate-fade-up mt-2 max-w-2xl text-zinc-400 [animation-delay:100ms]">
            Vul je het contactformulier in met een zakelijk mailadres, dan gaat er op de achtergrond
            automatisch een research-agent aan de slag: die zoekt vooraf informatie op over het
            bedrijf, nog voordat er gereageerd wordt. Hieronder staat precies hoe dat werkt.
          </p>
          <p className="animate-fade-up mt-2 max-w-2xl text-zinc-400 [animation-delay:150ms]">
            Het is ook een concreet voorbeeld van wat een agent kan opleveren: een terugkerende
            taak herkennen en automatiseren, zoals dit ook voor jouw bedrijf gebouwd zou kunnen
            worden.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 pb-16">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
          Hoe de agent werkt
        </h2>
        <div className="mt-4 grid gap-6 sm:grid-cols-4">
          {PIPELINE.map((item, i) => (
            <div key={item.step} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-950">
                  {i + 1}
                </span>
                <span className="text-sm font-medium text-zinc-100">{item.step}</span>
              </div>
              <p className="text-sm text-zinc-400">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 border-t border-zinc-800 pt-10">
          <h2 className="text-2xl font-semibold text-zinc-50">Wat een agent oplevert</h2>
          <p className="mt-2 text-zinc-400">
            Ter illustratie — dit is een fictief voorbeeldbedrijf, geen bestaand bedrijf. De
            structuur is precies wat de agent ook voor een echt bedrijf zou opleveren.
          </p>

          <div className="mt-6">
            <BriefingView briefing={DEMO_BRIEFING} company={DEMO_COMPANY} />
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start gap-3 border-t border-zinc-800 pt-10">
          <h2 className="text-2xl font-semibold text-zinc-50">Dit kan ook voor jouw bedrijf</h2>
          <p className="max-w-2xl text-zinc-400">
            Deze agent lost een specifiek probleem op: sneller een compleet beeld van een bedrijf,
            zonder daar zelf tijd in te steken. Datzelfde principe — een terugkerende taak
            herkennen en automatiseren — is precies waar de AI- en Agents-diensten om draaien.
          </p>
          <Link
            href="/contact"
            className="btn-shine mt-2 rounded-full bg-zinc-100 px-6 py-3 font-semibold text-zinc-950 transition-transform duration-300 hover:-translate-y-0.5 hover:bg-white active:translate-y-0"
          >
            Neem contact op
          </Link>
        </div>
      </div>
    </main>
  );
}
