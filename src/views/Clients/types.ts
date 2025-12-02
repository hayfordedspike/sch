// Clients Management Types

export interface Client {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  house_id: number | null
  address_line_1: string
  address_line_2?: string
  city: string
  state: string
  postal_code: string
  country: string
  date_of_birth: string
  emergency_contact_name: string
  emergency_contact_phone: string
  medical_notes: string
  care_notes: string
  is_active: boolean
  client_since: string
  created_at: string
  updated_at: string
}

export interface CreateClientRequest {
  first_name: string
  last_name: string
  email: string
  phone: string
  house_id?: number | null
  address_line_1: string
  address_line_2?: string
  city: string
  state: string
  postal_code: string
  country: string
  date_of_birth: string
  emergency_contact_name: string
  emergency_contact_phone: string
  medical_notes: string
  care_notes: string
  is_active: boolean
}

export interface UpdateClientRequest {
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  house_id?: number | null
  address_line_1?: string
  address_line_2?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  date_of_birth?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  medical_notes?: string
  care_notes?: string
  is_active?: boolean
}

export interface ClientListResponse {
  clients: Client[]
  total: number
  page: number
  pages: number
}

export interface ClientSearchParams {
  skip?: number
  limit?: number
  is_active?: boolean
  house_id?: number
  city?: string
  search?: string
  include_house?: boolean
  include_visits?: boolean
}

// Computed client properties for display
export interface ClientDisplayInfo {
  fullName: string
  fullAddress: string
  shortAddress: string
  age: number
  isActive: boolean
}