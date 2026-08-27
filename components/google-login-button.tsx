"use client"

import { useState } from "react"
import { signInWithGoogle } from "@/lib/auth/google"

export function GoogleLoginButton({
  error,
  next,
}: {
  error?: string
  next?: string
}) {
  const [pending, setPending] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  async function handleClick() {
    setPending(true)
    setLocalError(null)
    const result = await signInWithGoogle(next)
    if (result.error) {
      setLocalError(result.error)
      setPending(false)
    }
  }

  const message =
    localError ??
    (error === "no_code"
      ? "Google 로그인 후 앱으로 코드가 전달되지 않았습니다. Supabase Redirect URLs에 https://notion-clone-rosy.vercel.app/auth/callback 이 있는지 확인하세요."
      : error === "exchange"
        ? "로그인 세션을 만들지 못했습니다. 같은 브라우저에서 다시 시도하거나, 카카오/인앱 브라우저가 아니라 Chrome에서 열어 보세요."
        : error === "no_session"
          ? "로그인은 됐지만 세션 쿠키가 저장되지 않았습니다. 브라우저가 쿠키를 막고 있지 않은지 확인하세요."
          : error === "oauth"
            ? "Google 로그인에 실패했습니다. OAuth 클라이언트와 Supabase Google provider 설정을 확인하세요."
            : null)

  return (
    <div className="flex min-h-dvh items-center justify-center bg-sidebar px-4">
      <div className="w-full max-w-[360px] rounded-lg border border-border bg-background p-8 shadow-sm">
        <div className="mb-6 text-center">
          <p className="text-2xl font-semibold tracking-tight">로그인</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Google 계정으로 워크스페이스에 입장하세요.
          </p>
        </div>

        {message && (
          <p className="mb-3 text-sm text-destructive" role="alert">
            {message}
          </p>
        )}

        <button
          type="button"
          onClick={handleClick}
          disabled={pending}
          className="flex h-9 w-full items-center justify-center gap-2 rounded-md border border-input bg-background text-sm font-medium hover:bg-muted disabled:opacity-50"
        >
          <GoogleIcon />
          {pending ? "이동 중..." : "Google로 계속하기"}
        </button>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.208 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 16.108 18.961 13 24 13c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.188 0-9.624-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-1.083 3.041-3.377 5.502-6.084 6.57l.001-.001 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  )
}
