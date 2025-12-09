<template>
  <div class="assignment-management">
    <!-- Header with Actions -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Assignments</h2>
        <p class="text-muted mt-1">Assign staff to visits and manage schedules</p>
      </div>

      <div class="flex gap-3">
        <GlobalButton
          label="Create Assignment"
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
          <label class="block text-sm font-medium text-gray-700 mb-2">Employee</label>
          <Dropdown
            v-model="filters.employee_id"
            :options="employeeOptions"
            option-label="label"
            option-value="value"
            placeholder="All Employees"
            class="w-full app-input"
            :loading="employeesLoading"
            show-clear
          />
        </div>

        <div class="field">
          <label class="block text-sm font-medium text-gray-700 mb-2">Visit</label>
          <Dropdown
            v-model="filters.visit_id"
            :options="visitOptions"
            option-label="label"
            option-value="value"
            placeholder="All Visits"
            class="w-full app-input"
            :loading="visitsLoading"
            show-clear
          />
        </div>

        <div class="field">
          <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <Dropdown
            v-model="filters.status"
            :options="statusOptions"
            option-label="label"
            option-value="value"
            placeholder="All Statuses"
            class="w-full app-input"
            show-clear
          />
        </div>

        <div class="field">
          <label class="block text-sm font-medium text-gray-700 mb-2">Role</label>
          <Dropdown
            v-model="filters.role_on_visit"
            :options="roleOptions"
            option-label="label"
            option-value="value"
            placeholder="All Roles"
            class="w-full app-input"
            show-clear
          />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
        <GlobalButton
          label="Search"
          icon="pi pi-search"
          @click="handleSearch"
          :loading="loading"
        />
        <GlobalButton
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
              <p class="text-sm font-medium text-muted">Total Assignments</p>
              <p class="text-2xl font-bold text-gray-900">{{ totalAssignments }}</p>
            </div>
            <div class="stat-chip stat-chip--info">
              <i class="pi pi-users"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card class="stat-card">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted">Active</p>
              <p class="text-2xl font-bold text-green-600">{{ activeAssignments.length }}</p>
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
              <p class="text-2xl font-bold text-purple-600">{{ completedAssignments.length }}</p>
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
              <p class="text-sm font-medium text-muted">Pending</p>
              <p class="text-2xl font-bold text-orange-600">{{ pendingAssignments.length }}</p>
            </div>
            <div class="stat-chip stat-chip--warning">
              <i class="pi pi-clock"></i>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Assignments Grid -->
    <div v-if="loading && assignments.length === 0" class="text-center py-8">
      <i class="pi pi-spin pi-spinner text-4xl text-muted"></i>
      <p class="text-muted mt-2">Loading assignments...</p>
    </div>

    <div v-else-if="assignments.length === 0" class="text-center py-8">
      <i class="pi pi-users text-4xl text-muted mb-4"></i>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
      <p class="text-muted">Get started by creating your first assignment.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AssignmentCard
        v-for="assignment in assignments"
        :key="assignment.id"
        :assignment="assignment"
        @edit="handleEditAssignment"
        @delete="handleDeleteAssignment"
        @view-details="handleViewAssignmentDetails"
        @check-in="handleCheckIn"
        @check-out="handleCheckOut"
      />
    </div>

    <!-- Pagination -->
    <div v-if="totalAssignments > 10" class="flex justify-center mt-8">
      <Paginator
        :first="currentPage * 10"
        :rows="10"
        :total-records="totalAssignments"
        @page="handlePageChange"
      />
    </div>

    <!-- Add/Edit Dialog -->
    <AddAssignmentDialog
      :visible="showAddDialog"
      :assignment="editingAssignment"
      @update:visible="showAddDialog = $event"
      @assignment-added="handleAssignmentAdded"
      @assignment-updated="handleAssignmentUpdated"
    />

    <!-- View Details Dialog -->
    <ViewAssignmentDetailsDialog
      :visible="showDetailsDialog"
      :assignment="selectedAssignment"
      @update:visible="showDetailsDialog = $event"
      @edit="handleEditAssignment"
      @check-in="handleCheckIn"
      @check-out="handleCheckOut"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAssignments } from '@/composables/useAssignments'
