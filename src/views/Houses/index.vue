<template>
  <div class="p-6 bg-white min-h-screen">
    <!-- Header Section -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">House Management</h1>
        <p class="text-gray-600 mt-1">Manage houses and their details</p>
      </div>
      <GlobalButton
        label="Add House"
        icon="pi pi-plus"
        @click="showAddDialog = true"
        class="bg-blue-600 hover:bg-blue-700"
      />
    </div>

    <!-- Search and Filters -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="flex flex-col sm:flex-row gap-4 items-center">
        <div class="flex-1">
          <SearchBar
            v-model="searchQuery"
            placeholder="Search houses by name, city, or region..."
            @search="handleSearch"
          />
        </div>
        <div class="flex gap-2">
          <GlobalButton
            label="Reset"
            icon="pi pi-refresh"
            outlined
            @click="resetFilters"
          />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <LoadingSpinner message="Loading houses..." />
    </div>

    <!-- Houses Grid -->
    <div v-else-if="houses.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <HouseCard
        v-for="house in houses"
        :key="house.id"
        :house="house"
        @edit="editHouse"
        @delete="confirmDelete"
        @view-teams="viewHouseTeams"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <div class="text-gray-400 mb-4">
        <i class="pi pi-home text-6xl"></i>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No houses found</h3>
      <p class="text-gray-600 mb-4">
        {{ searchQuery ? 'No houses match your search criteria.' : 'Get started by adding your first house.' }}
      </p>
      <GlobalButton
        v-if="!searchQuery"
        label="Add First House"
        icon="pi pi-plus"
        @click="showAddDialog = true"
        class="bg-blue-600 hover:bg-blue-700"
      />
    </div>

    <!-- Pagination -->
    <div v-if="houses.length > 0 && totalHouses > limit" class="flex justify-center mt-8">
      <Paginator
        :first="(currentPage - 1) * limit"
        :rows="limit"
        :totalRecords="totalHouses"
        @page="handlePageChange"
      />
    </div>

    <!-- Add/Edit House Dialog -->
    <AddHouseDialog
      v-model:visible="showAddDialog"
      :house="selectedHouse"
      @house-added="handleHouseAdded"
      @house-updated="handleHouseUpdated"
    />

    <!-- House Teams Dialog -->
    <HouseTeamsDialog
      v-model:visible="showTeamsDialog"
      :house="selectedHouse"
    />

    <!-- Delete Confirmation Dialog -->
    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'HousesView' })

import { ref, onMounted, watch } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { useHouses } from '@/composables/useHouses'
import { useDebounce } from '@/composables/useDebounce'
import type { House } from './types'

// Components
import GlobalButton from '@/components/shared/GlobalButton.vue'
import Paginator from 'primevue/paginator'
import ConfirmDialog from 'primevue/confirmdialog'
import SearchBar from '@/components/layout/SearchBar.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import HouseCard from './components/HouseCard.vue'
import AddHouseDialog from './components/AddHouseDialog.vue'
import HouseTeamsDialog from './components/HouseTeamsDialog.vue'

// Composables
const confirm = useConfirm()
const toast = useToast()
const {
  houses,
  loading,
  totalHouses,
  fetchHouses,
  deleteHouse,
  searchHouses
} = useHouses()

// Reactive state
const searchQuery = ref('')
const showAddDialog = ref(false)
const showTeamsDialog = ref(false)
const selectedHouse = ref<House | null>(null)
const currentPage = ref(1)
const limit = ref(12)

// Debounced search function
const debouncedSearch = useDebounce(() => {
  currentPage.value = 1
  fetchHousesData()
}, 300)

// Methods
const handleSearch = (query: string) => {
  searchQuery.value = query
  currentPage.value = 1
  fetchHousesData()
}

const resetFilters = () => {
  searchQuery.value = ''
  currentPage.value = 1
  fetchHousesData()
}

const fetchHousesData = async () => {
  const params = {
    page: currentPage.value,
    limit: limit.value
  }

  if (searchQuery.value.trim()) {
    await searchHouses(searchQuery.value.trim())
  } else {
    await fetchHouses(params)
  }
}

const handlePageChange = (event: { first: number; rows: number }) => {
  currentPage.value = Math.floor(event.first / event.rows) + 1
  fetchHousesData()
}

const editHouse = (house: House) => {
  selectedHouse.value = house
  showAddDialog.value = true
}

const confirmDelete = (house: House) => {
  confirm.require({
    message: `Are you sure you want to delete "${house.name}"? This action cannot be undone.`,
    header: 'Delete House',
    icon: 'pi pi-exclamation-triangle',
    rejectClass: 'p-button-secondary p-button-outlined',
    acceptClass: 'p-button-danger',
    rejectLabel: 'Cancel',
    acceptLabel: 'Delete',
    accept: () => handleDelete(house.id)
  })
}

const handleDelete = async (houseId: number) => {
  const result = await deleteHouse(houseId)
  if (result?.success) {
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'House deleted successfully',
      life: 3000
    })
    fetchHousesData()
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to delete house',
      life: 5000
    })
  }
}

const viewHouseTeams = (house: House) => {
  selectedHouse.value = house
  showTeamsDialog.value = true
}

const handleHouseAdded = () => {
  showAddDialog.value = false
  selectedHouse.value = null
  fetchHousesData()
  toast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'House added successfully',
    life: 3000
  })
}

const handleHouseUpdated = () => {
  showAddDialog.value = false
  selectedHouse.value = null
  fetchHousesData()
  toast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'House updated successfully',
    life: 3000
  })
}

// Watch for debounced search changes
watch(searchQuery, () => {
  debouncedSearch()
})

// Lifecycle
onMounted(() => {
  fetchHousesData()
})
</script>

<style scoped>
/* Custom styles for houses management */
</style>
