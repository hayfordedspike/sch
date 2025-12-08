<template>
  <div class="visit-management">
    <!-- Header with Actions -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Visit Management</h2>
        <p class="text-muted mt-1">Manage client visits and schedules</p>
      </div>

      <div class="flex gap-3">
        <Button
          label="Add Visit"
          icon="pi pi-plus"
          class="bg-blue-600 hover:bg-blue-700 border-0 text-white"
          @click="showAddDialog = true"
        />
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="roster-panel rounded-lg border border-gray-200 p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="field">
          <label class="block text-sm font-medium text-gray-700 mb-2">Client</label>
          <Dropdown
            v-model="filters.client_id"
            :options="clientOptions"
            option-label="label"
            option-value="value"
            placeholder="All Clients"
            class="w-full"
            :loading="clientsLoading"
            show-clear
          />
        </div>

        <div class="field">
          <label class="block text-sm font-medium text-gray-700 mb-2">House</label>
          <Dropdown
            v-model="filters.house_id"
            :options="houseOptions"
            option-label="label"
            option-value="value"
            placeholder="All Houses"
            class="w-full"
            :loading="housesLoading"
            show-clear
          />
        </div>

        <div class="field">
          <label class="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
          <Calendar
            v-model="startDate"
            placeholder="From Date"
            class="w-full"
            show-icon
            date-format="yy-mm-dd"
          />
        </div>

        <div class="field">
          <label class="block text-sm font-medium text-gray-700 mb-2">End Date</label>
          <Calendar
            v-model="endDate"
            placeholder="To Date"
            class="w-full"
            show-icon
            date-format="yy-mm-dd"
          />
        </div>
      </div>

      <div class="flex gap-3 mt-4">
        <Button
          label="Search"
          icon="pi pi-search"
          @click="handleSearch"
          :loading="loading"
        />
        <Button
          label="Clear"
          icon="pi pi-times"
          severity="secondary"
          outlined
          @click="clearFilters"
        />
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card class="stat-card">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted">Total Visits</p>
              <p class="text-2xl font-bold text-gray-900">{{ totalVisits }}</p>
            </div>
            <div class="stat-chip stat-chip--info">
              <i class="pi pi-calendar"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card class="stat-card">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted">Active Visits</p>
              <p class="text-2xl font-bold text-green-600">{{ activeVisits.length }}</p>
            </div>
            <div class="stat-chip stat-chip--success">
              <i class="pi pi-play"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card class="stat-card">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted">Completed</p>
              <p class="text-2xl font-bold text-purple-600">{{ completedVisits.length }}</p>
            </div>
            <div class="stat-chip stat-chip--purple">
              <i class="pi pi-check"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card class="stat-card">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted">This Week</p>
              <p class="text-2xl font-bold text-orange-600">{{ visitsThisWeek }}</p>
            </div>
            <div class="stat-chip stat-chip--warning">
              <i class="pi pi-clock"></i>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Visits Grid -->
    <div v-if="loading && visits.length === 0" class="text-center py-8">
      <i class="pi pi-spin pi-spinner text-4xl text-muted"></i>
      <p class="text-muted mt-2">Loading visits...</p>
    </div>

    <div v-else-if="visits.length === 0" class="text-center py-8">
      <i class="pi pi-calendar text-4xl text-muted mb-4"></i>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No visits found</h3>
      <p class="text-muted">Get started by adding your first visit.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <VisitCard
        v-for="visit in visits"
        :key="visit.id"
        :visit="visit"
        @edit="handleEditVisit"
        @delete="handleDeleteVisit"
        @view-details="handleViewVisitDetails"
      />
    </div>

    <!-- Pagination -->
    <div v-if="totalVisits > 10" class="flex justify-center mt-8">
      <Paginator
        :first="currentPage * 10"
        :rows="10"
        :total-records="totalVisits"
        @page="handlePageChange"
      />
    </div>

    <!-- Add/Edit Dialog -->
    <AddVisitDialog
      :visible="showAddDialog"
      :visit="editingVisit"
      :client-options="clientOptions"
      :house-options="houseOptions"
      :clients-loading="clientsLoading"
      :houses-loading="housesLoading"
      @update:visible="showAddDialog = $event"
      @visit-added="handleVisitAdded"
      @visit-updated="handleVisitUpdated"
    />

    <!-- View Details Dialog -->
    <ViewVisitDetailsDialog
      :visible="showDetailsDialog"
      :visit="selectedVisit"
      @update:visible="showDetailsDialog = $event"
      @edit="handleEditVisit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useVisits } from '@/composables/useVisits'
