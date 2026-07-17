"use client";

import { useState } from "react";
import { BriefingView } from "@/components/BriefingView";
import { PrintButton } from "@/components/PrintButton";
import type { Briefing, Company } from "@/lib/types";

export function ResearchForm() {
  const [companyName, setCompanyName] = useState("");
  const [domain, setDomain] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ briefing: Briefing; company: Company } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!domain.trim()) {
      setError("Vul een domein in.");
      return;
    }

    setIsSubmitting(true);
    setResult(null);
    try {
      const response = await fetch("/api/agents/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, domain }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(data?.error ?? "Er ging iets mis. Probeer het opnieuw.");
        setIsSubmitting(false);
        return;
      }

      setResult(data);
      setIsSubmitting(false);
    } catch {
      setError("Er ging iets mis. Probeer het opnieuw.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={handleSubmit} className="print:hidden flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="companyName" className="text-sm font-medium text-zinc-300">
              Bedrijfsnaam (optioneel)
            </label>
            <input
              id="companyName"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-700"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="domain" className="text-sm font-medium text-zinc-300">
              Domein
            </label>
            <input
              id="domain"
              type="text"
              placeholder="bedrijf.nl"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-700"
            />
          </div>
        </div>

        {error && (
          <p className="rounded-md border border-red-900 bg-red-950/50 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-shine self-start rounded-full bg-zinc-100 px-6 py-3 font-semibold text-zinc-950 transition-transform duration-300 hover:-translate-y-0.5 hover:bg-white disabled:opacity-60"
        >
          {isSubmitting ? "Onderzoek loopt..." : "Onderzoek uitvoeren"}
        </button>
      </form>

      {result && (
        <div className="flex flex-col gap-4">
          <div className="print:hidden flex justify-end">
            <PrintButton />
          </div>
          <BriefingView briefing={result.briefing} company={result.company} />
        </div>
      )}
    </div>
  );
}
