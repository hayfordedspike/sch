import { ref, computed } from 'vue'
import { useApi } from './useApi'
import type {
  House,
  CreateHouseRequest,
  UpdateHouseRequest,
  HouseTeam,
  CreateHouseTeamRequest,
  HouseSearchParams,
  HouseDisplayInfo
} from '@/views/Houses/types'

export function useHouses() {
  const { get, post, put, delete: del, loading, error } = useApi()

  const houses = ref<House[]>([])
  const currentHouse = ref<House | null>(null)
  const houseTeams = ref<HouseTeam[]>([])
  const totalHouses = ref(0)
  const currentPage = ref(1)
  const totalPages = ref(1)

  // Computed properties
  const activeHouses = computed(() =>
    houses.value.filter(house => house.name && house.address_line1)
  )

  // Utility functions
  const getHouseDisplayInfo = (house: House): HouseDisplayInfo => {
    const addressParts = [
      house.address_line1,
      house.city,
      house.region,
      house.postal_code
    ].filter(Boolean)

    const fullAddress = addressParts.join(', ')
    const shortAddress = `${house.city}, ${house.region}`

    return {
      fullAddress,
      shortAddress,
      teamCount: 0 // This would be populated if teams data is available
    }
  }

  // API Methods
  const fetchHouses = async (params: HouseSearchParams = {}) => {
    try {
      console.log('Fetching houses with params:', params)

      const queryParams = new URLSearchParams()

      if (params.city) queryParams.append('city', params.city)
      if (params.region) queryParams.append('region', params.region)
      if (params.skip !== undefined) queryParams.append('skip', params.skip.toString())
      if (params.limit !== undefined) queryParams.append('limit', params.limit.toString())

      const url = `/houses/${queryParams.toString() ? '?' + queryParams.toString() : ''}`.replace('/houses?', '/houses/?')
      console.log('Making request to:', url)

      const response = await get<House[]>(url, {
        showErrorToast: true
      })

      if (response) {
        houses.value = response
        totalHouses.value = response.length
        console.log('Fetched houses:', response.length)
      }

      return response
    } catch (err) {
      console.error('Error fetching houses:', err)
      return null
    }
  }

  const getHouse = async (id: number, includeTeams = false) => {
    try {
      const queryParams = new URLSearchParams()
      if (includeTeams) queryParams.append('include_teams', 'true')

      const url = `/houses/${id}${queryParams.toString() ? '?' + queryParams.toString() : ''}`.replace(`/houses${id}?`, `/houses/${id}/?`)
      const response = await get<House>(url, {
        showErrorToast: true
      })

      if (response) {
        currentHouse.value = response
      }

      return response
    } catch (err) {
      console.error('Error fetching house:', err)
      return null
    }
  }

  const createHouse = async (houseData: CreateHouseRequest) => {
    try {
      // Debug: log token before making request
      const token = localStorage.getItem('token')
      console.debug('[Houses] Token before POST /houses:', token)

      const response = await post<House>('/houses/', houseData, {
        showSuccessToast: false,
        showErrorToast: true
      })

      // Debug: log response and check for errors
      console.debug('[Houses] Response from POST /houses:', response)

      if (response) {
        houses.value.push(response)
        totalHouses.value += 1
      }

      return { success: true, data: response }
    } catch (err) {
      console.error('Error creating house:', err)
      return { success: false, data: null }
    }
  }

  const updateHouse = async (id: number, houseData: UpdateHouseRequest) => {
    try {
      const response = await put<House>(`/houses/${id}/`, houseData, {
        showSuccessToast: true,
        successMessage: 'House updated successfully',
        showErrorToast: true
      })

      if (response) {
        const index = houses.value.findIndex(house => house.id === id)
        if (index !== -1) {
          houses.value[index] = response
        }
        currentHouse.value = response
      }

      return { success: true, data: response }
    } catch (err) {
      console.error('Error updating house:', err)
      return { success: false, data: null }
    }
  }

  const deleteHouse = async (id: number) => {
    try {
      const response = await del(`/houses/${id}/`, {
        showSuccessToast: true,
        successMessage: 'House deleted successfully',
        showErrorToast: true
      })

      // Remove from local state
      houses.value = houses.value.filter(house => house.id !== id)
      if (currentHouse.value?.id === id) {
        currentHouse.value = null
      }
      totalHouses.value = Math.max(0, totalHouses.value - 1)

      return { success: true, data: response }
    } catch (err) {
      console.error('Error deleting house:', err)
      return { success: false, data: null }
    }
  }

  // House Teams Management
  const fetchHouseTeams = async (houseId: number) => {
    try {
      const response = await get<HouseTeam[]>(`/houses/${houseId}/teams/`, {
        showErrorToast: false, // Don't show error toast to prevent modal issues
        customErrorHandler: (error) => {
          console.error('Error fetching house teams:', error)
          // Don't redirect on auth errors for this call
        }
      })

      if (response) {
        houseTeams.value = response
      }

      return response
    } catch (err) {
      console.error('Error fetching house teams:', err)
      return null
    }
  }

  const addTeamToHouse = async (houseId: number, teamData: CreateHouseTeamRequest) => {
    try {
      const response = await post<HouseTeam>(`/houses/${houseId}/teams/`, teamData, {
        showSuccessToast: true,
        successMessage: 'Team added to house successfully',
        showErrorToast: true
      })

      if (response) {
        houseTeams.value.push(response)
      }

      return { success: true, data: response }
    } catch (err) {
      console.error('Error adding team to house:', err)
      return { success: false, data: null }
    }
  }

  const removeTeamFromHouse = async (houseId: number, teamId: number) => {
    try {
      const response = await del(`/houses/${houseId}/teams/${teamId}/`, {
        showSuccessToast: true,
        successMessage: 'Team removed from house successfully',
        showErrorToast: true
      })

      // Remove from local state
      houseTeams.value = houseTeams.value.filter(
        houseTeam => !(houseTeam.house_id === houseId && houseTeam.team_id === teamId)
      )

      return { success: true, data: response }
    } catch (err) {
      console.error('Error removing team from house:', err)
      return { success: false, data: null }
    }
  }

  // Utility methods
  const formatHouseDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getHouseInitials = (house: House): string => {
    return house.name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const searchHouses = async (query: string) => {
    if (!query.trim()) {
      // If empty query, fetch all houses
      await fetchHouses()
      return
    }

    try {
      // For now, we'll filter client-side. In a real app, this would be a server-side search
      const searchTerm = query.toLowerCase()
      const allHouses = houses.value.length > 0 ? houses.value : []

      // If we don't have houses loaded, fetch them first
      if (allHouses.length === 0) {
        await fetchHouses()
      }

      const filteredHouses = houses.value.filter(house =>
        house.name.toLowerCase().includes(searchTerm) ||
        house.city.toLowerCase().includes(searchTerm) ||
        house.region.toLowerCase().includes(searchTerm) ||
        house.address_line1.toLowerCase().includes(searchTerm)
      )

      houses.value = filteredHouses
      totalHouses.value = filteredHouses.length
    } catch (err) {
      console.error('Error searching houses:', err)
    }
  }

  const getHousesByRegion = (region: string) => {
    return houses.value.filter(house =>
      house.region.toLowerCase() === region.toLowerCase()
    )
  }

  const getHousesByCity = (city: string) => {
    return houses.value.filter(house =>
      house.city.toLowerCase() === city.toLowerCase()
    )
  }

  return {
    // State
    houses,
    currentHouse,
    houseTeams,
    totalHouses,
    currentPage,
    totalPages,
    loading,
    error,

    // Computed
    activeHouses,

    // Methods
    fetchHouses,
    getHouse,
    createHouse,
    updateHouse,
    deleteHouse,

    // House Teams
    fetchHouseTeams,
    addTeamToHouse,
    removeTeamFromHouse,

    // Utilities
    getHouseDisplayInfo,
    formatHouseDate,
    getHouseInitials,
    searchHouses,
    getHousesByRegion,
    getHousesByCity
  }
}
