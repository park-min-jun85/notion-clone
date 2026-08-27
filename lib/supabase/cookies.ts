import type { CookieOptions } from "@supabase/ssr"

export function toNextCookieOptions(options: CookieOptions) {
  const sameSite = options.sameSite
  return {
    path: options.path ?? "/",
    maxAge: options.maxAge,
    expires: options.expires,
    httpOnly: options.httpOnly,
    secure: options.secure ?? process.env.NODE_ENV === "production",
    sameSite:
      sameSite === "none" || sameSite === "lax" || sameSite === "strict"
        ? sameSite
        : "lax",
  }
}
