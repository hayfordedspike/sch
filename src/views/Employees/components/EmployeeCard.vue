<template>
  <Card class="employee-card hover:shadow-lg transition-all duration-300 cursor-pointer">
    <template #header>
      <div class="relative">
        <!-- Action Buttons -->
        <div class="absolute top-4 right-4 flex space-x-1">
          <Button
            icon="pi pi-pencil"
            class="p-button-rounded p-button-outlined p-button-sm"
            @click.stop="handleEdit"
            v-tooltip="'Edit Employee'"
            severity="info"
          />
          <Button
            icon="pi pi-trash"
            class="p-button-rounded p-button-outlined p-button-sm"
            @click.stop="handleDelete"
            v-tooltip="'Delete Employee'"
            severity="danger"
          />
          <Button
            icon="pi pi-sync"
            class="p-button-rounded p-button-outlined p-button-sm"
            @click.stop="handleChangeStatus"
            v-tooltip="'Change Status'"
            severity="warning"
          />
        </div>
      </div>
    </template>

    <template #content>
      <div class="px-6 pb-4">
        <!-- Employee Name -->
        <h3 class="text-xl font-bold text-gray-900 mb-2">
          {{ displayInfo.fullName }}
        </h3>

        <!-- Employee Status -->
        <div class="mb-3">
          <Tag
            :severity="displayInfo.statusColor"
            :value="displayInfo.statusLabel"
            class="text-xs font-medium"
          />
        </div>

        <!-- Employee Details -->
        <div class="space-y-2 text-sm text-gray-600 mb-4">
          <!-- Phone -->
          <div class="flex items-center">
            <i class="pi pi-phone mr-2 text-green-500 w-4"></i>
            <span>{{ formatEmployeePhone(employee.phone) }}</span>
          </div>

          <!-- Hire Date -->
          <div class="flex items-center">
            <i class="pi pi-calendar mr-2 text-blue-500 w-4"></i>
            <span>Hired: {{ displayInfo.hireDate }}</span>
          </div>

          <!-- Days Employed -->
          <div class="flex items-center">
            <i class="pi pi-clock mr-2 text-purple-500 w-4"></i>
            <span>{{ displayInfo.daysEmployed }} days employed</span>
          </div>

         
        </div>
      </div>
    </template>

    <template #footer>
      <div class="p-0">
        <!-- View Details Button -->
        <Button
          label="View Details"
          icon="pi pi-eye"
          class="w-full rounded-t-none"
          @click.stop="handleViewDetails"
          outlined
        />
      </div>
    </template>
  </Card>

  <!-- View Details Dialog -->
  <!-- ViewEmployeeDetailsDialog component implemented -->
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useEmployees } from '@/composables/useEmployees'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import type { Employee } from '@/views/Employees/types'

interface Props {
  employee: Employee
}

interface Emits {
  (e: 'edit', employee: Employee): void
  (e: 'delete', employee: Employee): void
  (e: 'view-details', employee: Employee): void
  (e: 'change-status', employee: Employee): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const {
  getEmployeeDisplayInfo,
  formatEmployeePhone
} = useEmployees()

// Computed
const displayInfo = computed(() => getEmployeeDisplayInfo(props.employee))

// Methods
const handleEdit = () => {
  emit('edit', props.employee)
}

const handleDelete = () => {
  emit('delete', props.employee)
}

const handleViewDetails = () => {
  emit('view-details', props.employee)
}

const handleChangeStatus = () => {
  emit('change-status', props.employee)
}
</script>

<style scoped>
.employee-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  height: 100%;
}

.employee-card:hover {
  border-color: #d1d5db;
  transform: translateY(-2px);
}

:deep(.p-card-header) {
  padding: 0;
}

:deep(.p-card-content) {
  padding: 0;
}

:deep(.p-card-footer) {
  padding: 0;
}

/* Tag styling */
:deep(.p-tag) {
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-weight: 500;
  border: none;
}

/* Button spacing */
:deep(.p-button-sm) {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

:deep(.p-button-rounded) {
  width: 2rem;
  height: 2rem;
  padding: 0;
}
</style>