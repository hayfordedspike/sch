import { ref, computed } from 'vue'
import type {
  Client,
  CreateClientRequest,
  UpdateClientRequest,
  ClientDisplayInfo,
  ClientSearchParams
} from '@/views/Clients/types'

// Dummy data for clients
const dummyClients: Client[] = [
  {
    id: 1,
    first_name: 'John',
    last_name: 'Smith',
    email: 'john.smith@email.com',
    phone: '+61 412 345 678',
    house_id: 1,
    address_line_1: '123 Collins Street',
    address_line_2: 'Apt 4B',
    city: 'Melbourne',
    state: 'VIC',
    postal_code: '3000',
    country: 'Australia',
    date_of_birth: '1985-03-15',
    emergency_contact_name: 'Sarah Smith',
    emergency_contact_phone: '+61 423 456 789',
    medical_notes: 'No known allergies',
    care_notes: 'Prefers morning appointments',
    is_active: true,
    client_since: '2022-01-15',
    created_at: '2022-01-15T09:00:00Z',
    updated_at: '2024-11-01T10:30:00Z'
  },
  {
    id: 2,
    first_name: 'Emma',
    last_name: 'Johnson',
    email: 'emma.johnson@email.com',
    phone: '+61 487 654 321',
    house_id: 2,
    address_line_1: '456 Queen Street',
    address_line_2: '',
    city: 'Sydney',
    state: 'NSW',
    postal_code: '2000',
    country: 'Australia',
    date_of_birth: '1990-07-22',
    emergency_contact_name: 'Michael Johnson',
    emergency_contact_phone: '+61 434 567 890',
    medical_notes: 'Diabetic - Type 1',
    care_notes: 'Requires insulin management',
    is_active: true,
    client_since: '2021-09-10',
    created_at: '2021-09-10T14:20:00Z',
    updated_at: '2024-10-15T16:45:00Z'
  },
  {
    id: 3,
    first_name: 'Michael',
    last_name: 'Brown',
    email: 'michael.brown@email.com',
    phone: '+61 498 765 432',
    house_id: 1,
    address_line_1: '789 George Street',
    address_line_2: 'Unit 12',
    city: 'Brisbane',
    state: 'QLD',
    postal_code: '4000',
    country: 'Australia',
    date_of_birth: '1978-11-08',
    emergency_contact_name: 'Lisa Brown',
    emergency_contact_phone: '+61 445 678 901',
    medical_notes: 'High blood pressure',
    care_notes: 'Mobility assistance required',
    is_active: false,
    client_since: '2020-05-20',
    created_at: '2020-05-20T11:15:00Z',
    updated_at: '2024-08-30T13:20:00Z'
  },
  {
    id: 4,
    first_name: 'Sarah',
    last_name: 'Wilson',
    email: 'sarah.wilson@email.com',
    phone: '+61 456 789 012',
    house_id: 3,
    address_line_1: '321 Flinders Lane',
    address_line_2: '',
    city: 'Melbourne',
    state: 'VIC',
    postal_code: '3000',
    country: 'Australia',
    date_of_birth: '1993-02-14',
    emergency_contact_name: 'David Wilson',
    emergency_contact_phone: '+61 467 890 123',
    medical_notes: '',
    care_notes: 'Enjoys outdoor activities',
    is_active: true,
    client_since: '2023-03-05',
    created_at: '2023-03-05T08:30:00Z',
    updated_at: '2024-11-05T09:15:00Z'
  },
  {
    id: 5,
    first_name: 'David',
    last_name: 'Miller',
    email: 'david.miller@email.com',
    phone: '+61 478 901 234',
    house_id: 2,
    address_line_1: '654 Bourke Street',
    address_line_2: 'Level 3',
    city: 'Melbourne',
    state: 'VIC',
    postal_code: '3000',
    country: 'Australia',
    date_of_birth: '1982-09-30',
    emergency_contact_name: 'Jennifer Miller',
    emergency_contact_phone: '+61 489 012 345',
    medical_notes: 'Wheelchair user',
    care_notes: 'Requires accessible facilities',
    is_active: true,
    client_since: '2021-11-12',
    created_at: '2021-11-12T15:45:00Z',
    updated_at: '2024-10-20T11:30:00Z'
  },
  {
    id: 6,
    first_name: 'Jessica',
    last_name: 'Davis',
    email: 'jessica.davis@email.com',
    phone: '+61 401 234 567',
    house_id: 0, // No house assigned
    address_line_1: '987 Chapel Street',
    address_line_2: '',
    city: 'South Yarra',
    state: 'VIC',
    postal_code: '3141',
    country: 'Australia',
    date_of_birth: '1987-06-18',
    emergency_contact_name: 'Mark Davis',
    emergency_contact_phone: '+61 412 345 678',
    medical_notes: 'Allergic to penicillin',
    care_notes: 'Prefers female caregivers',
    is_active: true,
    client_since: '2022-08-25',
    created_at: '2022-08-25T12:00:00Z',
    updated_at: '2024-09-10T14:25:00Z'
  },
  {
    id: 7,
    first_name: 'Robert',
    last_name: 'Taylor',
    email: 'robert.taylor@email.com',
    phone: '+61 423 456 789',
    house_id: 1,
    address_line_1: '147 Swanston Street',
    address_line_2: 'Apt 8A',
    city: 'Melbourne',
    state: 'VIC',
    postal_code: '3000',
    country: 'Australia',
    date_of_birth: '1975-12-03',
    emergency_contact_name: 'Mary Taylor',
    emergency_contact_phone: '+61 434 567 890',
    medical_notes: 'Dementia - early stage',
    care_notes: 'Needs routine and familiar faces',
    is_active: true,
    client_since: '2020-02-14',
    created_at: '2020-02-14T10:20:00Z',
    updated_at: '2024-11-08T16:10:00Z'
  },
  {
    id: 8,
    first_name: 'Linda',
    last_name: 'Anderson',
    email: 'linda.anderson@email.com',
    phone: '+61 445 678 901',
    house_id: 3,
    address_line_1: '258 Little Collins Street',
    address_line_2: '',
    city: 'Melbourne',
    state: 'VIC',
    postal_code: '3000',
    country: 'Australia',
    date_of_birth: '1980-04-27',
    emergency_contact_name: 'James Anderson',
    emergency_contact_phone: '+61 456 789 012',
    medical_notes: 'Chronic pain management',
    care_notes: 'Gentle handling required',
    is_active: false,
    client_since: '2021-07-08',
    created_at: '2021-07-08T13:40:00Z',
    updated_at: '2024-07-15T09:50:00Z'
  }
]

