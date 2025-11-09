import { ref } from 'vue'
import type { House } from '@/views/Houses/types'

// Dummy houses data
const dummyHouses: House[] = [
  {
    id: 1,
    name: 'Home Cleaning',
    address_line1: '123 Collins Street',
    address_line2: 'Suite 100',
    city: 'Melbourne',
    region: 'VIC',
    postal_code: '3000',
    country: 'Australia',
    phone: '+61 3 9123 4567',
    email: 'melbourne@scheduler.com',
    note: 'Main facility in Melbourne CBD',
    created_at: '2020-01-15T09:00:00Z',
    updated_at: '2024-11-01T10:30:00Z'
  },
  {
    id: 2,
    name: 'Laundry Service',
    address_line1: '456 George Street',
    city: 'Sydney',
    region: 'NSW',
    postal_code: '2000',
    country: 'Australia',
    phone: '+61 2 8234 5678',
    email: 'sydney@scheduler.com',
    note: 'Premium harbor-side location',
    created_at: '2020-03-20T11:15:00Z',
    updated_at: '2024-10-20T14:20:00Z'
  },
  {
    id: 3,
    name: 'Elderly Nursing',
    address_line1: '789 Queen Street',
    address_line2: 'Level 5',
    city: 'Brisbane',
    region: 'QLD',
    postal_code: '4000',
    country: 'Australia',
    phone: '+61 7 3345 6789',
    email: 'brisbane@scheduler.com',
    note: 'Riverside facility with garden access',
    created_at: '2020-06-10T13:30:00Z',
    updated_at: '2024-11-05T09:45:00Z'
  },
  {
    id: 4,
    name: 'Other',
    address_line1: '321 Murray Street',
    city: 'Perth',
    region: 'WA',
    postal_code: '6000',
    country: 'Australia',
    phone: '+61 8 9456 7890',
    email: 'perth@scheduler.com',
    note: 'Peaceful hills location',
    created_at: '2021-02-14T10:20:00Z',
    updated_at: '2024-09-15T12:30:00Z'
  },

]

export function useHousesDummy() {
  const houses = ref<House[]>([...dummyHouses])
  const loading = ref(false)
  const totalHouses = ref(dummyHouses.length)

  // Simulate API delay
  const simulateDelay = (ms: number = 300) => {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  const fetchHouses = async (params: { limit?: number } = {}) => {
    loading.value = true
    await simulateDelay()

    try {
      const limit = params.limit || 100
      const housesToReturn = dummyHouses.slice(0, limit)

      houses.value = housesToReturn
      totalHouses.value = housesToReturn.length

      return housesToReturn
    } finally {
      loading.value = false
    }
  }

  return {
    houses,
    loading,
    totalHouses,
    fetchHouses
  }
}

// Export as both useHousesDummy and useHouses for compatibility
export const useHouses = useHousesDummy
