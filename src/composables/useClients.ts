import { ref, computed } from 'vue'
import { useApi } from './useApi'
import { useToast } from 'primevue/usetoast'
import { formatInternationalPhone } from '@/lib/phone'
import type {
  Client,
  CreateClientRequest,
  UpdateClientRequest,
  ClientSearchParams,
  ClientDisplayInfo
} from '@/views/Clients/types'

export function useClients() {
  const { get, post, put, delete: del, loading, error } = useApi()
  const toast = useToast()

  const clients = ref<Client[]>([])
  const currentClient = ref<Client | null>(null)
  const totalClients = ref(0)
  const currentPage = ref(1)
  const totalPages = ref(1)

  // Computed properties
  const activeClients = computed(() =>
    clients.value.filter(client => client.is_active)
  )

  const inactiveClients = computed(() =>
    clients.value.filter(client => !client.is_active)
  )

  // Utility functions
  const getClientDisplayInfo = (client: Client): ClientDisplayInfo => {
    const fullName = `${client.first_name} ${client.last_name}`.trim()

    const addressParts = [
      client.address_line_1,
      client.address_line_2,
      client.city,
      client.state,
      client.postal_code
    ].filter(Boolean)
    const fullAddress = addressParts.join(', ')
    const shortAddress = `${client.city}, ${client.state}`

    const birthDate = new Date(client.date_of_birth)
    const today = new Date()
    const age = Math.floor((today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))

    return {
      fullName,
      fullAddress,
      shortAddress,
      age,
      isActive: client.is_active
    }
  }

  // API Methods
  const fetchClients = async (params: ClientSearchParams = {}) => {
    try {
      const queryParams = new URLSearchParams()

      if (params.skip !== undefined) queryParams.append('skip', params.skip.toString())
      if (params.limit !== undefined) queryParams.append('limit', params.limit.toString())
      if (params.is_active !== undefined) queryParams.append('is_active', params.is_active.toString())
      if (params.house_id !== undefined) queryParams.append('house_id', params.house_id.toString())
      if (params.city) queryParams.append('city', params.city)
      if (params.search) queryParams.append('search', params.search)

      const url = `/clients/${queryParams.toString() ? '?' + queryParams.toString() : ''}`.replace('/clients?', '/clients/?')
      const response = await get<Client[]>(url, {
        showErrorToast: true
      })

      if (response) {
        clients.value = response
        totalClients.value = response.length
      }

      return response
    } catch (err: any) {
      if (err?.response?.data?.detail === 'Not authenticated') {
        toast.add({
          severity: 'error',
          summary: 'Authentication Error',
          detail: 'You are not authenticated. Please sign in again.',
          life: 4000
        })
      }
      console.error('Error fetching clients:', err)
      return null
    }
  }

  const getClient = async (id: number, includeHouse = false, includeVisits = false) => {
    try {
      const queryParams = new URLSearchParams()
      if (includeHouse) queryParams.append('include_house', 'true')
      if (includeVisits) queryParams.append('include_visits', 'true')

      const url = `/clients/${id}${queryParams.toString() ? '?' + queryParams.toString() : ''}`.replace(`/clients${id}?`, `/clients/${id}/?`)
      const response = await get<Client>(url, {
        showErrorToast: true
      })

      if (response) {
        currentClient.value = response
      }

      return response
    } catch (err: any) {
      if (err?.response?.data?.detail === 'Not authenticated') {
        toast.add({
          severity: 'error',
          summary: 'Authentication Error',
          detail: 'You are not authenticated. Please sign in again.',
          life: 4000
        })
      }
      console.error('Error fetching client:', err)
      return null
    }
  }

  const getClientByEmail = async (email: string) => {
    try {
      const encodedEmail = encodeURIComponent(email)
      const response = await get<Client>(`/clients/email/${encodedEmail}/`, {
        showErrorToast: true
      })

      if (response) {
        currentClient.value = response
      }

      return response
    } catch (err: any) {
      if (err?.response?.data?.detail === 'Not authenticated') {
        toast.add({
          severity: 'error',
          summary: 'Authentication Error',
          detail: 'You are not authenticated. Please sign in again.',
          life: 4000
        })
      }
      console.error('Error fetching client by email:', err)
      return null
    }
  }

  const createClient = async (clientData: CreateClientRequest) => {
    try {
      const response = await post<Client>('/clients/', clientData, {
        showSuccessToast: false,
        showErrorToast: true
      })

      if (response) {
        clients.value.push(response)
        totalClients.value += 1
      }

      return { success: true, data: response }
    } catch (err: any) {
      if (err?.response?.data?.detail === 'Not authenticated') {
        toast.add({
          severity: 'error',
          summary: 'Authentication Error',
          detail: 'You are not authenticated. Please sign in again.',
          life: 4000
        })
      }
      console.error('Error creating client:', err)
      return { success: false, data: null }
    }
  }

  const updateClient = async (id: number, clientData: UpdateClientRequest) => {
    try {
      const response = await put<Client>(`/clients/${id}/`, clientData, {
        showSuccessToast: false,
        showErrorToast: true
      })

      if (response) {
        const index = clients.value.findIndex(client => client.id === id)
        if (index !== -1) {
          clients.value[index] = response
        }
        currentClient.value = response
      }

      return { success: true, data: response }
    } catch (err: any) {
      if (err?.response?.data?.detail === 'Not authenticated') {
        toast.add({
          severity: 'error',
          summary: 'Authentication Error',
          detail: 'You are not authenticated. Please sign in again.',
          life: 4000
        })
      }
      console.error('Error updating client:', err)
      return { success: false, data: null }
    }
  }

  const deleteClient = async (id: number) => {
    try {
      const response = await del(`/clients/${id}/`, {
        showSuccessToast: true,
        successMessage: 'Client deleted successfully',
        showErrorToast: true
      })

      // Remove from local state
      clients.value = clients.value.filter(client => client.id !== id)
      if (currentClient.value?.id === id) {
        currentClient.value = null
      }
      totalClients.value = Math.max(0, totalClients.value - 1)

      return { success: true, data: response }
    } catch (err: any) {
      if (err?.response?.data?.detail === 'Not authenticated') {
        toast.add({
          severity: 'error',
          summary: 'Authentication Error',
          detail: 'You are not authenticated. Please sign in again.',
          life: 4000
        })
      }
      console.error('Error deleting client:', err)
      return { success: false, data: null }
    }
  }

  const activateClient = async (id: number) => {
    try {
      const response = await post<Client>(`/clients/${id}/activate/`, {}, {
        showSuccessToast: true,
        successMessage: 'Client activated successfully',
        showErrorToast: true
      })

      if (response) {
        const index = clients.value.findIndex(client => client.id === id)
        if (index !== -1) {
          clients.value[index] = response
        }
        if (currentClient.value?.id === id) {
          currentClient.value = response
        }
      }

      return { success: true, data: response }
    } catch (err: any) {
      if (err?.response?.data?.detail === 'Not authenticated') {
        toast.add({
          severity: 'error',
          summary: 'Authentication Error',
          detail: 'You are not authenticated. Please sign in again.',
          life: 4000
        })
      }
      console.error('Error activating client:', err)
      return { success: false, data: null }
    }
  }

  const deactivateClient = async (id: number) => {
    try {
      const response = await post<Client>(`/clients/${id}/deactivate/`, {}, {
        showSuccessToast: true,
        successMessage: 'Client deactivated successfully',
        showErrorToast: true
      })

      if (response) {
        const index = clients.value.findIndex(client => client.id === id)
        if (index !== -1) {
          clients.value[index] = response
        }
        if (currentClient.value?.id === id) {
          currentClient.value = response
        }
      }

      return { success: true, data: response }
    } catch (err: any) {
      if (err?.response?.data?.detail === 'Not authenticated') {
        toast.add({
          severity: 'error',
          summary: 'Authentication Error',
          detail: 'You are not authenticated. Please sign in again.',
          life: 4000
        })
      }
      console.error('Error deactivating client:', err)
      return { success: false, data: null }
    }
  }

  // Utility methods
  const formatClientDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatClientPhone = (phone: string) => {
    return formatInternationalPhone(phone)
  }

  const getClientStatusSeverity = (isActive: boolean) => {
    return isActive ? 'success' : 'danger'
  }

  const getClientStatusLabel = (isActive: boolean) => {
    return isActive ? 'Active' : 'Inactive'
  }

  return {
    // State
    clients,
    currentClient,
    totalClients,
    currentPage,
    totalPages,
    loading,
    error,

    // Computed
    activeClients,
    inactiveClients,

    // Methods
    fetchClients,
    getClient,
    getClientByEmail,
    createClient,
    updateClient,
    deleteClient,
    activateClient,
    deactivateClient,

    // Utilities
    getClientDisplayInfo,
    formatClientDate,
    formatClientPhone,
    getClientStatusSeverity,
    getClientStatusLabel
  }
}
