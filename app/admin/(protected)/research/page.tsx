import type { Metadata } from "next";
import Link from "next/link";
import { ResearchForm } from "@/components/ResearchForm";

export const metadata: Metadata = {
  title: "Research-agent",
  robots: { index: false, follow: false },
};

export default function AdminResearchPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 print:max-w-none">
      <Link href="/admin" className="print:hidden text-sm text-zinc-400 underline hover:text-zinc-100">
        ← Terug naar leads
      </Link>
      <h1 className="print:hidden mt-4 text-3xl font-semibold text-zinc-50">Research-agent</h1>
      <p className="print:hidden mt-2 text-zinc-400">
        Los van binnenkomende leads: voer een bedrijf in vóór een salesgesprek en krijg een
        printbare briefing.
      </p>

      <div className="mt-8">
        <ResearchForm />
      </div>
    </main>
  );
}
