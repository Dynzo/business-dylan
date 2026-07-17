import type { Metadata } from "next";
import { RichText } from "@/components/RichText";
import { getSiteContent } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Privacyverklaring",
  description: "Privacyverklaring.",
};

export default async function PrivacybeleidPage() {
  const content = await getSiteContent();

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-semibold text-zinc-50 sm:text-4xl">Privacyverklaring</h1>
      <p className="mt-2 text-sm text-zinc-500">Laatst bijgewerkt: 17 juli 2026</p>

      <div className="mt-8">
        <RichText content={content.privacy_policy_body} />
      </div>
    </main>
  );
}
