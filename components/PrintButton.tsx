"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print:hidden rounded-full border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-100 transition-all duration-300 hover:-translate-y-0.5 hover:border-zinc-500 hover:bg-zinc-800"
    >
      Printen
    </button>
  );
}
