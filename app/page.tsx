import Link from "next/link";
import { AmbientBackground } from "@/components/AmbientBackground";
import { getSiteContent } from "@/lib/site-content";
import { supabase } from "@/lib/supabase";
import type { Pillar } from "@/lib/types";

async function getActivePillars(): Promise<Pillar[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("pillars")
    .select("*")
    .eq("active", true)
    .order("order_index", { ascending: true });

  if (error) {
    console.error("Kon pillars niet laden:", error.message);
    return [];
  }

  return data ?? [];
}

export default async function HomePage() {
  const [pillars, content] = await Promise.all([getActivePillars(), getSiteContent()]);

  return (
    <main className="flex flex-1 flex-col">
      <section className="relative overflow-hidden">
        <AmbientBackground />
        <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-5 px-4 py-20 text-center sm:py-28">
          <h1 className="animate-fade-up bg-gradient-to-r from-zinc-100 via-zinc-50 to-indigo-200 bg-clip-text text-5xl font-bold leading-tight text-transparent sm:text-6xl">
            {content.hero_title}
          </h1>
          <div className="animate-fade-up flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.25em] text-indigo-300/80 [animation-delay:80ms] sm:text-sm">
            {(pillars.length > 0 ? pillars.map((p) => p.name) : ["Web", "Data", "AI"]).map(
              (name, i) => (
                <span key={name} className="flex items-center gap-2.5">
                  {i > 0 && <span aria-hidden className="h-1 w-1 rounded-full bg-indigo-400/70" />}
                  {name}
                </span>
              ),
            )}
          </div>
          <p className="animate-fade-up text-xl text-zinc-400 [animation-delay:100ms]">
            {content.hero_tagline}
          </p>
          <p className="animate-fade-up max-w-xl text-lg text-zinc-500 [animation-delay:200ms]">
            {content.hero_text}
          </p>
          <div className="animate-fade-up mt-2 flex flex-wrap justify-center gap-3 [animation-delay:300ms]">
            <Link
              href="/contact"
              className="btn-shine rounded-full bg-zinc-100 px-6 py-3 font-semibold text-zinc-950 transition-transform duration-300 hover:-translate-y-0.5 hover:bg-white active:translate-y-0"
            >
              Neem contact op
            </Link>
            <Link
              href="/diensten"
              className="rounded-full border border-zinc-700 px-6 py-3 font-semibold text-zinc-200 transition-all duration-300 hover:-translate-y-0.5 hover:border-zinc-500 hover:bg-zinc-900 active:translate-y-0"
            >
              Bekijk diensten
            </Link>
          </div>
        </div>
      </section>

      {pillars.length > 0 && (
        <section className="border-t border-zinc-800 bg-zinc-950 py-16">
          <div className="mx-auto grid max-w-5xl gap-6 px-4 sm:grid-cols-3">
            {pillars.map((pillar, i) => (
              <Link
                key={pillar.id}
                href={`/diensten#${pillar.key}`}
                className="group flex flex-col gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-zinc-600 hover:bg-zinc-900 hover:shadow-[0_0_40px_-10px_rgba(99,102,241,0.35)]"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <h2 className="text-xl font-semibold text-zinc-50 transition-colors group-hover:text-white">
                  {pillar.name}
                </h2>
                <p className="text-sm font-medium text-zinc-300">{pillar.tagline}</p>
                <p className="mt-1 text-sm text-zinc-500">{pillar.description}</p>
                <span className="mt-2 inline-flex items-center gap-1 text-sm text-zinc-500 transition-all duration-300 group-hover:gap-2 group-hover:text-zinc-300">
                  Meer bekijken <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto grid max-w-5xl gap-10 border-t border-zinc-800 px-4 py-16 sm:grid-cols-2 sm:items-center">
        <div className="flex flex-col gap-4">
          <h2 className="text-3xl font-semibold text-zinc-50">{content.section1_heading}</h2>
          <p className="text-zinc-400">{content.section1_text1}</p>
          <p className="text-zinc-400">{content.section1_text2}</p>
          <p className="font-medium text-zinc-200">{content.section1_highlight}</p>
        </div>
        <div className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 transition-colors duration-300 hover:border-zinc-700">
          {["Web", "Data", "AI"].map((step, i) => (
            <div key={step} className="group flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-950 transition-transform duration-300 group-hover:scale-110">
                {i + 1}
              </span>
              <span className="text-lg font-medium text-zinc-100">{step}</span>
              {i < 2 && (
                <span aria-hidden className="ml-auto text-zinc-600 transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl border-t border-zinc-800 px-4 py-16">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold text-zinc-50">{content.section_growth_heading}</h2>
          <p className="mt-2 text-zinc-400">{content.section_growth_intro}</p>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 transition-colors duration-300 hover:border-zinc-700">
            <h3 className="text-lg font-semibold text-zinc-100">Data</h3>
            <p className="mt-2 text-sm text-zinc-400">{content.section_data_text}</p>
            <p className="mt-4 text-sm font-medium text-zinc-300">
              Dataquickscan <span className="text-zinc-600">→</span> Dataplatform{" "}
              <span className="text-zinc-600">→</span> Analytics &amp; dashboards
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 transition-colors duration-300 hover:border-zinc-700">
            <h3 className="text-lg font-semibold text-zinc-100">AI</h3>
            <p className="mt-2 text-sm text-zinc-400">{content.section_ai_text}</p>
            <p className="mt-4 text-sm font-medium text-zinc-300">
              Bewustzijn &amp; beleid <span className="text-zinc-600">→</span> Pilot{" "}
              <span className="text-zinc-600">→</span> Agents &amp; automatisering
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-10 border-t border-zinc-800 px-4 py-16 sm:grid-cols-2 sm:items-center">
        <div className="order-2 flex flex-col gap-4 sm:order-1">
          <h2 className="text-3xl font-semibold text-zinc-50">{content.section2_heading}</h2>
          <p className="text-zinc-400">{content.section2_text1}</p>
          <p className="text-zinc-400">{content.section2_text2}</p>
        </div>
        <div className="order-1 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 transition-colors duration-300 hover:border-zinc-700 sm:order-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Voorbereid het gesprek in
          </p>
          <p className="mt-2 text-zinc-300">
            Stuur een bericht via het contactformulier met je bedrijfsnaam — de research-agent
            gaat alvast aan de slag, en wat daaruit komt bespreken we samen in het gesprek dat
            volgt.
          </p>
          <Link
            href="/agents"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-zinc-300 transition-all hover:gap-2 hover:text-zinc-100"
          >
            Bekijk hoe de agent werkt <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-zinc-800 bg-zinc-950 py-20">
        <AmbientBackground />
        <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 text-center">
          <h2 className="text-3xl font-semibold text-zinc-50">{content.cta_heading}</h2>
          <p className="max-w-xl text-zinc-400">{content.cta_text}</p>
          <Link
            href="/contact"
            className="btn-shine mt-2 rounded-full bg-zinc-100 px-6 py-3 font-semibold text-zinc-950 transition-transform duration-300 hover:-translate-y-0.5 hover:bg-white active:translate-y-0"
          >
            Neem contact op
          </Link>
        </div>
      </section>
    </main>
  );
}
