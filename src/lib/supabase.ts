/**
 * Supabase browser client for Artly.
 *
 * Env (copy `.env.example` → `.env.local`):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *
 * When either is missing, `createSupabaseClient()` returns null and the app
 * keeps using the localStorage persistence module.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseEnv, isSupabaseConfigured } from "./supabase/env";
import type { Database } from "./supabase/types";

export { getSupabaseEnv, isSupabaseConfigured };
export type { Database };

let browserClient: SupabaseClient<Database> | null = null;

export function createSupabaseClient() {
  const env = getSupabaseEnv();
  if (!env) return null;
  if (!browserClient) {
    browserClient = createClient<Database>(env.url, env.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return browserClient;
}

export const getSupabaseBrowserClient = createSupabaseClient;
