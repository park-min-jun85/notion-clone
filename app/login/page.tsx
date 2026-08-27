import { GoogleLoginButton } from "@/components/google-login-button"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  return <GoogleLoginButton error={error} />
}
