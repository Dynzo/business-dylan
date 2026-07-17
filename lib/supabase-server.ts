import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

// Auth-bewuste server client (leest/schrijft de sessie-cookie). Gebruik dit alleen voor
// supabase.auth.* — voor databasequeries buiten auth om is lib/supabase.ts of
// lib/supabase-admin.ts het juiste type client.
export async function createClient(): Promise<SupabaseClient | null> {
  if (!supabaseUrl || !supabasePublishableKey) return null;

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Components mogen geen cookies zetten — Server Actions/Route Handlers doen dat.
        }
      },
    },
  });
}