import { useEmployees } from '@/composables/useEmployees'
import { useVisits } from '@/composables/useVisits'
import Card from 'primevue/card'
import GlobalButton from '@/components/shared/GlobalButton.vue'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import Paginator from 'primevue/paginator'
import AssignmentCard from './AssignmentCard.vue'
import AddAssignmentDialog from './AddAssignmentDialog.vue'
import ViewAssignmentDetailsDialog from './ViewAssignmentDetailsDialog.vue'
import type { Assignment, AssignmentSearchParams } from '@/views/Roster/types'

// Dialog states
const showAddDialog = ref(false)
const showDetailsDialog = ref(false)
const editingAssignment = ref<Assignment | null>(null)
const selectedAssignment = ref<Assignment | null>(null)

// Filters
const filters = ref<AssignmentSearchParams>({
  employee_id: undefined,
  visit_id: undefined,
  status: undefined,
  role_on_visit: undefined,
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
  assignments,
  loading,
  totalAssignments,
  activeAssignments,
  completedAssignments,
  pendingAssignments,
  fetchAssignments,
  deleteAssignment,
  checkInAssignment,
  checkOutAssignment
} = useAssignments()

const { employees, loading: employeesLoading, getEmployees } = useEmployees()
const { visits, loading: visitsLoading, fetchVisits } = useVisits()

// Options
const employeeOptions = computed(() => {
  return employees.value.map(employee => ({
    label: `${employee.first_name} ${employee.last_name}`,
    value: employee.id
  }))
})

const visitOptions = computed(() => {
  return visits.value.map(visit => ({
    label: `Visit #${visit.id} - Client #${visit.client_id}`,
    value: visit.id
  }))
})

const statusOptions = [
  { label: 'Tentative', value: 'TENTATIVE' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' }
]

const roleOptions = [
  { label: 'Solo', value: 'Solo' },
  { label: 'Lead', value: 'Lead' },
  { label: 'Support', value: 'Support' }
]

// Methods
const handleSearch = async () => {
  // Convert dates to strings for API
  const searchParams: AssignmentSearchParams = {
    ...filters.value,
    start_date: startDate.value ? startDate.value.toISOString().split('T')[0] : undefined,
    end_date: endDate.value ? endDate.value.toISOString().split('T')[0] : undefined
  }
  await fetchAssignments(searchParams)
}

const clearFilters = () => {
  filters.value = {
    employee_id: undefined,
    visit_id: undefined,
    status: undefined,
    role_on_visit: undefined,
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

const handleEditAssignment = (assignment: Assignment) => {
  editingAssignment.value = assignment
  showAddDialog.value = true
}

const handleDeleteAssignment = async (assignment: Assignment) => {
  // TODO: Implement delete confirmation
  await deleteAssignment(assignment.id)
  handleSearch()
}

const handleViewAssignmentDetails = (assignment: Assignment) => {
  selectedAssignment.value = assignment
  showDetailsDialog.value = true
}

const handleCheckIn = async (assignment: Assignment) => {
  const result = await checkInAssignment(assignment.id, {
    check_in_at: new Date().toISOString()
  })
  if (result.success) {
    handleSearch()
  }
}

const handleCheckOut = async (assignment: Assignment) => {
  const result = await checkOutAssignment(assignment.id, {
    check_out_at: new Date().toISOString()
  })
  if (result.success) {
    handleSearch()
  }
}

const handleAssignmentAdded = () => {
  showAddDialog.value = false
  editingAssignment.value = null
  handleSearch()
}

const handleAssignmentUpdated = () => {
  showAddDialog.value = false
  editingAssignment.value = null
  handleSearch()
}

// Load initial data
onMounted(async () => {
  await Promise.all([
    getEmployees(),
    fetchVisits(),
    handleSearch()
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