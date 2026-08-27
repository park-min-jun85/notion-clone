/**
 * Google OAuth (one-time dashboard setup — MCP cannot set the Client Secret):
 *
 * Google Cloud Console → APIs & Services → Credentials → OAuth client ID (Web)
 *   Authorized JavaScript origins:
 *     http://localhost:3000
 *     http://localhost:3003
 *     https://notion-clone-rosy.vercel.app
 *   Authorized redirect URI (Supabase callback, not this app):
 *     https://<project-ref>.supabase.co/auth/v1/callback
 *
 * Supabase Dashboard → Authentication
 *   Providers → Google: enable and paste Client ID / Secret
 *   URL Configuration
 *     Site URL: https://notion-clone-rosy.vercel.app
 *     Redirect URLs:
 *       http://localhost:3000/auth/callback
 *       http://localhost:3003/auth/callback
 *       https://notion-clone-rosy.vercel.app/auth/callback
 */
import { createClient } from "@/lib/supabase/client"

export async function signInWithGoogle(next = "/"): Promise<{ error?: string }> {
  const supabase = createClient()
  const redirectTo = `${window.location.origin}/auth/callback`
  if (next.startsWith("/") && !next.startsWith("//")) {
    sessionStorage.setItem("auth-next", next)
  } else {
    sessionStorage.removeItem("auth-next")
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
    },
  })

  if (error) return { error: error.message }
  return {}
}
