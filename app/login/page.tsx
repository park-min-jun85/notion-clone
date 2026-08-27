import { GoogleLoginButton } from "@/components/google-login-button"

export const dynamic = "force-dynamic"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const { error, next } = await searchParams
  return <GoogleLoginButton error={error} next={next} />
}
