import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server-side Supabase instance for use in Server Components, Route Handlers
// and Server Actions. Reads/writes the auth session via cookies.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll called from a Server Component — safe to ignore because
            // middleware.ts refreshes the session on every request.
          }
        },
      },
    }
  );
}

// Service-role client — bypasses Row Level Security. ONLY use in trusted
// server code (webhooks, admin routes) and NEVER expose this key to the browser.
export function createServiceClient() {
  const { createClient: createSupabaseClient } = require("@supabase/supabase-js");
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
