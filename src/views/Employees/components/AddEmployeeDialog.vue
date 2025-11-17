<template>
  <Dialog
    v-model:visible="isVisible"
    modal
    :style="{ width: '50rem' }"
    :closable="true"
    @hide="handleClose"
  >
    <template #header>
      <h2 class="text-blue-500 font-bold text-3xl">
        {{ editMode ? 'Edit Employee' : 'Add New Employee' }}
      </h2>
    </template>

    <div class="flex flex-col gap-6 py-4">
      <!-- Personal Information Section -->
      <div class="border border-gray-200 rounded-lg p-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <i class="pi pi-user mr-2 text-blue-500"></i>
          Personal Information
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- First Name -->
          <div class="flex flex-col gap-2">
            <label for="firstName" class="font-semibold">First Name *</label>
            <InputText
              id="firstName"
              v-model="formData.first_name"
              placeholder="Enter first name"
              :class="{ 'p-invalid': errors.first_name }"
            />
            <small v-if="errors.first_name" class="text-red-500">{{ errors.first_name }}</small>
          </div>

          <!-- Last Name -->
          <div class="flex flex-col gap-2">
            <label for="lastName" class="font-semibold">Last Name *</label>
            <InputText
              id="lastName"
              v-model="formData.last_name"
              placeholder="Enter last name"
              :class="{ 'p-invalid': errors.last_name }"
            />
            <small v-if="errors.last_name" class="text-red-500">{{ errors.last_name }}</small>
          </div>

          <!-- Phone -->
          <div class="flex flex-col gap-2">
            <label for="phone" class="font-semibold">Phone Number *</label>
            <InputText
              id="phone"
              v-model="formData.phone"
              placeholder="Enter phone number"
              :class="{ 'p-invalid': errors.phone }"
            />
            <small v-if="errors.phone" class="text-red-500">{{ errors.phone }}</small>
          </div>

         

          <!-- Hire Date -->
          <div class="flex flex-col gap-2">
            <label for="hireDate" class="font-semibold">Hire Date *</label>
            <Calendar
              id="hireDate"
              v-model="hireDate"
              placeholder="Select hire date"
              :class="{ 'p-invalid': errors.hire_date }"
              :maxDate="new Date()"
              dateFormat="yy-mm-dd"
              showIcon
            />
            <small v-if="errors.hire_date" class="text-red-500">{{ errors.hire_date }}</small>
          </div>

          <!-- Status -->
          <div class="flex flex-col gap-2">
            <label for="status" class="font-semibold">Status *</label>
            <Dropdown
              id="status"
              v-model="formData.status"
              :options="statusOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Select employee status"
              :class="{ 'p-invalid': errors.status }"
            />
            <small v-if="errors.status" class="text-red-500">{{ errors.status }}</small>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button label="Cancel" severity="secondary" @click="handleClose" outlined />
        <Button
          :label="editMode ? 'Update Employee' : 'Add Employee'"
          @click="handleSubmit"
          :loading="loading"
          icon="pi pi-save"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useEmployees } from '@/composables/useEmployees'
import type { CreateEmployeeRequest, Employee } from '@/views/Employees/types'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'

interface Props {
  visible: boolean
  employee?: Employee | null
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'employee-added'): void
  (e: 'employee-updated'): void
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  client: null
})

const emit = defineEmits<Emits>()

const { createEmployee, updateEmployee, loading } = useEmployees()

const formData = ref<CreateEmployeeRequest>({
  first_name: '',
  last_name: '',
  phone: '',
  status: 'ACTIVE',
  hire_date: '',
  user_id: 0
})

const hireDate = ref<Date | null>(null)
const errors = ref<Record<string, string>>({})

// Status options
const statusOptions = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
  { label: 'Probation', value: 'PROBATION' },
  { label: 'On Leave', value: 'ON_LEAVE' },
  { label: 'Retired', value: 'RETIRED' },
  { label: 'Terminated', value: 'TERMINATED' }
]

const isVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const editMode = computed(() => !!props.employee)

// Define resetForm function before it's used
const resetForm = () => {
  formData.value = {
    first_name: '',
    last_name: '',
    phone: '',
    status: 'ACTIVE',
    hire_date: '',
    user_id: 0
  }
  hireDate.value = null
}

// Watch for employee changes to populate form in edit mode
watch(
  () => props.employee,
  (newEmployee) => {
    if (newEmployee) {
      formData.value = {
        first_name: newEmployee.first_name,
        last_name: newEmployee.last_name,
        phone: newEmployee.phone,
        status: newEmployee.status,
        hire_date: newEmployee.hire_date,
        user_id: newEmployee.user_id
      }
      hireDate.value = new Date(newEmployee.hire_date)
    } else {
      // Reset form for add mode
      resetForm()
    }
    errors.value = {}
  },
  { immediate: true }
)

// Watch hireDate changes
watch(hireDate, (newDate) => {
  if (newDate) {
    formData.value.hire_date = newDate.toISOString().split('T')[0]
  }
})

const validateForm = (): boolean => {
  errors.value = {}
  let isValid = true

  // Required field validations
  const requiredFields = [
    'first_name',
    'last_name',
    'phone'
  ]

  requiredFields.forEach(field => {
    if (!formData.value[field as keyof CreateEmployeeRequest] ||
        String(formData.value[field as keyof CreateEmployeeRequest]).trim() === '') {
      errors.value[field] = `${field.replace('_', ' ')} is required`
      isValid = false
    }
  })

  // Hire date validation
  if (!hireDate.value) {
    errors.value.hire_date = 'Hire date is required'
    isValid = false
  } else if (hireDate.value > new Date()) {
    errors.value.hire_date = 'Hire date cannot be in the future'
    isValid = false
  }

  // User ID validation
  if (!formData.value.user_id || formData.value.user_id <= 0) {
    errors.value.user_id = 'Valid user ID is required'
    isValid = false
  }

  // Status validation
  if (!formData.value.status) {
    errors.value.status = 'Employee status is required'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  try {
    let result
    if (editMode.value && props.employee) {
      // Update existing employee
      result = await updateEmployee(props.employee.id, formData.value)
      if (result?.success) {
        emit('employee-updated')
        handleClose()
      }
    } else {
      // Create new employee
      result = await createEmployee(formData.value)
      if (result?.success) {
        emit('employee-added')
        handleClose()
      }
    }
  } catch (error) {
    console.error('Error in handleSubmit:', error)
  }
}

const handleClose = () => {
  resetForm()
  errors.value = {}
  emit('update:visible', false)
}
</script>

<style scoped>
.p-invalid {
  border-color: #ef4444;
}

:deep(.p-dialog-header-close) {
  width: 1.75rem !important;
  height: 1.75rem !important;
  border-radius: 50% !important;
  border: 2px solid #9ca3af !important;
  background: transparent !important;
  color: #6b7280 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0 !important;
}

:deep(.p-dialog-header-close .p-icon) {
  width: 0.75rem !important;
  height: 0.75rem !important;
}

:deep(.p-dialog-header-close:hover) {
  background: #f3f4f6 !important;
  border-color: #6b7280 !important;
  color: #4b5563 !important;
}

:deep(.p-dialog-header-close:focus) {
  box-shadow: none !important;
  border: 2px solid #9ca3af !important;
}

:deep(.p-dialog-header-close:active) {
  border: 2px solid #9ca3af !important;
}

/* Form sections */
.border {
  border-radius: 8px;
}
</style>