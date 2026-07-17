import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateService } from "@/app/admin/actions";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { Pillar } from "@/lib/types";

export const metadata: Metadata = {
  title: "Dienst bewerken",
  robots: { index: false, follow: false },
};

const fieldClassName =
  "rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-700";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!supabaseAdmin) {
    notFound();
  }

  const [{ data: service }, { data: pillars }] = await Promise.all([
    supabaseAdmin.from("services").select("*").eq("id", id).single(),
    supabaseAdmin.from("pillars").select("*").order("order_index", { ascending: true }),
  ]);

  if (!service) {
    notFound();
  }

  const pillarList: Pillar[] = pillars ?? [];

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <Link href="/admin/diensten" className="text-sm text-zinc-400 underline hover:text-zinc-100">
        ← Terug naar diensten
      </Link>
      <h1 className="mt-4 text-3xl font-semibold text-zinc-50">Dienst bewerken</h1>

      <form
        action={async (formData) => {
          "use server";
          await updateService(id, formData);
        }}
        className="mt-8 flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="pillar_id" className="text-sm font-medium text-zinc-300">
            Pijler
          </label>
          <select
            id="pillar_id"
            name="pillar_id"
            required
            defaultValue={service.pillar_id}
            className={fieldClassName}
          >
            {pillarList.map((pillar) => (
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
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={service.name}
            className={fieldClassName}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="description" className="text-sm font-medium text-zinc-300">
            Beschrijving
          </label>
          <textarea
            id="description"
            name="description"
            rows={2}
            defaultValue={service.description}
            className={fieldClassName}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="includes" className="text-sm font-medium text-zinc-300">
            Inbegrepen (één regel per bullet)
          </label>
          <textarea
            id="includes"
            name="includes"
            rows={3}
            defaultValue={service.includes.join("\n")}
            className={fieldClassName}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="price_label" className="text-sm font-medium text-zinc-300">
              Prijsindicatie
            </label>
            <input
              id="price_label"
              name="price_label"
              type="text"
              defaultValue={service.price_label}
              className={fieldClassName}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="cta_label" className="text-sm font-medium text-zinc-300">
              Knoptekst
            </label>
            <input
              id="cta_label"
              name="cta_label"
              type="text"
              defaultValue={service.cta_label}
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
              defaultValue={service.order_index}
              className={fieldClassName}
            />
          </div>
          <label className="mt-6 flex items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" name="active" defaultChecked={service.active} className="h-4 w-4" />
            Actief (zichtbaar op site)
          </label>
        </div>

        <button
          type="submit"
          className="btn-shine self-start rounded-full bg-zinc-100 px-6 py-3 font-semibold text-zinc-950 transition-transform duration-300 hover:-translate-y-0.5 hover:bg-white"
        >
          Opslaan
        </button>
      </form>
    </main>
  );
}
