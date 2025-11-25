<template>
  <div class="min-h-screen bg-white py-8">
    <!-- Header Section -->
    <div class="w-full mb-8">
      <div class="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white rounded-xl  p-6">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <!-- Title and Stats -->
            <div>
              <h1 class="text-3xl font-bold text-gray-900 flex items-center">
                <i class="pi pi-users mr-3 text-blue-600"></i>
                Employee Management
              </h1>
              <p class="text-gray-600 mt-2">
                Manage your employees information and status
              </p>

              <!-- Employee Stats -->
              <div class="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div class="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <div class="flex items-center">
                    <i class="pi pi-users text-blue-600 mr-2"></i>
                    <div>
                      <p class="text-sm font-medium text-blue-900">Total</p>
                      <p class="text-xl font-bold text-blue-700">{{ employeeStats.total }}</p>
                    </div>
                  </div>
                </div>

                <div class="bg-green-50 rounded-lg p-3 border border-green-200">
                  <div class="flex items-center">
                    <i class="pi pi-check-circle text-green-600 mr-2"></i>
                    <div>
                      <p class="text-sm font-medium text-green-900">Active</p>
                      <p class="text-xl font-bold text-green-700">{{ employeeStats.active }}</p>
                    </div>
                  </div>
                </div>

                <div class="bg-red-50 rounded-lg p-3 border border-red-200">
                  <div class="flex items-center">
                    <i class="pi pi-times-circle text-red-600 mr-2"></i>
                    <div>
                      <p class="text-sm font-medium text-red-900">Inactive</p>
                      <p class="text-xl font-bold text-red-700">{{ employeeStats.inactive }}</p>
                    </div>
                  </div>
                </div>

                <div class="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                  <div class="flex items-center">
                    <i class="pi pi-clock text-yellow-600 mr-2"></i>
                    <div>
                      <p class="text-sm font-medium text-yellow-900">On Leave</p>
                      <p class="text-xl font-bold text-yellow-700">{{ employeeStats.onLeave }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3">
              <Button
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

    <!-- Employees Grid -->
    <div class="w-full">
      <div class="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Loading State -->
        <div v-if="loading && employees.length === 0" class="text-center py-12">
          <i class="pi pi-spinner pi-spin text-gray-400" style="font-size: 2rem;"></i>
          <p class="text-gray-600 mt-4">Loading employees...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="!loading && filteredEmployees.length === 0" class="text-center py-12">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
            <div class="mb-4">
              <i class="pi pi-users text-gray-300" style="font-size: 4rem;"></i>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No Employees Yet</h3>
            <p class="text-gray-600 mb-6">
              Get started by adding your first employee to the system.
            </p>
            <Button
              @click="handleAddEmployee"
              icon="pi pi-plus"
              label="Add Your First Employee"
              class="bg-blue-600 hover:bg-blue-700 border-0 text-white font-semibold py-3 px-6"
            />
          </div>
        </div>

        <!-- Employees Grid -->
        <div v-else class="employee-grid gap-6">
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

        <!-- Load More Button -->
        <div v-if="!loading && filteredEmployees.length > 0 && hasMoreEmployees" class="text-center mt-8">
          <Button
            @click="loadMoreEmployees"
            icon="pi pi-angle-down"
            label="Load More Employees"
            class="p-button-outlined"
            :loading="loadingMore"
          />
        </div>
      </div>
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
import Button from 'primevue/button'
import ConfirmDialog from 'primevue/confirmdialog'
// Adjust the import paths to the actual locations of the components
import { EmployeeCard, AddEmployeeDialog, ViewEmployeeDetailsDialog } from './components'
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
}
</style>
