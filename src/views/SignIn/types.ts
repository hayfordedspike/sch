export interface SignInFormData {
  email: string
  password: string
  rememberMe: boolean
}

export interface SignInResponse {
  token: string
  user: {
    id: string
    email: string
    name: string
    role: string
  }
}

export interface SignInError {
  message: string
  code?: string
}