import { useClients } from '@/composables/useClients'
import { useHouses } from '@/composables/useHouses'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import Paginator from 'primevue/paginator'
import VisitCard from './VisitCard.vue'
import AddVisitDialog from './AddVisitDialog.vue'
import ViewVisitDetailsDialog from './ViewVisitDetailsDialog.vue'
import type { Visit, VisitSearchParams } from '@/views/Roster/types'

// Dialog states
const showAddDialog = ref(false)
const showDetailsDialog = ref(false)
const editingVisit = ref<Visit | null>(null)
const selectedVisit = ref<Visit | null>(null)

// Filters
const filters = ref<VisitSearchParams>({
  client_id: undefined,
  house_id: undefined,
  start_date: undefined,
  end_date: undefined,
  skip: 0,
  limit: 10
})

// Calendar date refs
const startDate = ref<Date | null>(null)
const endDate = ref<Date | null>(null)

const currentPage = ref(0)

// Hooks
const {
  visits,
  loading,
  totalVisits,
  activeVisits,
  completedVisits,
  fetchVisits
} = useVisits()

const {
  clients,
  fetchClients,
  loading: clientsLoading
} = useClients()

const {
  houses,
  fetchHouses,
  loading: housesLoading
} = useHouses()

// Computed options for dropdowns
const clientOptions = computed(() => {
  return clients.value.map(client => ({
    label: `${client.first_name} ${client.last_name}`,
    value: client.id,
    houseId: client.house_id ?? null
  }))
})

const houseOptions = computed(() => {
  return houses.value.map(house => ({
    label: house.name,
    value: house.id
  }))
})

// Computed
const visitsThisWeek = computed(() => {
  const now = new Date()
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

  return visits.value.filter(visit => {
    const visitDate = new Date(visit.start_at)
    return visitDate >= weekStart && visitDate <= weekEnd
  }).length
})

// Methods
const handleSearch = async () => {
  // Convert dates to strings for API
  const searchParams: VisitSearchParams = {
    ...filters.value,
    start_date: startDate.value ? startDate.value.toISOString().split('T')[0] : undefined,
    end_date: endDate.value ? endDate.value.toISOString().split('T')[0] : undefined
  }
  await fetchVisits(searchParams)
}

const clearFilters = () => {
  filters.value = {
    client_id: undefined,
    house_id: undefined,
    start_date: undefined,
    end_date: undefined,
    skip: 0,
    limit: 10
  }
  startDate.value = null
  endDate.value = null
  handleSearch()
}

const handlePageChange = (event: { page: number }) => {
  currentPage.value = event.page
  filters.value.skip = event.page * 10
  handleSearch()
}

const handleEditVisit = (visit: Visit) => {
  editingVisit.value = visit
  showAddDialog.value = true
}

const handleDeleteVisit = async (visit: Visit) => {
  // TODO: Implement delete confirmation and API call
  console.log('Delete visit:', visit.id)
}

const handleViewVisitDetails = (visit: Visit) => {
  selectedVisit.value = visit
  showDetailsDialog.value = true
}

const handleVisitAdded = () => {
  showAddDialog.value = false
  editingVisit.value = null
  // Refresh the list
  handleSearch()
}

const handleVisitUpdated = () => {
  showAddDialog.value = false
  editingVisit.value = null
  // Refresh the list
  handleSearch()
}

// Load initial data
onMounted(async () => {
  await Promise.all([
    handleSearch(),
    fetchClients(),
    fetchHouses()
  ])
})
</script>

<style scoped>
.roster-panel {
  background: var(--app-surface);
  border-color: var(--app-border);
  box-shadow: var(--app-card-shadow);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.roster-panel:hover {
  border-color: var(--app-accent);
}

.stat-card {
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 1rem;
  box-shadow: var(--app-card-shadow);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.stat-card:hover {
  border-color: var(--app-accent);
  transform: translateY(-2px);
  box-shadow: 0 20px 45px rgba(2, 6, 23, 0.12);
}

.stat-chip {
  width: 3rem;
  height: 3rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--app-surface-muted);
  color: var(--app-accent);
  box-shadow: inset 0 0 0 1px var(--app-border);
}

.stat-chip--info {
  color: #2563eb;
}

.stat-chip--success {
  color: #16a34a;
}

.stat-chip--purple {
  color: #7c3aed;
}

.stat-chip--warning {
  color: #d97706;
}

.stat-chip i {
  font-size: 1.25rem;
}
</style>