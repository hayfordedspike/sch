export interface RegistrationFormData {
  email: string
  firstName: string
  lastName: string
  password: string
  confirmPassword: string
}

export interface RegistrationApiPayload {
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  is_superuser: boolean
  password: string
  hashed_password: string
}

export interface RegistrationResponse {
  id: number
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  is_superuser: boolean
  created_at: string
  updated_at: string
  last_login: string
}

export interface RegistrationError {
  message: string
  code?: string
  field?: string
}