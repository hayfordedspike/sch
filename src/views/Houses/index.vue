<template>
  <div class="p-6 bg-white min-h-screen">
    <!-- Header Section -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Houses</h1>
        <p class="text-gray-600 mt-1">Manage houses and their details</p>
      </div>
      <GlobalButton
        label="Add House"
        icon="pi pi-plus"
        @click="showAddDialog = true"
        class="bg-blue-600 hover:bg-blue-700"
      />
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <LoadingSpinner message="Loading houses..." />
    </div>


    <!-- View Switcher -->
    <div v-if="houses.length > 0" class="flex justify-end mb-4 gap-2">
      <GlobalButton
        :label="'Card View'"
        :severity="viewMode === 'card' ? 'primary' : 'warning'"
        :outlined="viewMode === 'table'"
        class="min-w-[120px]"
        @click="viewMode = 'card'"
      />
      <GlobalButton
        :label="'Table View'"
        :severity="viewMode === 'table' ? 'primary' : 'warning'"
        :outlined="viewMode === 'card'"
        class="min-w-[120px]"
        @click="viewMode = 'table'"
      />
    </div>

    <!-- Houses Data -->
    <div v-if="houses.length > 0 && viewMode === 'card'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <HouseCard
        v-for="house in houses"
        :key="house.id"
        :house="house"
        @edit="editHouse"
        @delete="confirmDelete"
        @view-teams="viewHouseTeams"
      />
    </div>
    <div v-else-if="houses.length > 0 && viewMode === 'table'">
      <HouseTable
        :houses="houses"
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
        Get started by adding your first house.
      </p>
      <GlobalButton
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
import HouseTable from './components/HouseTable.vue'
defineOptions({ name: 'HousesView' })

import { ref, onMounted, watch } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { useHouses } from '@/composables/useHouses'
import type { House } from './types'

// Components
import GlobalButton from '@/components/shared/GlobalButton.vue'
import Paginator from 'primevue/paginator'
import ConfirmDialog from 'primevue/confirmdialog'
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
  deleteHouse
} = useHouses()

// Reactive state
const showAddDialog = ref(false)
const showTeamsDialog = ref(false)
const selectedHouse = ref<House | null>(null)
const currentPage = ref(1)
const limit = ref(12)
const viewMode = ref<'card' | 'table'>('card')

// Methods
const fetchHousesData = async () => {
  const params = {
    page: currentPage.value,
    limit: limit.value
  }

  await fetchHouses(params)
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

// Lifecycle
onMounted(() => {
  fetchHousesData()
})
</script>

<style scoped>
/* Custom styles for houses management */
</style>
