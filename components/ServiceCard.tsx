import Link from "next/link";
import type { Service } from "@/lib/types";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <div className="group flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-zinc-600 hover:bg-zinc-900 hover:shadow-[0_0_40px_-10px_rgba(249,115,22,0.35)]">
      <h3 className="text-lg font-semibold text-zinc-50 transition-colors group-hover:text-white">
        {service.name}
      </h3>
      <p className="text-sm text-zinc-400">{service.description}</p>
      {service.includes.length > 0 && (
        <ul className="flex flex-col gap-1.5 text-sm text-zinc-400">
          {service.includes.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-zinc-600">—</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
      <Link
        href="/contact"
        className="mt-2 self-start rounded-full border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-100 transition-all duration-300 hover:-translate-y-0.5 hover:border-zinc-500 hover:bg-zinc-800"
      >
        {service.cta_label}
      </Link>
    </div>
  );
}
