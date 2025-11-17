<template>
  <Dialog
    v-model:visible="isVisible"
    modal
    :style="{ width: '52rem' }"
    :closable="true"
    @hide="handleClose"
  >
    <template #header>
      <div class="flex items-center gap-3">
        
        <div>
          <h2 class="text-gray-900 font-semibold text-2xl">Employee Details</h2>
          <p class="text-gray-500 text-sm mt-1">View comprehensive employee information</p>
        </div>
      </div>
    </template>

    <div v-if="employee && displayInfo" class="flex flex-col gap-8 py-2">
      <!-- Employee Header -->
      <div class="flex items-center justify-between p-1">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
            <i class="pi pi-user text-white text-2xl"></i>
          </div>
          <div>
            <h3 class="text-2xl font-bold text-gray-900">{{ displayInfo?.fullName || 'N/A' }}</h3>
            <div class="flex items-center gap-3 mt-2">
              <Tag
                v-if="displayInfo"
                :severity="displayInfo.statusColor"
                :value="displayInfo.statusLabel"
                class="font-medium px-3 py-1"
              />
              <span class="text-gray-500 text-sm">•</span>
              <span class="text-gray-500 text-sm">{{ displayInfo?.daysEmployed || 0 }} days employed</span>
            </div>
          </div>
        </div>
      
      </div>

      <!-- Personal Information Section -->
      <div class="space-y-1">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <i class="pi pi-user text-blue-600"></i>
          Personal Information
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- First Name -->
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700 uppercase tracking-wide">First Name</label>
            <div class="text-gray-900 text-lg font-normal py-2">
              {{ employee.first_name }}
            </div>
          </div>

          <!-- Last Name -->
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700 uppercase tracking-wide">Last Name</label>
            <div class="text-gray-900 text-lg font-normal py-2">
              {{ employee.last_name }}
            </div>
          </div>

          <!-- Phone -->
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700 uppercase tracking-wide">Phone Number</label>
            <div class="text-gray-900 text-lg font-normal py-2">
              {{ employee ? formatEmployeePhone(employee.phone) : 'N/A' }}
            </div>
          </div>

          <!-- Hire Date -->
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700 uppercase tracking-wide">Hire Date</label>
            <div class="text-gray-900 text-lg font-normal py-2">
              {{ displayInfo?.hireDate || 'N/A' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Employment Information Section -->
      <div class="space-y-1">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <i class="pi pi-briefcase text-green-600"></i>
          Employment Information
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Status -->
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700 uppercase tracking-wide">Current Status</label>
            <div class="py-2">
              <Tag
                v-if="displayInfo"
                :severity="displayInfo.statusColor"
                :value="displayInfo.statusLabel"
                class="font-medium px-3 py-1 text-sm"
              />
            </div>
          </div>

          <!-- Days Employed -->
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700 uppercase tracking-wide">Days Employed</label>
            <div class="text-gray-900 text-lg font-normal py-2 flex items-center gap-2">
              <i class="pi pi-clock text-purple-600"></i>
              {{ displayInfo?.daysEmployed || 0 }} days
            </div>
          </div>

          <!-- Created At -->
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700 uppercase tracking-wide">Date Created</label>
            <div class="text-gray-900 text-lg font-normal py-2">
              {{ employee ? formatDate(employee.created_at) : 'N/A' }}
            </div>
          </div>
        </div>
      </div>

      <!-- System Information Section -->
      <div class="space-y-1">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <i class="pi pi-cog text-gray-600"></i>
          System Information
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
     

          <!-- Last Updated -->
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700 uppercase tracking-wide">Last Updated</label>
            <div class="text-gray-900 text-lg font-normal py-2">
              {{ employee ? formatDate(employee.updated_at) : 'N/A' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-between gap-2">
        <Button
          label="Edit Employee"
          icon="pi pi-pencil"
          class="p-button-outlined"
          @click="handleEdit"
        />
        <Button
          label="Close"
          icon="pi pi-times"
          class="p-button-text text-gray-600 hover:text-gray-800"
          @click="handleClose"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useEmployees } from '@/composables/useEmployees'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import type { Employee } from '@/views/Employees/types'

interface Props {
  visible: boolean
  employee: Employee | null
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'edit', employee: Employee): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const {
  getEmployeeDisplayInfo,
  formatEmployeePhone
} = useEmployees()

// Reactive state
const isVisible = computed<boolean>({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const displayInfo = computed(() => {
  if (!props.employee) return null
  try {
    return getEmployeeDisplayInfo(props.employee)
  } catch (error) {
    console.error('Error getting employee display info:', error)
    return null
  }
})

// Watch for employee changes to ensure reactivity
watch(() => props.employee, () => {
  // Component will re-render when employee changes
})

// Methods
const handleClose = () => {
  isVisible.value = false
}

const handleEdit = () => {
  if (props.employee) {
    emit('edit', props.employee)
    handleClose()
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
:deep(.p-dialog-header) {
  padding: 1.5rem 2rem 1rem;
  border-bottom: 1px solid #f1f5f9;
}

:deep(.p-dialog-content) {
  padding: 0 2rem;
}

:deep(.p-dialog-footer) {
  padding: 1rem 2rem;
  border-top: 1px solid #f1f5f9;
}

/* Remove all rounded corners, backgrounds, and borders */
:deep(.p-dialog) {
  border-radius: 0;
}

:deep(.p-tag) {
  border-radius: 0;
  border: none;
  font-weight: 500;
}

/* Clean typography and spacing */
label {
  color: #64748b;
  font-weight: 600;
  letter-spacing: 0.025em;
}

/* Remove any background colors and borders from content areas */
.text-gray-900 {
  color: #1f2937;
}

.text-gray-700 {
  color: #374151;
}

.text-gray-500 {
  color: #6b7280;
}
</style>