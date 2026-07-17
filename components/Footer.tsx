import Link from "next/link";
import { getSiteContent } from "@/lib/site-content";

export async function Footer() {
  const content = await getSiteContent();

  return (
    <footer className="mt-auto border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-2 px-4 py-10 text-center">
        <p className="font-semibold text-zinc-100">{content.hero_title}</p>
        <p className="text-sm text-zinc-500">{content.hero_tagline}</p>

        <div className="mt-4 flex gap-4 text-xs text-zinc-500">
          <Link href="/privacybeleid" className="underline hover:text-zinc-200">
            Privacyverklaring
          </Link>
        </div>

        <p className="mt-4 text-xs text-zinc-600">
          © {new Date().getFullYear()} — [bedrijfsnaam en KVK-nummer volgen zodra ingeschreven]
        </p>
      </div>
    </footer>
  );
}
