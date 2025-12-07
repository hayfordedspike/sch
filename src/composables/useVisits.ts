import { ref, computed } from 'vue'
import { useApi } from './useApi'
import type {
  Visit,
  CreateVisitRequest,
  UpdateVisitRequest,
  VisitSearchParams,
  VisitDisplayInfo
} from '@/views/Roster/types'

export function useVisits() {
  const { get, post, put, delete: del, loading, error } = useApi()

  const visits = ref<Visit[]>([])
  const currentVisit = ref<Visit | null>(null)
  const totalVisits = ref(0)
  const currentPage = ref(1)
  const totalPages = ref(1)

  // Computed properties
  const activeVisits = computed(() =>
    visits.value.filter(visit => new Date(visit.end_at) > new Date())
  )

  const completedVisits = computed(() =>
    visits.value.filter(visit => new Date(visit.end_at) <= new Date())
  )

  // Utility functions
  const getVisitDisplayInfo = (visit: Visit): VisitDisplayInfo => {
    const startDate = new Date(visit.start_at)
    const endDate = new Date(visit.end_at)
    const now = new Date()

    let status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
    let statusLabel: string
    if (endDate < now) {
      status = 'completed'
      statusLabel = 'Completed'
    } else if (startDate <= now && endDate >= now) {
      status = 'in_progress'
      statusLabel = 'In Progress'
    } else {
      status = 'scheduled'
      statusLabel = 'Scheduled'
    }

    const duration = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)) // hours

    const clientLabel = visit.client_id ? `Client #${visit.client_id}` : 'No client assigned'
    const houseLabel = visit.house_id ? `House #${visit.house_id}` : 'No house assigned'

    return {
      id: visit.id,
      clientName: clientLabel,
      houseName: houseLabel,
      startDate: startDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      endDate: endDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      duration: `${duration} hours`,
      requiredStaff: visit.required_staff_count,
      notes: visit.notes,
      status,
      statusLabel
    }
  }

  // API Methods
  const fetchVisits = async (params: VisitSearchParams = {}) => {
    try {
      const queryParams = new URLSearchParams()

      if (params.client_id !== undefined) queryParams.append('client_id', params.client_id.toString())
      if (params.house_id !== undefined) queryParams.append('house_id', params.house_id.toString())
      if (params.start_date) queryParams.append('start_date', params.start_date)
      if (params.end_date) queryParams.append('end_date', params.end_date)
      if (params.skip !== undefined) queryParams.append('skip', params.skip.toString())
      if (params.limit !== undefined) queryParams.append('limit', params.limit.toString())

      const url = `/visits/${queryParams.toString() ? '?' + queryParams.toString() : ''}`

      const response = await get<Visit[] | { data: Visit[] }>(url, {
        showErrorToast: true
      })

      console.log('API response for visits:', response)
      if (Array.isArray(response)) {
        visits.value = response
        totalVisits.value = response.length
        console.log('Visits array after assignment:', visits.value)
      } else if (response && Array.isArray(response.data)) {
        visits.value = response.data
        totalVisits.value = response.data.length
        console.log('Visits array after assignment (from .data):', visits.value)
      } else {
        visits.value = []
        totalVisits.value = 0
        console.warn('Visits response was not an array:', response)
      }

      return response
    } catch (err) {
      console.error('Error fetching visits:', err)
      return null
    }
  }

  const getVisit = async (id: number, includeRelationships = false) => {
    try {
      const queryParams = new URLSearchParams()
      if (includeRelationships) queryParams.append('include_relationships', 'true')

      const url = `/visits/${id}${queryParams.toString() ? '?' + queryParams.toString() : ''}`

      const response = await get<Visit>(url, {
        showErrorToast: true
      })

      if (response) {
        currentVisit.value = response
      }

      return response
    } catch (err) {
      console.error('Error fetching visit:', err)
      return null
    }
  }

  const createVisit = async (visitData: CreateVisitRequest) => {
    try {
      const response = await post<Visit>('/visits/', visitData, {
        showSuccessToast: true,
        successMessage: 'Visit created successfully',
        showErrorToast: true
      })

      if (response) {
        visits.value.push(response)
        totalVisits.value += 1
      }

      return { success: true, data: response }
    } catch (err) {
      console.error('Error creating visit:', err)
      return { success: false, data: null }
    }
  }

  const updateVisit = async (id: number, visitData: UpdateVisitRequest) => {
    try {
      const response = await put<Visit>(`/visits/${id}`, visitData, {
        showSuccessToast: true,
        successMessage: 'Visit updated successfully',
        showErrorToast: true
      })

      if (response) {
        const index = visits.value.findIndex(visit => visit.id === id)
        if (index !== -1) {
          visits.value[index] = response
        }
        currentVisit.value = response
      }

      return { success: true, data: response }
    } catch (err) {
      console.error('Error updating visit:', err)
      return { success: false, data: null }
    }
  }

  const deleteVisit = async (id: number) => {
    try {
      const response = await del(`/visits/${id}`, {
        showSuccessToast: true,
        successMessage: 'Visit deleted successfully',
        showErrorToast: true
      })

      // Remove from local state
      visits.value = visits.value.filter(visit => visit.id !== id)
      if (currentVisit.value?.id === id) {
        currentVisit.value = null
      }
      totalVisits.value = Math.max(0, totalVisits.value - 1)

      return { success: true, data: response }
    } catch (err) {
      console.error('Error deleting visit:', err)
      return { success: false, data: null }
    }
  }

  // Utility methods
  const formatVisitDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return {
    // State
    visits,
    currentVisit,
    totalVisits,
    currentPage,
    totalPages,
    loading,
    error,

    // Computed
    activeVisits,
    completedVisits,

    // Methods
    fetchVisits,
    getVisit,
    createVisit,
    updateVisit,
    deleteVisit,

    // Utilities
    getVisitDisplayInfo,
    formatVisitDate
  }
}