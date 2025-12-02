// Employees Management Types

export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'PROBATION' | 'ON_LEAVE' | 'RETIRED' | 'TERMINATED'

export interface Employee {
  id: number
  first_name: string
  last_name: string
  phone: string
  email?: string | null
  status: EmployeeStatus
  hire_date: string
  user_id: number
  created_at: string
  updated_at: string
}

export interface CreateEmployeeRequest {
  first_name: string
  last_name: string
  phone: string
  status: EmployeeStatus
  hire_date: string
  user_id: number
}

export interface UpdateEmployeeRequest {
  first_name?: string
  last_name?: string
  phone?: string
  status?: EmployeeStatus
  hire_date?: string
  user_id?: number
}

export interface EmployeeListResponse {
  employees: Employee[]
  total: number
  page: number
  pages: number
}

export interface EmployeeSearchParams {
  skip?: number
  limit?: number
  status?: EmployeeStatus
  search?: string
}

// Computed employee properties for display
export interface EmployeeDisplayInfo {
  fullName: string
  status: EmployeeStatus
  hireDate: string
  daysEmployed: number
  statusColor: string
  statusLabel: string
}