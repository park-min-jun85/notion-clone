import { createBrowserClient } from "@supabase/ssr"
import { getSupabaseEnv } from "./env"

export function createClient() {
  const { url, publishableKey } = getSupabaseEnv()
  return createBrowserClient(url, publishableKey, {
    cookieOptions: {
      path: "/",
      sameSite: "lax",
      secure: typeof window !== "undefined" ? window.location.protocol === "https:" : true,
    },
    auth: {
      detectSessionInUrl: false,
      persistSession: true,
    },
  })
}
