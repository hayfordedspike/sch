import { ref, computed } from 'vue'
import { useApi } from './useApi'
import type {
  Assignment,
  CreateAssignmentRequest,
  UpdateAssignmentRequest,
  AssignmentSearchParams,
  CheckInRequest,
  CheckOutRequest,
  AssignmentDisplayInfo
} from '@/views/Roster/types'

export function useAssignments() {
  const { get, post, put, delete: del, loading, error } = useApi()
  const ASSIGNMENTS_BASE = '/assignments/'

  const assignments = ref<Assignment[]>([])
  const currentAssignment = ref<Assignment | null>(null)
  const totalAssignments = ref(0)
  const currentPage = ref(1)
  const totalPages = ref(1)

  // Computed properties
  const activeAssignments = computed(() =>
    assignments.value.filter(assignment =>
      assignment.status === 'CONFIRMED' || assignment.status === 'IN_PROGRESS'
    )
  )

  const completedAssignments = computed(() =>
    assignments.value.filter(assignment => assignment.status === 'COMPLETED')
  )

  const pendingAssignments = computed(() =>
    assignments.value.filter(assignment => assignment.status === 'TENTATIVE')
  )

  // Utility functions
  const getAssignmentDisplayInfo = (assignment: Assignment): AssignmentDisplayInfo => {
    const scheduledStart = new Date(assignment.scheduled_start_at)
    const scheduledEnd = new Date(assignment.scheduled_end_at)
    const assignedAt = new Date(assignment.assigned_at)

    const duration = Math.round((scheduledEnd.getTime() - scheduledStart.getTime()) / (1000 * 60 * 60)) // hours

    const statusColors = {
      TENTATIVE: 'warning',
      CONFIRMED: 'info',
      IN_PROGRESS: 'success',
      COMPLETED: 'success',
      CANCELLED: 'danger'
    }

    const statusLabels = {
      TENTATIVE: 'Tentative',
      CONFIRMED: 'Confirmed',
      IN_PROGRESS: 'In Progress',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled'
    }

    const roleLabels = {
      Solo: 'Solo',
      Lead: 'Lead',
      Support: 'Support'
    }

    return {
      id: assignment.id,
      employeeName: `Employee #${assignment.employee_id}`, // TODO: Get actual employee name
      visitInfo: `Visit #${assignment.visit_id}`, // TODO: Get actual visit info
      role: roleLabels[assignment.role_on_visit],
      status: statusLabels[assignment.status],
      statusKey: assignment.status,
      statusColor: statusColors[assignment.status],
      scheduledStart: scheduledStart.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      scheduledEnd: scheduledEnd.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      duration: `${duration} hours`,
      assignedAt: assignedAt.toLocaleDateString('en-US'),
      checkInTime: assignment.check_in_at ? new Date(assignment.check_in_at).toLocaleString('en-US') : null,
      checkOutTime: assignment.check_out_at ? new Date(assignment.check_out_at).toLocaleString('en-US') : null,
      isCheckedIn: !!assignment.check_in_at,
      isCheckedOut: !!assignment.check_out_at
    }
  }

  // API Methods
  const fetchAssignments = async (params: AssignmentSearchParams = {}) => {
    try {
      const queryParams = new URLSearchParams()

      if (params.employee_id !== undefined) queryParams.append('employee_id', params.employee_id.toString())
      if (params.visit_id !== undefined) queryParams.append('visit_id', params.visit_id.toString())
      if (params.status) queryParams.append('status', params.status)
      if (params.role_on_visit) queryParams.append('role_on_visit', params.role_on_visit)
      if (params.start_date) queryParams.append('start_date', params.start_date)
      if (params.end_date) queryParams.append('end_date', params.end_date)
      if (params.skip !== undefined) queryParams.append('skip', params.skip.toString())
      if (params.limit !== undefined) queryParams.append('limit', params.limit.toString())

      const url = `${ASSIGNMENTS_BASE}${queryParams.toString() ? '?' + queryParams.toString() : ''}`

      const response = await get<Assignment[]>(url, {
        showErrorToast: true
      })

      if (response) {
        assignments.value = response
        totalAssignments.value = response.length
        console.log('Fetched assignments:', response.length)
      }

      return response
    } catch (err) {
      console.error('Error fetching assignments:', err)
      return null
    }
  }

  const getAssignment = async (id: number, includeRelationships = false) => {
    try {
      const queryParams = new URLSearchParams()
      if (includeRelationships) queryParams.append('include_relationships', 'true')

      const detailBase = `${ASSIGNMENTS_BASE}${id}/`
      const url = `${detailBase}${queryParams.toString() ? '?' + queryParams.toString() : ''}`

      const response = await get<Assignment>(url, {
        showErrorToast: true
      })

      if (response) {
        currentAssignment.value = response
      }

      return response
    } catch (err) {
      console.error('Error fetching assignment:', err)
      return null
    }
  }

  const createAssignment = async (assignmentData: CreateAssignmentRequest) => {
    try {
      const response = await post<Assignment>(ASSIGNMENTS_BASE, assignmentData, {
        showSuccessToast: true,
        successMessage: 'Assignment created successfully',
        showErrorToast: true
      })

      if (response) {
        assignments.value.push(response)
        totalAssignments.value += 1
      }

      return { success: true, data: response }
    } catch (err) {
      console.error('Error creating assignment:', err)
      return { success: false, data: null }
    }
  }

  const updateAssignment = async (id: number, assignmentData: UpdateAssignmentRequest) => {
    try {
      const response = await put<Assignment>(`${ASSIGNMENTS_BASE}${id}/`, assignmentData, {
        showSuccessToast: true,
        successMessage: 'Assignment updated successfully',
        showErrorToast: true
      })

      if (response) {
        const index = assignments.value.findIndex(assignment => assignment.id === id)
        if (index !== -1) {
          assignments.value[index] = response
        }
        currentAssignment.value = response
      }

      return { success: true, data: response }
    } catch (err) {
      console.error('Error updating assignment:', err)
      return { success: false, data: null }
    }
  }

  const deleteAssignment = async (id: number) => {
    try {
      const response = await del(`${ASSIGNMENTS_BASE}${id}/`, {
        showSuccessToast: true,
        successMessage: 'Assignment deleted successfully',
        showErrorToast: true
      })

      // Remove from local state
      assignments.value = assignments.value.filter(assignment => assignment.id !== id)
      if (currentAssignment.value?.id === id) {
        currentAssignment.value = null
      }
      totalAssignments.value = Math.max(0, totalAssignments.value - 1)

      return { success: true, data: response }
    } catch (err) {
      console.error('Error deleting assignment:', err)
      return { success: false, data: null }
    }
  }

  const checkInAssignment = async (id: number, checkInData: CheckInRequest) => {
    try {
      const response = await post<Assignment>(`${ASSIGNMENTS_BASE}${id}/check-in/`, checkInData, {
        showSuccessToast: true,
        successMessage: 'Checked in successfully',
        showErrorToast: true
      })

      if (response) {
        const index = assignments.value.findIndex(assignment => assignment.id === id)
        if (index !== -1) {
          assignments.value[index] = response
        }
        currentAssignment.value = response
      }

      return { success: true, data: response }
    } catch (err) {
      console.error('Error checking in assignment:', err)
      return { success: false, data: null }
    }
  }

  const checkOutAssignment = async (id: number, checkOutData: CheckOutRequest) => {
    try {
      const response = await post<Assignment>(`${ASSIGNMENTS_BASE}${id}/check-out/`, checkOutData, {
        showSuccessToast: true,
        successMessage: 'Checked out successfully',
        showErrorToast: true
      })

      if (response) {
        const index = assignments.value.findIndex(assignment => assignment.id === id)
        if (index !== -1) {
          assignments.value[index] = response
        }
        currentAssignment.value = response
      }

      return { success: true, data: response }
    } catch (err) {
      console.error('Error checking out assignment:', err)
      return { success: false, data: null }
    }
  }

  // Utility methods
  const formatAssignmentDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getAssignmentStatusSeverity = (status: 'TENTATIVE' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED') => {
    const severities = {
      TENTATIVE: 'warning',
      CONFIRMED: 'info',
      IN_PROGRESS: 'success',
      COMPLETED: 'success',
      CANCELLED: 'danger'
    }
    return severities[status] || 'secondary'
  }

  const getAssignmentStatusLabel = (status: 'TENTATIVE' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED') => {
    const labels = {
      TENTATIVE: 'Tentative',
      CONFIRMED: 'Confirmed',
      IN_PROGRESS: 'In Progress',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled'
    }
    return labels[status] || status
  }

  const getRoleLabel = (role: 'Solo' | 'Lead' | 'Support') => {
    const labels = {
      Solo: 'Solo',
      Lead: 'Lead',
      Support: 'Support'
    }
    return labels[role] || role
  }

  return {
    // State
    assignments,
    currentAssignment,
    totalAssignments,
    currentPage,
    totalPages,
    loading,
    error,

    // Computed
    activeAssignments,
    completedAssignments,
    pendingAssignments,

    // Methods
    fetchAssignments,
    getAssignment,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    checkInAssignment,
    checkOutAssignment,

    // Utilities
    getAssignmentDisplayInfo,
    formatAssignmentDate,
    getAssignmentStatusSeverity,
    getAssignmentStatusLabel,
    getRoleLabel
  }
}