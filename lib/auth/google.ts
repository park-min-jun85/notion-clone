/**
 * Google OAuth (one-time dashboard setup — MCP cannot set the Client Secret):
 *
 * Google Cloud Console → APIs & Services → Credentials → OAuth client ID (Web)
 *   Authorized JavaScript origins:
 *     http://localhost:3000
 *     http://localhost:3003
 *   Authorized redirect URI (Supabase callback, not this app):
 *     https://<project-ref>.supabase.co/auth/v1/callback
 *
 * Supabase Dashboard → Authentication
 *   Providers → Google: enable and paste Client ID / Secret
 *   URL Configuration
 *     Site URL: http://localhost:3000
 *     Redirect URLs:
 *       http://localhost:3000/auth/callback
 *       http://localhost:3003/auth/callback
 */
import { createClient } from "@/lib/supabase/client"

export async function signInWithGoogle(): Promise<{ error?: string }> {
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) return { error: error.message }
  return {}
}
