import type { CookieOptions } from "@supabase/ssr"

export function toNextCookieOptions(options: CookieOptions) {
  const sameSite = options.sameSite
  return {
    path: "/",
    maxAge: options.maxAge,
    expires: options.expires,
    httpOnly: options.httpOnly,
    secure: process.env.NODE_ENV === "production" ? true : (options.secure ?? false),
    sameSite:
      sameSite === "none" || sameSite === "lax" || sameSite === "strict"
        ? sameSite
        : "lax",
  }
}
