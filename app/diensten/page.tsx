import type { Metadata } from "next";
import { AmbientBackground } from "@/components/AmbientBackground";
import { ServiceCard } from "@/components/ServiceCard";
import { supabase } from "@/lib/supabase";
import type { Pillar, Service } from "@/lib/types";

export const metadata: Metadata = {
  title: "Diensten",
  description: "Web, Data en AI — drie pijlers, één technische partner die met je meegroeit.",
};

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
        <div className="relative z-10 mx-auto max-w-5xl px-4 pt-16">
          <h1 className="animate-fade-up text-4xl font-semibold text-zinc-50">Diensten</h1>
          <p className="animate-fade-up mt-2 max-w-2xl text-zinc-400 [animation-delay:100ms]">
            Web → Data → AI: je stapt in op elk niveau en groeit met me mee, trede voor trede.
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
          </section>
        ))}
      </div>
    </main>
  );
}
