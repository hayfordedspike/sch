<template>
  <Dialog
    v-model:visible="isVisible"
    modal
    :style="{ width: '60rem' }"
    :closable="true"
    @hide="handleClose"
  >
    <template #header>
      <h2 class="text-blue-500 font-bold text-3xl">
        {{ editMode ? 'Edit Client' : 'Add New Client' }}
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

          <!-- Email -->
          <div class="flex flex-col gap-2">
            <label for="email" class="font-semibold">Email Address *</label>
            <InputText
              id="email"
              v-model="formData.email"
              type="email"
              placeholder="Enter email address"
              :class="{ 'p-invalid': errors.email }"
            />
            <small v-if="errors.email" class="text-red-500">{{ errors.email }}</small>
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

          <!-- Date of Birth -->
          <div class="flex flex-col gap-2">
            <label for="dateOfBirth" class="font-semibold">Date of Birth *</label>
            <Calendar
              id="dateOfBirth"
              v-model="dateOfBirth"
              placeholder="Select date of birth"
              :class="{ 'p-invalid': errors.date_of_birth }"
              :maxDate="new Date()"
              dateFormat="yy-mm-dd"
              showIcon
            />
            <small v-if="errors.date_of_birth" class="text-red-500">{{ errors.date_of_birth }}</small>
          </div>

          <!-- House Selection -->
          <div class="flex flex-col gap-2 md:col-span-2">
            <label class="font-semibold">Select House *</label>

            <!-- Loading State -->
            <div v-if="housesLoading" class="flex items-center justify-center py-8">
              <i class="pi pi-spinner pi-spin text-gray-400 mr-2"></i>
              <span class="text-gray-600">Loading houses...</span>
            </div>

            <!-- Houses Grid -->
            <div v-else-if="houses.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
              <div
                v-for="house in houses"
                :key="house.id"
                @click="selectHouse(house)"
                :class="[
                  'border rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md',
                  formData.house_id === house.id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300'
                ]"
              >
                <!-- House Header -->
                <div class="flex items-center mb-2">
         
                  <div class="flex-1 min-w-0">
                    <h4 class="font-semibold text-sm text-gray-900 truncate">{{ house.name }}</h4>
                  </div>
                  <!-- Selection Indicator -->
                  <div v-if="formData.house_id === house.id" class="ml-2">
                    <i class="pi pi-check-circle text-blue-500"></i>
                  </div>
                </div>


              </div>
            </div>

            <!-- No Houses Available -->
            <div v-else class="text-center py-8 border border-gray-200 rounded-lg">
              <i class="pi pi-home text-gray-300 text-2xl mb-2"></i>
              <p class="text-gray-600 text-sm">No houses available</p>
            </div>

            <small v-if="errors.house_id" class="text-red-500">{{ errors.house_id }}</small>
          </div>
        </div>
      </div>

      <!-- Address Information Section -->
      <div class="border border-gray-200 rounded-lg p-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <i class="pi pi-map-marker mr-2 text-green-500"></i>
          Address Information
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Address Line 1 -->
          <div class="flex flex-col gap-2 md:col-span-2">
            <label for="addressLine1" class="font-semibold">Address Line 1 *</label>
            <InputText
              id="addressLine1"
              v-model="formData.address_line_1"
              placeholder="Enter street address"
              :class="{ 'p-invalid': errors.address_line_1 }"
            />
            <small v-if="errors.address_line_1" class="text-red-500">{{ errors.address_line_1 }}</small>
          </div>

          <!-- Address Line 2 -->
          <div class="flex flex-col gap-2 md:col-span-2">
            <label for="addressLine2" class="font-semibold">Address Line 2</label>
            <InputText
              id="addressLine2"
              v-model="formData.address_line_2"
              placeholder="Apartment, suite, etc. (optional)"
            />
          </div>

          <!-- City -->
          <div class="flex flex-col gap-2">
            <label for="city" class="font-semibold">City *</label>
            <InputText
              id="city"
              v-model="formData.city"
              placeholder="Enter city"
              :class="{ 'p-invalid': errors.city }"
            />
            <small v-if="errors.city" class="text-red-500">{{ errors.city }}</small>
          </div>

          <!-- State -->
          <div class="flex flex-col gap-2">
            <label for="state" class="font-semibold">State *</label>
            <InputText
              id="state"
              v-model="formData.state"
              placeholder="Enter state"
              :class="{ 'p-invalid': errors.state }"
            />
            <small v-if="errors.state" class="text-red-500">{{ errors.state }}</small>
          </div>

          <!-- Postal Code -->
          <div class="flex flex-col gap-2">
            <label for="postalCode" class="font-semibold">Postal Code *</label>
            <InputText
              id="postalCode"
              v-model="formData.postal_code"
              placeholder="Enter postal code"
              :class="{ 'p-invalid': errors.postal_code }"
            />
            <small v-if="errors.postal_code" class="text-red-500">{{ errors.postal_code }}</small>
          </div>

          <!-- Country -->
          <div class="flex flex-col gap-2">
            <label for="country" class="font-semibold">Country *</label>
            <Dropdown
              id="country"
              v-model="formData.country"
              :options="countryOptions"
              placeholder="Select country"
              :class="{ 'p-invalid': errors.country }"
              filter
            />
            <small v-if="errors.country" class="text-red-500">{{ errors.country }}</small>
          </div>
        </div>
      </div>

      <!-- Emergency Contact Section -->
      <div class="border border-gray-200 rounded-lg p-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <i class="pi pi-phone mr-2 text-red-500"></i>
          Emergency Contact
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Emergency Contact Name -->
          <div class="flex flex-col gap-2">
            <label for="emergencyContactName" class="font-semibold">Contact Name *</label>
            <InputText
              id="emergencyContactName"
              v-model="formData.emergency_contact_name"
              placeholder="Enter emergency contact name"
              :class="{ 'p-invalid': errors.emergency_contact_name }"
            />
            <small v-if="errors.emergency_contact_name" class="text-red-500">{{ errors.emergency_contact_name }}</small>
          </div>

          <!-- Emergency Contact Phone -->
          <div class="flex flex-col gap-2">
            <label for="emergencyContactPhone" class="font-semibold">Contact Phone *</label>
            <InputText
              id="emergencyContactPhone"
              v-model="formData.emergency_contact_phone"
              placeholder="Enter emergency contact phone"
              :class="{ 'p-invalid': errors.emergency_contact_phone }"
            />
            <small v-if="errors.emergency_contact_phone" class="text-red-500">{{ errors.emergency_contact_phone }}</small>
          </div>
        </div>
      </div>

      <!-- Notes Section -->
      <div class="border border-gray-200 rounded-lg p-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <i class="pi pi-file-edit mr-2 text-purple-500"></i>
          Additional Notes
        </h3>

        <div class="grid grid-cols-1 gap-4">
          <!-- Medical Notes -->
          <div class="flex flex-col gap-2">
            <label for="medicalNotes" class="font-semibold">Medical Notes</label>
            <Textarea
              id="medicalNotes"
              v-model="formData.medical_notes"
              placeholder="Enter any medical notes or conditions"
              rows="3"
            />
          </div>

          <!-- Care Notes -->
          <div class="flex flex-col gap-2">
            <label for="careNotes" class="font-semibold">Care Notes</label>
            <Textarea
              id="careNotes"
              v-model="formData.care_notes"
              placeholder="Enter any care instructions or special requirements"
              rows="3"
            />
          </div>

          <!-- Client Status -->
          <div class="flex flex-col gap-2">
            <label for="clientStatus" class="font-semibold">Client Status *</label>
            <Dropdown
              id="clientStatus"
              v-model="formData.is_active"
              :options="statusOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Select client status"
              :class="{ 'p-invalid': errors.is_active }"
            />
            <small v-if="errors.is_active" class="text-red-500">{{ errors.is_active }}</small>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button label="Cancel" severity="secondary" @click="handleClose" outlined />
        <Button
          :label="editMode ? 'Update Client' : 'Add Client'"
          @click="handleSubmit"
          :loading="loading"
          icon="pi pi-save"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useClients } from '@/composables/useClients'
