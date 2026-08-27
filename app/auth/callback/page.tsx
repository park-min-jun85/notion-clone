"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

function safeNextPath(next: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/"
  return next
}

export default function AuthCallbackPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get("code")
    const next = safeNextPath(
      params.get("next") ?? sessionStorage.getItem("auth-next"),
    )
    sessionStorage.removeItem("auth-next")

    async function finish() {
      const supabase = createClient()

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          const { data } = await supabase.auth.getSession()
          if (!data.session) {
            window.location.replace("/login?error=oauth")
            return
          }
        }
      } else {
        const { data } = await supabase.auth.getSession()
        if (!data.session) {
          window.location.replace("/login?error=oauth")
          return
        }
      }

      window.location.replace(next)
    }

    void finish()
  }, [])

  return (
    <div className="flex min-h-dvh items-center justify-center bg-sidebar px-4 text-sm text-muted-foreground">
      로그인 처리 중...
    </div>
  )
}
