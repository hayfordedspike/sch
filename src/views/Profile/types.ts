export interface ProfileData {
  fullName: string
  address: string
  dateOfBirth: string
  phone: string
  email: string
}

export interface UserCertification {
  id: number
  name: string
  issueDate: string
  expiryDate: string
  status: 'active' | 'expiring' | 'expired'
  certificateNumber: string
  validity_months: number
  created_at: string
}

export interface ProfileFormData {
  firstName: string
  lastName: string
  address: string
  dateOfBirth: string
  phone: string
  email: string
}