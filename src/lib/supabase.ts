import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const PUBLIC_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Без ключей сайт показывает демо-каталог, а сохранение в админке недоступно. */
export const isSupabaseConfigured = Boolean(URL && PUBLIC_KEY);
export const isAdminDbConfigured = Boolean(URL && SERVICE_KEY);

let publicClient: SupabaseClient | null = null;
let adminClient: SupabaseClient | null = null;

/** Анонимный клиент: RLS пропускает только опубликованный каталог. */
export function publicDb() {
  if (!isSupabaseConfigured) throw new Error("Supabase не настроен");
  publicClient ??= createClient(URL!, PUBLIC_KEY!, { auth: { persistSession: false } });
  return publicClient;
}

/** Service-role клиент: только для API-роутов и страниц админки. */
export function adminDb() {
  if (!isAdminDbConfigured) throw new Error("Supabase не настроен: нужен SUPABASE_SERVICE_ROLE_KEY");
  adminClient ??= createClient(URL!, SERVICE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return adminClient;
}
