import type { Metadata } from "next";
import Link from "next/link";
import { AmbientBackground } from "@/components/AmbientBackground";
import { ServiceCard } from "@/components/ServiceCard";
import { supabase } from "@/lib/supabase";
import type { Pillar, Service } from "@/lib/types";

export const metadata: Metadata = {
  title: "Diensten",
  description: "Web, Data en AI — drie pijlers, één technische partner die met je meegroeit.",
};

// Weerlegt de twijfels die de AI-onzekere doelgroep heeft vóór het eerste contact — vandaar hier,
// vlak bij de "AI-bewustzijn & beleid"-dienst, in plaats van los op de homepage.
const AI_FAQ = [
  {
    q: "Is het onderzoek naar mijn bedrijf via het contactformulier AVG-proof?",
    a: "Als je zelf via het contactformulier reageert, kijkt een agent naar openbare, bedrijfsniveau-informatie: de kwaliteit van je website, technische signalen en publiek nieuws — nooit naar jou als persoon. Er wordt geen persoonlijk profiel opgebouwd, en de uitkomst wordt altijd eerst door een mens beoordeeld voordat er iets naar je gemaild wordt. De volledige verwerking staat beschreven in de privacyverklaring.",
  },
  {
    q: "Wat als medewerkers AI verkeerd gebruiken?",
    a: "Daar is het beleidstraject voor bedoeld: concrete afspraken over welke tools gebruikt mogen worden, welke gegevens wel en niet in een prompt mogen, en wie er verantwoordelijk is als het misgaat. Medewerkers krijgen uitleg zodat ze risico's zelf herkennen, in plaats van dat er alleen een document bijkomt dat niemand leest.",
  },
  {
    q: "Moeten we meteen agents of automatisering inzetten?",
    a: "Nee — bewustzijn en beleid staan op zichzelf en zijn voor veel bedrijven het enige dat nodig is. Een pilot of agents komt pas aan de orde als er een concrete, afgebakende taak is die zich daarvoor leent; dat bepalen we samen, niet vooraf.",
  },
  {
    q: "Wat kost dit?",
    a: "Dat hangt af van de vorm: een losse workshop kost minder dan een uitgebreid beleidstraject met meerdere sessies. Er komt altijd eerst een vrijblijvend gesprek waarin duidelijk wordt wat er nodig is, en pas daarna een concreet voorstel — geen verrassingen achteraf.",
  },
];

// Voor de website-starter die twijfelt over een grotere uitgave: laat zien wat een traject
// inhoudt, zodat er geen onduidelijkheid is over wat er wanneer gebeurt.
const WEB_PROCESS = [
  {
    step: "Kennismaking",
    text: "Kort gesprek over wat je nodig hebt — vrijblijvend, geen verplichtingen.",
  },
  {
    step: "Voorstel & planning",
    text: "Een concreet voorstel met scope en planning, pas daarna een go/no-go.",
  },
  {
    step: "Bouw",
    text: "De site of applicatie wordt gebouwd, met tussentijdse check-ins onderweg.",
  },
  {
    step: "Livegang & overdracht",
    text: "De site gaat live, met duidelijke afspraken over onderhoud en aanpassingen.",
  },
];

async function getPillarsWithServices(): Promise<{ pillar: Pillar; services: Service[] }[]> {
  if (!supabase) return [];

  const { data: pillars, error: pillarsError } = await supabase
    .from("pillars")
    .select("*")
    .eq("active", true)
    .order("order_index", { ascending: true });

  if (pillarsError || !pillars) {
    console.error("Kon pillars niet laden:", pillarsError?.message);
    return [];
  }

  const { data: services, error: servicesError } = await supabase
    .from("services")
    .select("*")
    .eq("active", true)
    .order("order_index", { ascending: true });

  if (servicesError) {
    console.error("Kon services niet laden:", servicesError.message);
  }

  return pillars.map((pillar) => ({
    pillar,
    services: (services ?? []).filter((s) => s.pillar_id === pillar.id),
  }));
}

export default async function DienstenPage() {
  const isConfigured = Boolean(supabase);
  const groups = await getPillarsWithServices();

  return (
    <main className="flex flex-1 flex-col">
      <section className="relative overflow-hidden">
        <AmbientBackground />
        <div className="relative z-10 mx-auto max-w-5xl px-4 py-16 sm:py-20">
          <h1 className="animate-fade-up text-4xl font-semibold text-zinc-50">Diensten</h1>
          <p className="animate-fade-up mt-2 max-w-2xl text-zinc-400 [animation-delay:100ms]">
            Een website, grip op je data, of een eerste stap met AI — je kiest zelf waar je begint.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 pb-16">
        {!isConfigured && (
          <div className="mt-8 rounded-lg border border-amber-800 bg-amber-950/40 p-4 text-sm text-amber-300">
            Supabase is nog niet gekoppeld — diensten zijn zichtbaar zodra{" "}
            <code>SUPABASE_URL</code> en <code>SUPABASE_PUBLISHABLE_KEY</code> in{" "}
            <code>.env.local</code> zijn ingevuld.
          </div>
        )}

        {isConfigured && groups.length === 0 && (
          <div className="mt-8 rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 text-sm text-zinc-400">
            Er zijn nog geen diensten beschikbaar. Voer <code>supabase/seed.sql</code> uit of voeg
            diensten toe via <code>/admin/diensten</code>.
          </div>
        )}

        {groups.map(({ pillar, services }) => (
          <section key={pillar.id} id={pillar.key} className="mt-16 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-zinc-50">{pillar.name}</h2>
            <p className="mt-1 text-zinc-400">{pillar.description}</p>

            {services.length > 0 ? (
              <div className="mt-6 grid gap-6 sm:grid-cols-3">
                {services.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            ) : (
              <p className="mt-6 text-sm text-zinc-500">Nog geen diensten voor deze pijler.</p>
            )}

            {pillar.key === "web" && (
              <div className="mt-8">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
                  Zo werkt een traject
                </h3>
                <div className="mt-4 grid gap-6 sm:grid-cols-4">
                  {WEB_PROCESS.map((item, i) => (
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
              </div>
            )}

            {pillar.key === "ai" && (
              <div className="mt-8 flex flex-col gap-3">
                <Link
                  href="/agents"
                  className="inline-flex items-center gap-1 self-start text-sm font-medium text-zinc-300 transition-all hover:gap-2 hover:text-zinc-100"
                >
                  Bekijk hoe een agent er in de praktijk uitziet <span aria-hidden>→</span>
                </Link>
                <h3 className="mt-4 text-sm font-semibold uppercase tracking-wide text-zinc-400">
                  Veelgestelde vragen
                </h3>
                {AI_FAQ.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 open:bg-zinc-900"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-medium text-zinc-100 marker:content-none">
                      {item.q}
                      <span
                        aria-hidden
                        className="shrink-0 text-zinc-500 transition-transform duration-200 group-open:rotate-45"
                      >
                        +
                      </span>
                    </summary>
                    <p className="mt-2 text-sm text-zinc-400">{item.a}</p>
                  </details>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
