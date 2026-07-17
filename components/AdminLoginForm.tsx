"use client";

import { useActionState } from "react";
import { login } from "@/app/admin/actions";

export function AdminLoginForm() {
  const [error, formAction, pending] = useActionState(login, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-zinc-300">
          E-mailadres
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-700"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium text-zinc-300">
          Wachtwoord
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-700"
        />
      </div>
      {error && (
        <p className="rounded-md border border-red-900 bg-red-950/50 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="btn-shine rounded-full bg-zinc-100 px-6 py-3 font-semibold text-zinc-950 transition-transform duration-300 hover:-translate-y-0.5 hover:bg-white disabled:opacity-60"
      >
        {pending ? "Inloggen..." : "Inloggen"}
      </button>
    </form>
  );
}