export function useClients() {
  const clients = ref<Client[]>([...dummyClients])
  const currentClient = ref<Client | null>(null)
  const totalClients = ref(dummyClients.length)
  const currentPage = ref(1)
  const totalPages = ref(1)
  const loading = ref(false)
  const error = ref<string | null>(null)

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

  // Simulate API delay
  const simulateDelay = (ms: number = 500) => {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Mock API Methods
  const fetchClients = async (params: Partial<ClientSearchParams> = {}) => {
    loading.value = true
    await simulateDelay()

    try {
      let filteredClients = [...dummyClients]

      // Apply filters
      if (params.house_id !== undefined) {
        filteredClients = filteredClients.filter(client => client.house_id === params.house_id)
      }

      if (params.city) {
        filteredClients = filteredClients.filter(client => 
          client.city.toLowerCase().includes(params.city!.toLowerCase())
        )
      }

      if (params.search) {
        const searchTerm = params.search.toLowerCase()
        filteredClients = filteredClients.filter(client =>
          client.first_name.toLowerCase().includes(searchTerm) ||
          client.last_name.toLowerCase().includes(searchTerm) ||
          client.email.toLowerCase().includes(searchTerm) ||
          client.phone.includes(searchTerm)
        )
      }

      // Apply pagination
      const limit = params.limit || 10
      const skip = params.skip || 0
      const paginatedClients = filteredClients.slice(skip, skip + limit)

      clients.value = paginatedClients
      totalClients.value = filteredClients.length
      currentPage.value = Math.floor(skip / limit) + 1
      totalPages.value = Math.ceil(filteredClients.length / limit)

      return paginatedClients
    } catch {
      error.value = 'Failed to fetch clients'
      return null
    } finally {
      loading.value = false
    }
  }

  const getClient = async (id: number) => {
    loading.value = true
    await simulateDelay(300)

    try {
      const client = dummyClients.find(c => c.id === id)
      if (client) {
        currentClient.value = client
        return client
      }
      error.value = 'Client not found'
      return null
    } catch {
      error.value = 'Failed to fetch client'
      return null
    } finally {
      loading.value = false
    }
  }

  const getClientByEmail = async (email: string) => {
    loading.value = true
    await simulateDelay(300)

    try {
      const client = dummyClients.find(c => c.email.toLowerCase() === email.toLowerCase())
      if (client) {
        currentClient.value = client
        return client
      }
      error.value = 'Client not found'
      return null
    } catch {
      error.value = 'Failed to fetch client'
      return null
    } finally {
      loading.value = false
    }
  }

  const createClient = async (clientData: CreateClientRequest) => {
    loading.value = true
    await simulateDelay(800)

    try {
      const newClient: Client = {
        id: Math.max(...dummyClients.map(c => c.id)) + 1,
        ...clientData,
        address_line_2: clientData.address_line_2 || '',
        medical_notes: clientData.medical_notes || '',
        care_notes: clientData.care_notes || '',
        is_active: clientData.is_active ?? true,
        client_since: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      dummyClients.push(newClient)
      clients.value.push(newClient)
      totalClients.value += 1

      return { success: true, data: newClient }
    } catch {
      error.value = 'Failed to create client'
      return { success: false, data: null }
    } finally {
      loading.value = false
    }
  }

  const updateClient = async (id: number, clientData: UpdateClientRequest) => {
    loading.value = true
    await simulateDelay(600)

    try {
      const index = dummyClients.findIndex(c => c.id === id)
      if (index === -1) {
        error.value = 'Client not found'
        return { success: false, data: null }
      }

      const updatedClient: Client = {
        ...dummyClients[index],
        ...clientData,
        updated_at: new Date().toISOString()
      }

      dummyClients[index] = updatedClient
      
      const clientIndex = clients.value.findIndex(c => c.id === id)
      if (clientIndex !== -1) {
        clients.value[clientIndex] = updatedClient
      }

      if (currentClient.value?.id === id) {
        currentClient.value = updatedClient
      }

      return { success: true, data: updatedClient }
    } catch {
      error.value = 'Failed to update client'
      return { success: false, data: null }
    } finally {
      loading.value = false
    }
  }

  const deleteClient = async (id: number) => {
    loading.value = true
    await simulateDelay(400)

    try {
      const index = dummyClients.findIndex(c => c.id === id)
      if (index === -1) {
        error.value = 'Client not found'
        return { success: false, data: null }
      }

      dummyClients.splice(index, 1)
      clients.value = clients.value.filter(c => c.id !== id)
      
      if (currentClient.value?.id === id) {
        currentClient.value = null
      }

      totalClients.value = Math.max(0, totalClients.value - 1)

      return { success: true, data: null }
    } catch {
      error.value = 'Failed to delete client'
      return { success: false, data: null }
    } finally {
      loading.value = false
    }
  }

  const activateClient = async (id: number) => {
    loading.value = true
    await simulateDelay(300)

    try {
      const index = dummyClients.findIndex(c => c.id === id)
      if (index === -1) {
        error.value = 'Client not found'
        return { success: false, data: null }
      }

      dummyClients[index].is_active = true
      dummyClients[index].updated_at = new Date().toISOString()

      const clientIndex = clients.value.findIndex(c => c.id === id)
      if (clientIndex !== -1) {
        clients.value[clientIndex].is_active = true
        clients.value[clientIndex].updated_at = new Date().toISOString()
      }

      if (currentClient.value?.id === id) {
        currentClient.value.is_active = true
        currentClient.value.updated_at = new Date().toISOString()
      }

      return { success: true, data: dummyClients[index] }
    } catch {
      error.value = 'Failed to activate client'
      return { success: false, data: null }
    } finally {
      loading.value = false
    }
  }

  const deactivateClient = async (id: number) => {
    loading.value = true
    await simulateDelay(300)

    try {
      const index = dummyClients.findIndex(c => c.id === id)
      if (index === -1) {
        error.value = 'Client not found'
        return { success: false, data: null }
      }

      dummyClients[index].is_active = false
      dummyClients[index].updated_at = new Date().toISOString()

      const clientIndex = clients.value.findIndex(c => c.id === id)
      if (clientIndex !== -1) {
        clients.value[clientIndex].is_active = false
        clients.value[clientIndex].updated_at = new Date().toISOString()
      }

      if (currentClient.value?.id === id) {
        currentClient.value.is_active = false
        currentClient.value.updated_at = new Date().toISOString()
      }

      return { success: true, data: dummyClients[index] }
    } catch {
      error.value = 'Failed to deactivate client'
      return { success: false, data: null }
    } finally {
      loading.value = false
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