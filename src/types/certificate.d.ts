import type { Certificate } from '@/types/certificate'

export interface Certificate {
  id: string
  code: string
  name: string
  description: string
  validity_months: number
  renewal_window_days: number
  grace_period_days: number
  certificate_id?: string
  issuing_organisation?: string
  issue_date?: Date | null
  expiry_date?: Date | null
  certificate_type?: string
  certificate_item?: File | null
}

export interface CreateCertificateRequest {
  code: string
  name: string
  description: string
  validity_months: number
  renewal_window_days: number
  grace_period_days: number
  certificate_id?: string
  issuing_organisation?: string
  issue_date?: Date | null
  expiry_date?: Date | null
  certificate_type?: string
  certificate_item?: File | null
}