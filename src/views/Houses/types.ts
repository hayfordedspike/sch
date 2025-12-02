// Houses Management Types

export interface House {
  id: number
  name: string
  address_line1: string
  city: string
  region: string
  postal_code: string
  note: string
  created_at?: string
  updated_at?: string
}

export interface CreateHouseRequest {
  name: string
  address_line1: string
  city: string
  region: string
  postal_code: string
  note: string
}

export interface UpdateHouseRequest {
  name?: string
  address_line1?: string
  city?: string
  region?: string
  postal_code?: string
  note?: string
}

export interface HouseTeam {
  id: number
  house_id: number
  team_id: number
  coverage_notes: string
  active: boolean
}

export interface CreateHouseTeamRequest {
  team_id: number
  coverage_notes: string
  active: boolean
}

export interface HouseListResponse {
  houses: House[]
  total: number
  page: number
  pages: number
}

export interface HouseSearchParams {
  city?: string
  region?: string
  skip?: number
  limit?: number
  is_active?: boolean
}

// Computed house properties for display
export interface HouseDisplayInfo {
  fullAddress: string
  shortAddress: string
  teamCount: number
}