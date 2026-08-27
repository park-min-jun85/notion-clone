import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { getSupabaseEnv } from "@/lib/supabase/env"
import { toNextCookieOptions } from "@/lib/supabase/cookies"

export const runtime = "nodejs"

function safeNextPath(next: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/"
  return next
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get("code")
  const next = safeNextPath(searchParams.get("next"))

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=no_code", origin))
  }

  const { url, publishableKey } = getSupabaseEnv()
  const redirect = NextResponse.redirect(new URL(next, origin), { status: 303 })
  redirect.headers.set("Cache-Control", "no-store")

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value, options }) => {
          redirect.cookies.set(name, value, toNextCookieOptions(options))
        })
        Object.entries(headers).forEach(([key, value]) => {
          redirect.headers.set(key, value)
        })
      },
    },
  })

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    return NextResponse.redirect(new URL("/login?error=exchange", origin))
  }

  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) {
    return NextResponse.redirect(new URL("/login?error=no_session", origin))
  }

  return redirect
}
