import Link from "next/link";

export function Nav() {
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4">
        <Link href="/" className="font-semibold text-zinc-100 transition-colors hover:text-white">
          Wingcrest
        </Link>
        <div className="flex items-center gap-3 text-sm font-medium text-zinc-400 sm:gap-6">
          <Link
            href="/diensten"
            className="relative hidden py-1 hover:text-zinc-100 sm:inline-block after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-zinc-100 after:transition-all after:duration-300 hover:after:w-full"
          >
            Diensten
          </Link>
          <Link
            href="/contact"
            className="btn-shine shrink-0 rounded-full bg-zinc-100 px-4 py-2 font-semibold text-zinc-950 transition-transform duration-300 hover:-translate-y-0.5 hover:bg-white active:translate-y-0"
          >
            Contact
          </Link>
        </div>
      </nav>
    </header>
  );
}
