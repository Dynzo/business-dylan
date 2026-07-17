import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Bedankt",
  robots: { index: false, follow: false },
};

export default function BedanktPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-3xl">
        ✓
      </div>
      <h1 className="mt-6 text-3xl font-semibold text-zinc-50 sm:text-4xl">Bedankt voor je bericht!</h1>
      <p className="mt-4 text-zinc-400">
        Ik heb je bericht ontvangen en neem binnen 1-2 werkdagen contact met je op.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-full bg-zinc-100 px-6 py-3 font-semibold text-zinc-950 hover:bg-white"
      >
        Terug naar de homepage
      </Link>
    </main>
  );
}
