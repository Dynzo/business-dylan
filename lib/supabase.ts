import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

// Zolang .env.local geen echte Supabase-keys heeft, blijft de client leeg
// zodat pagina's netjes een placeholder kunnen tonen in plaats van te crashen.
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabasePublishableKey as string)
  : null;
