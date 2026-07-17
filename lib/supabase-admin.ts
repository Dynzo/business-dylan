import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

export const isSupabaseAdminConfigured = Boolean(supabaseUrl && secretKey);

// Secret-key client — alleen gebruiken in server-only code (route handlers, server actions).
// Omzeilt Row Level Security, dus nooit importeren in client components.
export const supabaseAdmin: SupabaseClient | null = isSupabaseAdminConfigured
  ? createClient(supabaseUrl as string, secretKey as string)
  : null;
