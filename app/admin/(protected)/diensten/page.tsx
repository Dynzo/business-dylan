import type { Metadata } from "next";
import Link from "next/link";
import { addService, deleteService } from "@/app/admin/actions";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { Pillar, Service } from "@/lib/types";

export const metadata: Metadata = {
  title: "Diensten beheren",
  robots: { index: false, follow: false },
};

const fieldClassName =
  "rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-700";

async function getData() {
  if (!supabaseAdmin) return { pillars: [] as Pillar[], services: [] as Service[] };

  const [{ data: pillars }, { data: services }] = await Promise.all([
    supabaseAdmin.from("pillars").select("*").order("order_index", { ascending: true }),
    supabaseAdmin.from("services").select("*").order("order_index", { ascending: true }),
  ]);

  return { pillars: pillars ?? [], services: services ?? [] };
}

export default async function AdminDienstenPage() {
  const { pillars, services } = await getData();

  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <Link href="/admin" className="text-sm text-zinc-400 underline hover:text-zinc-100">
        ← Terug naar leads
      </Link>
      <h1 className="mt-4 text-3xl font-semibold text-zinc-50">Diensten beheren</h1>
      <p className="mt-2 text-zinc-400">
        Diensten met &quot;actief&quot; verschijnen op de homepage en op <code>/diensten</code>.
      </p>

      <form
        action={addService}
        className="mt-8 flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6"
      >
        <h2 className="text-xl font-semibold text-zinc-100">Nieuwe dienst toevoegen</h2>

        <div className="flex flex-col gap-1">
          <label htmlFor="pillar_id" className="text-sm font-medium text-zinc-300">
            Pijler
          </label>
          <select id="pillar_id" name="pillar_id" required className={fieldClassName}>
            {pillars.map((pillar) => (
              <option key={pillar.id} value={pillar.id}>
                {pillar.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="text-sm font-medium text-zinc-300">
            Naam
          </label>
          <input id="name" name="name" type="text" required className={fieldClassName} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="description" className="text-sm font-medium text-zinc-300">
            Beschrijving
          </label>
          <textarea id="description" name="description" rows={2} className={fieldClassName} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="includes" className="text-sm font-medium text-zinc-300">
            Inbegrepen (één regel per bullet)
          </label>
          <textarea id="includes" name="includes" rows={3} className={fieldClassName} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="price_label" className="text-sm font-medium text-zinc-300">
              Prijsindicatie
            </label>
            <input id="price_label" name="price_label" type="text" className={fieldClassName} />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="cta_label" className="text-sm font-medium text-zinc-300">
              Knoptekst
            </label>
            <input
              id="cta_label"
              name="cta_label"
              type="text"
              defaultValue="Neem contact op"
              className={fieldClassName}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="order_index" className="text-sm font-medium text-zinc-300">
              Volgorde
            </label>
            <input
              id="order_index"
              name="order_index"
              type="number"
              defaultValue={0}
              className={fieldClassName}
            />
          </div>
          <label className="mt-6 flex items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" name="active" defaultChecked className="h-4 w-4" />
            Actief (zichtbaar op site)
          </label>
        </div>

        <button
          type="submit"
          className="btn-shine self-start rounded-full bg-zinc-100 px-6 py-3 font-semibold text-zinc-950 transition-transform duration-300 hover:-translate-y-0.5 hover:bg-white"
        >
          Toevoegen
        </button>
      </form>

      {pillars.map((pillar) => {
        const pillarServices = services.filter((s) => s.pillar_id === pillar.id);
        return (
          <section key={pillar.id} className="mt-10">
            <h2 className="text-xl font-semibold text-zinc-100">{pillar.name}</h2>
            <div className="mt-3 rounded-2xl border border-zinc-800 bg-zinc-900/60">
              {pillarServices.length === 0 ? (
                <p className="p-6 text-zinc-500">Nog geen diensten voor deze pijler.</p>
              ) : (
                <ul className="divide-y divide-zinc-800">
                  {pillarServices.map((service) => (
                    <li key={service.id} className="flex items-start justify-between gap-4 px-6 py-4">
                      <div>
                        <p className="font-medium text-zinc-100">
                          {service.name}
                          {!service.active && (
                            <span className="ml-2 text-xs text-zinc-500">(niet actief)</span>
                          )}
                        </p>
                        <p className="text-sm text-zinc-500">{service.price_label}</p>
                      </div>
                      <div className="flex shrink-0 gap-3 text-sm">
                        <Link
                          href={`/admin/diensten/${service.id}/edit`}
                          className="text-zinc-300 underline hover:text-white"
                        >
                          Bewerken
                        </Link>
                        <form
                          action={async () => {
                            "use server";
                            await deleteService(service.id);
                          }}
                        >
                          <button type="submit" className="text-red-400 hover:underline">
                            Verwijderen
                          </button>
                        </form>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        );
      })}
    </main>
  );
}
