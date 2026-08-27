import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { getSupabaseEnv } from "@/lib/supabase/env"

function safeNextPath(next: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/"
  return next
}

function redirectBase(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host")
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https"
  if (process.env.NODE_ENV !== "development" && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`
  }
  return request.nextUrl.origin
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")
  const next = safeNextPath(request.nextUrl.searchParams.get("next"))
  const base = redirectBase(request)

  if (!code) {
    const loginUrl = new URL("/login", base)
    loginUrl.searchParams.set("error", "oauth")
    return NextResponse.redirect(loginUrl)
  }

  const { url, publishableKey } = getSupabaseEnv()
  const redirectResponse = NextResponse.redirect(new URL(next, base))

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value, options }) => {
          redirectResponse.cookies.set(name, value, options)
        })
        Object.entries(headers).forEach(([key, value]) => {
          redirectResponse.headers.set(key, value)
        })
      },
    },
  })

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    const loginUrl = new URL("/login", base)
    loginUrl.searchParams.set("error", "oauth")
    return NextResponse.redirect(loginUrl)
  }

  return redirectResponse
}
