import "server-only"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { SessionUser } from "./types"

export type { SessionUser } from "./types"

function toSessionUser(user: {
  id: string
  email?: string
  user_metadata?: Record<string, unknown>
}): SessionUser {
  const metadata = user.user_metadata ?? {}
  const name =
    (typeof metadata.full_name === "string" && metadata.full_name) ||
    (typeof metadata.name === "string" && metadata.name) ||
    user.email?.split("@")[0] ||
    "사용자"

  return {
    id: user.id,
    email: user.email ?? "",
    name,
  }
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) return null
  return toSessionUser(data.user)
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  return user
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
}
