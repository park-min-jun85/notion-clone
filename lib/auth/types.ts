export type SessionUser = {
  id: string
  email: string
  name: string
}

export type AuthResult =
  | { user: SessionUser; error?: undefined }
  | { user?: undefined; error: string }