import { useHousesDummy } from '@/composables/useHousesDummy'
import type { CreateClientRequest, Client } from '@/views/Clients/types'
import type { House } from '@/views/Houses/types'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'

interface Props {
  visible: boolean
  client?: Client | null
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'client-added'): void
  (e: 'client-updated'): void
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  client: null
})

const emit = defineEmits<Emits>()

const { createClient, updateClient, loading } = useClients()
const { houses, fetchHouses, loading: housesLoading } = useHousesDummy()

const formData = ref<CreateClientRequest>({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  house_id: 1,
  address_line_1: '',
  address_line_2: '',
  city: '',
  state: '',
  postal_code: '',
  country: 'Australia',
  date_of_birth: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  medical_notes: '',
  care_notes: '',
  is_active: true
})

const dateOfBirth = ref<Date | null>(null)
const errors = ref<Record<string, string>>({})

// Country options
const countryOptions = [
  'Australia',
  'United States',
  'Canada',
  'United Kingdom',
  'New Zealand',
  'Germany',
  'France',
  'Italy',
  'Spain',
  'Japan',
  'China',
  'India',
  'Brazil',
  'Mexico',
  'South Africa'
]

// Status options
const statusOptions = [
  { label: 'Active', value: true },
  { label: 'Inactive', value: false }
]

const isVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const editMode = computed(() => !!props.client)

// Define resetForm function before it's used
const resetForm = () => {
  formData.value = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    house_id: 0,
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Australia',
    date_of_birth: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    medical_notes: '',
    care_notes: '',
    is_active: true
  }
  dateOfBirth.value = null
}

// Watch for client changes to populate form in edit mode
watch(
  () => props.client,
  (newClient) => {
    if (newClient) {
      formData.value = {
        first_name: newClient.first_name,
        last_name: newClient.last_name,
        email: newClient.email,
        phone: newClient.phone,
        house_id: newClient.house_id,
        address_line_1: newClient.address_line_1,
        address_line_2: newClient.address_line_2 || '',
        city: newClient.city,
        state: newClient.state,
        postal_code: newClient.postal_code,
        country: newClient.country,
        date_of_birth: newClient.date_of_birth,
        emergency_contact_name: newClient.emergency_contact_name,
        emergency_contact_phone: newClient.emergency_contact_phone,
        medical_notes: newClient.medical_notes || '',
        care_notes: newClient.care_notes || '',
        is_active: newClient.is_active
      }
      dateOfBirth.value = new Date(newClient.date_of_birth)
    } else {
      // Reset form for add mode
      resetForm()
    }
    errors.value = {}
  },
  { immediate: true }
)

// Watch dateOfBirth changes
watch(dateOfBirth, (newDate) => {
  if (newDate) {
    formData.value.date_of_birth = newDate.toISOString().split('T')[0]
  }
})

// House selection methods
const selectHouse = (house: House) => {
  formData.value.house_id = house.id
  // Clear any house selection errors
  if (errors.value.house_id) {
    delete errors.value.house_id
  }
}

const validateForm = (): boolean => {
  errors.value = {}
  let isValid = true

  // Required field validations
  const requiredFields = [
    'first_name',
    'last_name',
    'email',
    'phone',
    'address_line_1',
    'city',
    'state',
    'postal_code',
    'country',
    'emergency_contact_name',
    'emergency_contact_phone'
  ]

  requiredFields.forEach(field => {
    if (!formData.value[field as keyof CreateClientRequest] ||
        String(formData.value[field as keyof CreateClientRequest]).trim() === '') {
      errors.value[field] = `${field.replace('_', ' ')} is required`
      isValid = false
    }
  })

  // Date of birth validation
  if (!dateOfBirth.value) {
    errors.value.date_of_birth = 'Date of birth is required'
    isValid = false
  } else if (dateOfBirth.value > new Date()) {
    errors.value.date_of_birth = 'Date of birth cannot be in the future'
    isValid = false
  }

  // Email validation
  if (formData.value.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.value.email)) {
      errors.value.email = 'Please enter a valid email address'
      isValid = false
    }
  }

  // Status validation
  if (formData.value.is_active === null || formData.value.is_active === undefined) {
    errors.value.is_active = 'Client status is required'
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
    if (editMode.value && props.client) {
      // Update existing client
      result = await updateClient(props.client.id, formData.value)
      if (result?.success) {
        emit('client-updated')
        handleClose()
      }
    } else {
      // Create new client
      result = await createClient(formData.value)
      if (result?.success) {
        emit('client-added')
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

// Fetch houses when component is mounted
onMounted(() => {
  fetchHouses({ limit: 100 }) // Fetch up to 100 houses
})
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
