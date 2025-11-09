import { ref, computed } from 'vue'
import { useApi } from './useApi'
import type {
  Client,
  CreateClientRequest,
  UpdateClientRequest,
  ClientListResponse,
  ClientSearchParams,
  ClientDisplayInfo
} from '@/views/Clients/types'

export function useClients() {
  const { get, post, put, delete: del, loading, error } = useApi()

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
      client.postal_code,
      client.country
    ].filter(Boolean)
    const fullAddress = addressParts.join(', ')

    const birthDate = new Date(client.date_of_birth)
    const today = new Date()
    const age = Math.floor((today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))

    const clientSince = new Date(client.client_since)
    const membershipYears = Math.floor((today.getTime() - clientSince.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    const membershipMonths = Math.floor(((today.getTime() - clientSince.getTime()) % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000))

    let membershipDuration = ''
    if (membershipYears > 0) {
      membershipDuration = `${membershipYears} year${membershipYears > 1 ? 's' : ''}`
      if (membershipMonths > 0) {
        membershipDuration += ` ${membershipMonths} month${membershipMonths > 1 ? 's' : ''}`
      }
    } else if (membershipMonths > 0) {
      membershipDuration = `${membershipMonths} month${membershipMonths > 1 ? 's' : ''}`
    } else {
      membershipDuration = 'Less than a month'
    }

    return {
      fullName,
      fullAddress,
      age,
      membershipDuration,
      status: client.is_active ? 'active' : 'inactive'
    }
  }

  // API Methods
  const fetchClients = async (params: ClientSearchParams = {}) => {
    try {
      const queryParams = new URLSearchParams()

      if (params.skip !== undefined) queryParams.append('skip', params.skip.toString())
      if (params.limit !== undefined) queryParams.append('limit', params.limit.toString())
      if (params.house_id !== undefined) queryParams.append('house_id', params.house_id.toString())
      if (params.city) queryParams.append('city', params.city)
      if (params.search) queryParams.append('search', params.search)

      const url = `/clients/?${queryParams.toString()}`
      const response = await get<Client[]>(url, {
        showErrorToast: true
      })

      if (response) {
        // Handle both array response and paginated response
        if (Array.isArray(response)) {
          clients.value = response
          totalClients.value = response.length
        } else {
          // If response has pagination data
          const paginatedResponse = response as unknown as ClientListResponse
          clients.value = paginatedResponse.clients || response as Client[]
          totalClients.value = paginatedResponse.total || clients.value.length
          currentPage.value = paginatedResponse.page || 1
          totalPages.value = paginatedResponse.pages || 1
        }
      }

      return response
    } catch (err) {
      console.error('Error fetching clients:', err)
      return null
    }
  }

  const getClient = async (id: number, includeHouse = false, includeVisits = false) => {
    try {
      const queryParams = new URLSearchParams()
      if (includeHouse) queryParams.append('include_house', 'true')
      if (includeVisits) queryParams.append('include_visits', 'true')

      const url = `/clients/${id}${queryParams.toString() ? '?' + queryParams.toString() : ''}`
      const response = await get<Client>(url, {
        showErrorToast: true
      })

      if (response) {
        currentClient.value = response
      }

      return response
    } catch (err) {
      console.error('Error fetching client:', err)
      return null
    }
  }

  const getClientByEmail = async (email: string) => {
    try {
      const encodedEmail = encodeURIComponent(email)
      const response = await get<Client>(`/clients/email/${encodedEmail}`, {
        showErrorToast: true
      })

      if (response) {
        currentClient.value = response
      }

      return response
    } catch (err) {
      console.error('Error fetching client by email:', err)
      return null
    }
  }

  const createClient = async (clientData: CreateClientRequest) => {
    try {
      const response = await post<Client>('/clients', clientData, {
        showSuccessToast: true,
        successMessage: 'Client created successfully',
        showErrorToast: true
      })

      if (response) {
        clients.value.push(response)
        totalClients.value += 1
      }

      return { success: true, data: response }
    } catch (err) {
      console.error('Error creating client:', err)
      return { success: false, data: null }
    }
  }

  const updateClient = async (id: number, clientData: UpdateClientRequest) => {
    try {
      const response = await put<Client>(`/clients/${id}`, clientData, {
        showSuccessToast: true,
        successMessage: 'Client updated successfully',
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
    } catch (err) {
      console.error('Error updating client:', err)
      return { success: false, data: null }
    }
  }

  const deleteClient = async (id: number) => {
    try {
      const response = await del(`/clients/${id}`, {
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
    } catch (err) {
      console.error('Error deleting client:', err)
      return { success: false, data: null }
    }
  }

  const activateClient = async (id: number) => {
    try {
      const response = await post<Client>(`/clients/${id}/activate`, {}, {
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
    } catch (err) {
      console.error('Error activating client:', err)
      return { success: false, data: null }
    }
  }

  const deactivateClient = async (id: number) => {
    try {
      const response = await post<Client>(`/clients/${id}/deactivate`, {}, {
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
    } catch (err) {
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
    // Basic phone formatting - can be enhanced based on requirements
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phone
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
