// Houses Management Types

export interface House {
  id: number
  name: string
  address_line1: string
  address_line2?: string
  city: string
  region: string
  postal_code: string
  country: string
  phone?: string
  email?: string
  note: string
  created_at: string
  updated_at?: string
  teams?: HouseTeam[]
}

export interface CreateHouseRequest {
  name: string
  address_line1: string
  address_line2?: string
  city: string
  region: string
  postal_code?: string
  country: string
  phone?: string
  email?: string
  note?: string
}

export interface UpdateHouseRequest {
  name?: string
  address_line1?: string
  address_line2?: string
  city?: string
  region?: string
  postal_code?: string
  country?: string
  phone?: string
  email?: string
  note?: string
}

export interface HouseTeam {
  id: number
  house_id: number
  team_id: number
  coverage_notes: string
  active: boolean
  created_at: string
}

export interface CreateHouseTeamRequest {
  house_id: number
  team_id: number
  coverage_notes?: string
  active?: boolean
}

export interface HouseListResponse {
  houses: House[]
  total: number
  page: number
  pages: number
}

export interface HouseSearchParams {
  skip?: number
  limit?: number
  include_teams?: boolean
}

// Computed house properties for display
export interface HouseDisplayInfo {
  fullAddress: string
  shortAddress: string
  teamCount: number
}