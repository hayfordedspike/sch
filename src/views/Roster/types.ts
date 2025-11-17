export interface Visit {
  id: number
  client_id: number
  house_id: number
  start_at: string
  end_at: string
  required_staff_count: number
  notes: string
  created_by_id: number
  created_at: string
}

export interface CreateVisitRequest {
  client_id: number
  house_id: number
  start_at: string
  end_at: string
  required_staff_count: number
  notes: string
  created_by_id: number
}

export interface UpdateVisitRequest {
  client_id?: number
  house_id?: number
  start_at?: string
  end_at?: string
  required_staff_count?: number
  notes?: string
}

export interface VisitSearchParams {
  client_id?: number
  house_id?: number
  start_date?: string
  end_date?: string
  skip?: number
  limit?: number
}

export interface VisitDisplayInfo {
  id: number
  clientName: string
  houseName: string
  startDate: string
  endDate: string
  duration: string
  requiredStaff: number
  notes: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  statusLabel: string
}

export interface Assignment {
  id: number
  visit_id: number
  employee_id: number
  role_on_visit: 'Solo' | 'Lead' | 'Support'
  status: 'TENTATIVE' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  scheduled_start_at: string
  scheduled_end_at: string
  assigned_at: string
  assigned_by_id: number
  check_in_at: string | null
  check_out_at: string | null
}

export interface CreateAssignmentRequest {
  visit_id: number
  employee_id: number
  role_on_visit: 'Solo' | 'Lead' | 'Support'
  status: 'TENTATIVE' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  scheduled_start_at: string
  scheduled_end_at: string
  assigned_by_id: number
}

export interface UpdateAssignmentRequest {
  role_on_visit?: 'Solo' | 'Lead' | 'Support'
  status?: 'TENTATIVE' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  scheduled_start_at?: string
  scheduled_end_at?: string
}

export interface AssignmentSearchParams {
  employee_id?: number
  visit_id?: number
  status?: string
  role_on_visit?: string
  start_date?: string
  end_date?: string
  skip?: number
  limit?: number
}

export interface CheckInRequest {
  check_in_at: string
}

export interface CheckOutRequest {
  check_out_at: string
}

export interface AssignmentDisplayInfo {
  id: number
  employeeName: string
  visitInfo: string
  role: string
  status: string
  statusKey: 'TENTATIVE' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  statusColor: string
  scheduledStart: string
  scheduledEnd: string
  duration: string
  assignedAt: string
  checkInTime: string | null
  checkOutTime: string | null
  isCheckedIn: boolean
  isCheckedOut: boolean
}