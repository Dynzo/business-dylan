import type { Metadata } from "next";
import Link from "next/link";
import { updateSiteContent } from "@/app/admin/actions";
import { getSiteContent } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Website-tekst beheren",
  robots: { index: false, follow: false },
};

const fieldClassName =
  "rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-700";

function TextField({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-zinc-300">
        {label}
      </label>
      <input id={name} name={name} type="text" defaultValue={defaultValue} className={fieldClassName} />
    </div>
  );
}

function TextAreaField({
  name,
  label,
  defaultValue,
  rows = 3,
}: {
  name: string;
  label: string;
  defaultValue: string;
  rows?: number;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-zinc-300">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        className={fieldClassName}
      />
    </div>
  );
}

function SaveButton() {
  return (
    <button
      type="submit"
      className="btn-shine self-start rounded-full bg-zinc-100 px-6 py-3 font-semibold text-zinc-950 transition-transform duration-300 hover:-translate-y-0.5 hover:bg-white"
    >
      Opslaan
    </button>
  );
}

export default async function AdminContentPage() {
  const content = await getSiteContent();

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <Link href="/admin" className="text-sm text-zinc-400 underline hover:text-zinc-100">
        ← Terug naar leads
      </Link>
      <h1 className="mt-4 text-3xl font-semibold text-zinc-50">Website-tekst beheren</h1>
      <p className="mt-2 text-zinc-400">
        Elke sectie heeft zijn eigen &quot;Opslaan&quot;-knop. Laat je een tekst leeg, dan geeft de
        site geen foutmelding maar toont hij ook geen automatische standaardtekst meer — vul dus
        liever een losse spatie in dan een veld helemaal leeg te laten als je iets tijdelijk wilt
        verbergen.
      </p>

      <form
        action={updateSiteContent}
        className="mt-8 flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6"
      >
        <h2 className="text-xl font-semibold text-zinc-100">Homepage</h2>
        <TextField name="hero_title" label="Hoofdtitel" defaultValue={content.hero_title} />
        <TextField name="hero_tagline" label="Tagline" defaultValue={content.hero_tagline} />
        <TextAreaField name="hero_text" label="Introtekst" defaultValue={content.hero_text} />
        <TextField
          name="section1_heading"
          label="Sectie 1 — titel"
          defaultValue={content.section1_heading}
        />
        <TextAreaField
          name="section1_text1"
          label="Sectie 1 — tekst 1"
          defaultValue={content.section1_text1}
        />
        <TextAreaField
          name="section1_text2"
          label="Sectie 1 — tekst 2"
          defaultValue={content.section1_text2}
        />
        <TextField
          name="section1_highlight"
          label="Sectie 1 — uitgelichte zin"
          defaultValue={content.section1_highlight}
        />
        <TextField
          name="section_growth_heading"
          label="Sectie Data/AI-instap — titel"
          defaultValue={content.section_growth_heading}
        />
        <TextAreaField
          name="section_growth_intro"
          label="Sectie Data/AI-instap — intro"
          defaultValue={content.section_growth_intro}
        />
        <TextAreaField
          name="section_data_text"
          label="Sectie Data/AI-instap — Data-kaart"
          defaultValue={content.section_data_text}
        />
        <TextAreaField
          name="section_ai_text"
          label="Sectie Data/AI-instap — AI-kaart"
          defaultValue={content.section_ai_text}
        />
        <TextField
          name="section2_heading"
          label="Sectie 2 — titel"
          defaultValue={content.section2_heading}
        />
        <TextAreaField
          name="section2_text1"
          label="Sectie 2 — tekst 1"
          defaultValue={content.section2_text1}
        />
        <TextAreaField
          name="section2_text2"
          label="Sectie 2 — tekst 2"
          defaultValue={content.section2_text2}
        />
        <TextField
          name="philosophy_quote"
          label="Filosofie-quote"
          defaultValue={content.philosophy_quote}
        />
        <TextField name="cta_heading" label="Call-to-action — titel" defaultValue={content.cta_heading} />
        <TextAreaField name="cta_text" label="Call-to-action — tekst" defaultValue={content.cta_text} />
        <SaveButton />
      </form>

      <form
        action={updateSiteContent}
        className="mt-8 flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6"
      >
        <h2 className="text-xl font-semibold text-zinc-100">E-mail naar leads</h2>
        <TextField
          name="email_lead_confirmation_subject"
          label="Onderwerp — bericht ontvangen"
          defaultValue={content.email_lead_confirmation_subject}
        />
        <TextAreaField
          name="email_lead_confirmation_intro"
          label="Introtekst — bericht ontvangen"
          defaultValue={content.email_lead_confirmation_intro}
        />
        <SaveButton />
      </form>

      <form
        action={updateSiteContent}
        className="mt-8 flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6"
      >
        <h2 className="text-xl font-semibold text-zinc-100">Juridische pagina&apos;s</h2>
        <p className="text-sm text-zinc-400">
          Gebruik <code>## Kop</code> voor een subkop en <code>- item</code> voor een lijst. Een
          lege regel start een nieuwe alinea.
        </p>
        <TextAreaField
          name="privacy_policy_body"
          label="Privacyverklaring"
          defaultValue={content.privacy_policy_body}
          rows={20}
        />
        <SaveButton />
      </form>
    </main>
  );
}
