import type { Metadata } from "next";
import { AmbientBackground } from "@/components/AmbientBackground";
import { LeadForm } from "@/components/LeadForm";
import { isSupabaseAdminConfigured } from "@/lib/supabase-admin";

export const metadata: Metadata = {
  title: "Contact",
  description: "Vertel kort waar je tegenaan loopt — we denken vrijblijvend met je mee.",
};

export default function ContactPage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="relative overflow-hidden">
        <AmbientBackground />
        <div className="relative z-10 mx-auto max-w-2xl px-4 pt-16">
          <h1 className="animate-fade-up text-4xl font-semibold text-zinc-50">Neem contact op</h1>
          <p className="animate-fade-up mt-2 text-zinc-400 [animation-delay:100ms]">
            Vertel kort waar je tegenaan loopt. Je krijgt binnen 1-2 werkdagen reactie.
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-2xl px-4 pb-16">
        {!isSupabaseAdminConfigured && (
          <div className="mt-8 rounded-lg border border-amber-800 bg-amber-950/40 p-4 text-sm text-amber-300">
            Supabase is nog niet gekoppeld op de server — het formulier werkt pas zodra{" "}
            <code>SUPABASE_SECRET_KEY</code> in <code>.env.local</code> is ingevuld.
          </div>
        )}

        <div className="animate-fade-up mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 transition-colors duration-300 hover:border-zinc-700 sm:p-8 [animation-delay:200ms]">
          <LeadForm />
        </div>
      </div>
    </main>
  );
}
