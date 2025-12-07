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
      <div v-if="submissionError" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {{ submissionError }}
      </div>

      <!-- User Assignment Section -->
      <div class="border border-gray-200 rounded-lg p-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <i class="pi pi-user-plus mr-2 text-indigo-500"></i>
          Assign User Account
        </h3>

        <div class="grid grid-cols-1 gap-4">
          <div class="flex flex-col gap-2">
            <label for="userSearchEmail" class="font-semibold">Search by Email *</label>
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
              <InputText
                id="userSearchEmail"
                v-model.trim="userSearchEmail"
                placeholder="Enter user email"
                :class="{ 'p-invalid': !!userLookupError || errors.email }"
              />
              <div class="flex gap-2">
                <Button
                  label="Lookup"
                  icon="pi pi-search"
                  @click="lookupUserByEmail"
                  :loading="userLookupLoading"
                  type="button"
                  :disabled="!userSearchEmail || userLookupLoading"
                />
                <Button
                  v-if="selectedUser"
                  icon="pi pi-times"
                  severity="secondary"
                  text
                  type="button"
                  @click="clearSelectedUser"
                />
              </div>
            </div>
            <small v-if="userLookupError" class="text-red-500">{{ userLookupError }}</small>
            <small v-else-if="errors.user_id" class="text-red-500">{{ errors.user_id }}</small>
            <small v-else-if="errors.email" class="text-red-500">{{ errors.email }}</small>
          </div>

          <div v-if="userLookupResults.length" class="flex flex-col gap-2">
            <span class="font-semibold text-sm text-gray-700">Select Matching User</span>
            <div class="flex flex-col gap-2">
              <button
                v-for="user in userLookupResults"
                :key="user.id"
                type="button"
                class="w-full border rounded-lg px-4 py-3 text-left transition"
                :class="selectedUser?.id === user.id ? 'border-indigo-500 bg-indigo-50 shadow-sm' : 'border-gray-200 hover:border-indigo-300'"
                @click="handleUserResultSelection(user)"
              >
                <p class="font-semibold text-gray-900">{{ user.first_name }} {{ user.last_name }}</p>
                <p class="text-sm text-gray-600">{{ user.email }}</p>
              </button>
            </div>
          </div>
        </div>
      </div>

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
            <CountryPhoneInput
              v-model="phoneLocalNumber"
              v-model:countryDialCode="phoneDialCode"
              placeholder="Enter phone number"
              :error="errors.phone"
            />
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
import { useUsers } from '@/composables/useUsers'
import CountryPhoneInput from '@/components/shared/CountryPhoneInput.vue'
import { COUNTRY_BY_NAME, DEFAULT_COUNTRY_NAME } from '@/constants/countries'
import { combineDialCodeAndNumber, splitPhoneNumber, sanitizeDialCode } from '@/lib/phone'
import type { CreateEmployeeRequest, Employee } from '@/views/Employees/types'
import type { User } from '@/stores/auth'
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
const { fetchUserByField, loading: userLookupLoading } = useUsers()

const defaultDialCode = sanitizeDialCode(
  COUNTRY_BY_NAME.get(DEFAULT_COUNTRY_NAME.toLowerCase())?.dial_code
)

const formData = ref<CreateEmployeeRequest>({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  status: 'ACTIVE',
  hire_date: '',
  user_id: 0
})

const hireDate = ref<Date | null>(null)
const errors = ref<Record<string, string>>({})
const submissionError = ref<string | null>(null)
const phoneDialCode = ref(defaultDialCode)
const phoneLocalNumber = ref('')

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

const userSearchEmail = ref('')
const selectedUser = ref<User | null>(null)
const userLookupError = ref<string | null>(null)
const userLookupResults = ref<User[]>([])

const setSelectedUser = (user: User | null) => {
  selectedUser.value = user
  if (user) {
    formData.value.user_id = user.id
    formData.value.email = user.email || ''
    if (!formData.value.first_name) {
      formData.value.first_name = user.first_name
    }
    if (!formData.value.last_name) {
      formData.value.last_name = user.last_name
    }
  } else {
    formData.value.user_id = 0
    formData.value.email = ''
  }
}

