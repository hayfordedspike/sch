<template>
<div class="p-6 bg-white min-h-screen">
    <!-- Header Section -->
    <div class="w-full mb-8">
      <div class="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div class="employee-section rounded-xl p-6 shadow-sm border border-gray-200">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <!-- Title and Stats -->
            <div>
              <h1 class="text-3xl font-bold text-gray-900 flex items-center">
                <i class="pi pi-users mr-3 text-blue-600"></i>
                Employees
              </h1>
              <p class="text-muted mt-2">
                Manage your employees information and status
              </p>

              <!-- Employee Stats -->
              <div class="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div class="employee-stat employee-stat--total">
                  <div class="flex items-center">
                    <i class="pi pi-users stat-icon mr-2"></i>
                    <div>
                      <p class="stat-label">Total</p>
                      <p class="stat-value">{{ employeeStats.total }}</p>
                    </div>
                  </div>
                </div>

                <div class="employee-stat employee-stat--active">
                  <div class="flex items-center">
                    <i class="pi pi-check-circle stat-icon mr-2"></i>
                    <div>
                      <p class="stat-label">Active</p>
                      <p class="stat-value">{{ employeeStats.active }}</p>
                    </div>
                  </div>
                </div>

                <div class="employee-stat employee-stat--inactive">
                  <div class="flex items-center">
                    <i class="pi pi-times-circle stat-icon mr-2"></i>
                    <div>
                      <p class="stat-label">Inactive</p>
                      <p class="stat-value">{{ employeeStats.inactive }}</p>
                    </div>
                  </div>
                </div>

                <div class="employee-stat employee-stat--leave">
                  <div class="flex items-center">
                    <i class="pi pi-clock stat-icon mr-2"></i>
                    <div>
                      <p class="stat-label">On Leave</p>
                      <p class="stat-value">{{ employeeStats.onLeave }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3">
              <GlobalButton
                @click="handleAddEmployee"
                icon="pi pi-plus"
                label="Add New Employee"
                class="bg-blue-600 hover:bg-blue-700 border-0 text-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- View Switcher -->
    <div class="flex justify-end mb-4 gap-2">
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

    <!-- Employees Data -->
    <div v-if="viewMode === 'card'" class="employee-grid gap-6">
      <EmployeeCard
        v-for="employee in filteredEmployees"
        :key="employee.id"
        :employee="employee"
        @edit="handleEditEmployee"
        @delete="handleDeleteEmployee"
        @view-details="handleViewEmployeeDetails"
        @change-status="handleChangeEmployeeStatus"
      />
    </div>
    <div v-else>
      <EmployeeTable
        :employees="filteredEmployees"
        @view="handleViewEmployeeDetails"
        @edit="handleEditEmployee"
        @delete="handleDeleteEmployee"
      />
    </div>

    <!-- Load More Button -->
    <div v-if="!loading && filteredEmployees.length > 0 && hasMoreEmployees" class="text-center mt-8">
      <GlobalButton
        @click="loadMoreEmployees"
        icon="pi pi-angle-down"
        label="Load More Employees"
        class="p-button-outlined"
        :loading="loadingMore"
      />
    </div>

    <!-- Add/Edit Employee Dialog -->
    <AddEmployeeDialog
      v-model:visible="showAddEmployeeDialog"
      :employee="editingEmployee"
      @employee-added="handleEmployeeAdded"
      @employee-updated="handleEmployeeUpdated"
    />

    <!-- Employee Details Dialog -->
    <ViewEmployeeDetailsDialog
      v-model:visible="showViewDetailsDialog"
      :employee="viewingEmployee"
      @edit="handleEditFromDetails"
    />

    <!-- Confirmation Dialog -->
    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { useEmployees } from '@/composables/useEmployees'
import GlobalButton from '@/components/shared/GlobalButton.vue'
import ConfirmDialog from 'primevue/confirmdialog'
// Adjust the import paths to the actual locations of the components
import { EmployeeCard, AddEmployeeDialog, ViewEmployeeDetailsDialog } from './components'
import EmployeeTable from './components/EmployeeTable.vue'
import type { Employee } from './types'

defineOptions({ name: 'EmployeesView' })

const confirm = useConfirm()
const toast = useToast()

const {
  employees,
  currentPage,
  totalPages,
  loading,
  employeeStats,
  fetchEmployees,
  deleteEmployee,
  changeEmployeeStatus,
  fetchEmployeeStats
} = useEmployees()

// Search and filter state
const loadingMore = ref(false)
const currentLimit = ref(20)

// Dialog state
const showAddEmployeeDialog = ref(false)
const showViewDetailsDialog = ref(false)
const editingEmployee = ref<Employee | null>(null)
const viewingEmployee = ref<Employee | null>(null)

// View mode state
const viewMode = ref<'card' | 'table'>('card')

// Computed
const filteredEmployees = computed(() => {
  // No filtering - return all employees
  return [...employees.value]
})

const hasMoreEmployees = computed(() => {
  return currentPage.value < totalPages.value
})

// Methods
const loadEmployees = async (reset = false) => {
  const params = {
    skip: reset ? 0 : employees.value.length,
    limit: currentLimit.value
  }

  await fetchEmployees(params)
}

const handleRefresh = async () => {
  employees.value = []
  await loadEmployees(true)
  await fetchEmployeeStats()
}

const loadMoreEmployees = async () => {
  loadingMore.value = true
  await loadEmployees(false)
  loadingMore.value = false
}

const handleAddEmployee = () => {
  editingEmployee.value = null
  showAddEmployeeDialog.value = true
}

const handleEditEmployee = (employee: Employee) => {
  editingEmployee.value = employee
  showAddEmployeeDialog.value = true
}

const handleEmployeeAdded = async () => {
  toast.add({
    severity: 'success',
    summary: 'Employee Added',
    detail: 'Employee has been successfully added.',
    life: 3000
  })

  // Refresh the employees list and stats
  await handleRefresh()

  // Reset dialog state
  showAddEmployeeDialog.value = false
  editingEmployee.value = null
}

const handleEmployeeUpdated = async () => {
  toast.add({
    severity: 'success',
    summary: 'Employee Updated',
    detail: 'Employee has been successfully updated.',
    life: 3000
  })

  // Refresh the employees list and stats
  await handleRefresh()

  // Reset dialog state
  showAddEmployeeDialog.value = false
  editingEmployee.value = null
}

const handleViewEmployeeDetails = (employee: Employee) => {
  viewingEmployee.value = employee
  showViewDetailsDialog.value = true
}

const handleEditFromDetails = (employee: Employee) => {
  viewingEmployee.value = null
  showViewDetailsDialog.value = false
  handleEditEmployee(employee)
}

const handleDeleteEmployee = (employee: Employee) => {
  confirm.require({
    message: `Are you sure you want to delete "${employee.first_name} ${employee.last_name}"? This action cannot be undone.`,
    header: 'Delete Employee',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Cancel',
    acceptLabel: 'Delete',
    rejectClass: 'p-button-secondary p-button-outlined',
    acceptClass: 'p-button-danger',
    accept: async () => {
      const result = await deleteEmployee(employee.id)
      if (result?.success) {
        toast.add({
          severity: 'success',
          summary: 'Employee Deleted',
          detail: `${employee.first_name} ${employee.last_name} has been deleted successfully.`,
          life: 3000
        })
      }
    }
  })
}

const handleChangeEmployeeStatus = async (employee: Employee) => {
  // TODO: Implement status change dialog or quick action
  // For now, show a simple status change
  const newStatus = employee.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
  const result = await changeEmployeeStatus(employee.id, newStatus)
  if (result?.success) {
    toast.add({
      severity: 'success',
      summary: 'Status Changed',
      detail: `${employee.first_name} ${employee.last_name} status changed to ${newStatus}`,
      life: 3000
    })
    await fetchEmployeeStats() // Refresh stats after status change
  }
}

// Lifecycle
onMounted(async () => {
  await loadEmployees(true)
  await fetchEmployeeStats()
})
</script>

<style scoped>
/* Custom styles for the employees page */
.employee-section {
  background: var(--app-surface);
  border-color: var(--app-border);
  transition: background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.text-muted {
  color: var(--app-text-muted);
}

.employee-stat {
  position: relative;
  border-radius: 0.75rem;
  border: 1px solid var(--app-border);
  background: var(--app-surface-muted);
  padding: 0.85rem 1rem;
  transition: border-color 0.2s ease, transform 0.2s ease, background 0.2s ease;
}

.employee-stat:hover {
  border-color: var(--app-accent);
  transform: translateY(-2px);
}

.employee-stat--total {
  --stat-color: #0369a1;
}

.employee-stat--active {
  --stat-color: #047857;
}

.employee-stat--inactive {
  --stat-color: #b91c1c;
}

.employee-stat--leave {
  --stat-color: #a16207;
}

.stat-icon {
  color: var(--stat-color);
  font-size: 1.2rem;
}

.stat-label {
  color: var(--stat-color);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  font-weight: 600;
}

.stat-value {
  color: var(--app-text);
  font-size: 1.5rem;
  font-weight: 700;
}

:deep(.p-inputtext) {
  border-radius: 8px;
}

:deep(.p-dropdown) {
  border-radius: 8px;
}

:deep(.p-button) {
  border-radius: 8px;
}

/* Employee grid layout improvements */
.employee-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
  align-items: stretch;
}

@media (max-width: 600px) {
  .employee-grid {
    grid-template-columns: 1fr;
    overflow-x: auto;
    padding-bottom: 1rem;
  }

  .employee-section h1 {
    font-size: 1.75rem;
  }

  .employee-stat {
    padding: 0.65rem 0.75rem;
  }

  .stat-label {
    font-size: 0.7rem;
  }

  .stat-value {
    font-size: 1.2rem;
  }
}
</style>
