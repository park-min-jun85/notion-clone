import { redirect } from "next/navigation"
import { GoogleLoginButton } from "@/components/google-login-button"
import { getCurrentUser } from "@/lib/auth"

export const dynamic = "force-dynamic"

function safeNextPath(next: string | undefined) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/"
  return next
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const { error, next } = await searchParams
  const user = await getCurrentUser()
  if (user) redirect(safeNextPath(next))
  return <GoogleLoginButton error={error} next={next} />
}