const lookupUserByEmail = async () => {
  userLookupError.value = null
  const email = userSearchEmail.value.trim()

  if (!email) {
    userLookupError.value = 'Please enter an email to lookup'
    setSelectedUser(null)
    userLookupResults.value = []
    return
  }

  const users = await fetchUserByField('email', email)
  userLookupResults.value = users

  if (users && users.length > 0) {
    if (users.length === 1) {
      setSelectedUser(users[0])
      userSearchEmail.value = users[0].email || email
    } else {
      setSelectedUser(null)
      userLookupError.value = 'Multiple users found. Please select one below.'
    }
  } else {
    userLookupError.value = 'No user found with that email'
    setSelectedUser(null)
    userLookupResults.value = []
  }
}

const handleUserResultSelection = (user: User) => {
  setSelectedUser(user)
  userLookupError.value = null
  userSearchEmail.value = user.email || userSearchEmail.value
}

const clearSelectedUser = () => {
  setSelectedUser(null)
  userSearchEmail.value = ''
  userLookupError.value = null
  userLookupResults.value = []
}

// Define resetForm function before it's used
const resetForm = () => {
  formData.value = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    status: 'ACTIVE',
    hire_date: '',
    user_id: 0
  }
  hireDate.value = null
  phoneDialCode.value = defaultDialCode
  phoneLocalNumber.value = ''
  userSearchEmail.value = ''
  userLookupError.value = null
  submissionError.value = null
  setSelectedUser(null)
  userLookupResults.value = []
}

// Watch for employee changes to populate form in edit mode
watch(
  () => props.employee,
  (newEmployee) => {
    if (newEmployee) {
      formData.value = {
        first_name: newEmployee.first_name,
        last_name: newEmployee.last_name,
        email: newEmployee.email || '',
        phone: newEmployee.phone,
        status: newEmployee.status,
        hire_date: newEmployee.hire_date,
        user_id: newEmployee.user_id
      }
      hireDate.value = new Date(newEmployee.hire_date)
      const phoneParts = splitPhoneNumber(newEmployee.phone)
      phoneDialCode.value = phoneParts.dialCode
      phoneLocalNumber.value = phoneParts.nationalNumber
      userSearchEmail.value = newEmployee.email || ''
      if (newEmployee.user_id && newEmployee.email) {
        const derivedUser: User = {
          id: newEmployee.user_id,
          email: newEmployee.email,
          first_name: newEmployee.first_name,
          last_name: newEmployee.last_name,
          is_active: true,
          is_superuser: false,
          created_at: newEmployee.created_at,
          updated_at: newEmployee.updated_at,
          last_login: undefined
        }
        setSelectedUser(derivedUser)
        userLookupResults.value = [derivedUser]
      } else {
        setSelectedUser(null)
        userLookupResults.value = []
      }
    } else {
      // Reset form for add mode
      resetForm()
    }
    errors.value = {}
    userLookupError.value = null
    submissionError.value = null
  },
  { immediate: true }
)

// Watch hireDate changes
watch(hireDate, (newDate) => {
  if (newDate) {
    formData.value.hire_date = newDate.toISOString().split('T')[0]
  }
})

watch([phoneDialCode, phoneLocalNumber], ([dialCode, localNumber]) => {
  formData.value.phone = combineDialCodeAndNumber(dialCode, localNumber)
}, { immediate: true })

const validateForm = (): boolean => {
  errors.value = {}
  let isValid = true

  // Required field validations
  const requiredFields = [
    'first_name',
    'last_name',
    'email'
  ]
  if (formData.value.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.value.email)) {
      errors.value.email = 'Please enter a valid email address'
      isValid = false
    }
  }

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

  if (!phoneLocalNumber.value) {
    errors.value.phone = 'Phone number is required'
    isValid = false
  }

  // Status validation
  if (!formData.value.status) {
    errors.value.status = 'Employee status is required'
    isValid = false
  }

  if (!formData.value.user_id || formData.value.user_id <= 0) {
    errors.value.user_id = 'Employee must be associated with a user account'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  submissionError.value = null
  if (!validateForm()) {
    return
  }

  try {
    if (editMode.value && props.employee) {
      const result = await updateEmployee(props.employee.id, formData.value)
      if (result?.success) {
        submissionError.value = null
        emit('employee-updated')
        handleClose()
        return
      }
      submissionError.value = result?.error || 'Unable to update employee'
      return
    }

    const result = await createEmployee(formData.value)
    if (result?.success) {
      submissionError.value = null
      emit('employee-added')
      handleClose()
      return
    }
    submissionError.value = result?.error || 'Unable to create employee'
  } catch (error) {
    console.error('Error in handleSubmit:', error)
    submissionError.value = error instanceof Error ? error.message : 'Failed to submit form'
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