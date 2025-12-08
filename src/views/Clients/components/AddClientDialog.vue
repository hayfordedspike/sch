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
            <CountryPhoneInput
              v-model="phoneLocalNumber"
              v-model:countryDialCode="phoneDialCode"
              placeholder="Enter phone number"
              :error="errors.phone"
            />
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
            <div class="flex items-center justify-between">
              <label class="font-semibold">Select House (optional)</label>
              <GlobalButton
                v-if="formData.house_id"
                label="Clear"
                severity="secondary"
                text
                size="sm"
                @click="clearHouseSelection"
              />
            </div>

            <!-- Loading State -->
            <div v-if="housesLoading" class="flex items-center justify-center py-8 text-muted">
              <i class="pi pi-spinner pi-spin mr-2 text-muted"></i>
              <span>Loading houses...</span>
            </div>

            <!-- Houses Grid -->
            <div
              v-else-if="houses.length > 0"
              class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto rounded-lg p-3 house-selection-grid"
            >
              <div
                v-for="house in houses"
                :key="house.id"
                @click="selectHouse(house)"
                :class="[
                  'house-option',
                  { 'house-option--selected': formData.house_id === house.id }
                ]"
              >
                <!-- House Header -->
                <div class="flex items-center mb-2">
                  <div class="flex-1 min-w-0">
                    <h4 class="house-option__title font-semibold text-sm truncate">{{ house.name }}</h4>
                  </div>
                  <!-- Selection Indicator -->
                  <div v-if="formData.house_id === house.id" class="ml-2">
                    <i class="pi pi-check-circle text-blue-500"></i>
                  </div>
                </div>


              </div>
            </div>

            <!-- No Houses Available -->
            <div v-else class="text-center py-8 rounded-lg house-selection-empty">
              <i class="pi pi-home text-2xl mb-2 house-selection-empty__icon"></i>
              <p class="text-muted text-sm">No houses available</p>
            </div>
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
              :disabled="isAddressLocked"
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
              :disabled="isAddressLocked"
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
              :disabled="isAddressLocked"
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
              :disabled="isAddressLocked"
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
              optionLabel="label"
              optionValue="value"
              placeholder="Select country"
              class="app-input"
              :class="{ 'p-invalid': errors.country }"
              filter
              :disabled="isAddressLocked"
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
            <CountryPhoneInput
              id="emergencyContactPhone"
              v-model="emergencyLocalNumber"
              v-model:countryDialCode="emergencyDialCode"
              placeholder="Enter emergency contact phone"
              :error="errors.emergency_contact_phone"
            />
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
              class="app-input"
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
              class="app-input"
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
              class="app-input"
              :class="{ 'p-invalid': errors.is_active }"
            />
            <small v-if="errors.is_active" class="text-red-500">{{ errors.is_active }}</small>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <GlobalButton label="Cancel" @click="handleClose" type="warning" />
        <GlobalButton
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
import { useHouses } from '@/composables/useHouses'
import CountryPhoneInput from '@/components/shared/CountryPhoneInput.vue'
import {
  COUNTRY_DROPDOWN_OPTIONS,
  COUNTRY_BY_NAME,
  DEFAULT_COUNTRY_NAME
} from '@/constants/countries'
import { combineDialCodeAndNumber, splitPhoneNumber, sanitizeDialCode } from '@/lib/phone'
import type { CreateClientRequest, Client } from '@/views/Clients/types'
import type { House } from '@/views/Houses/types'
import Dialog from 'primevue/dialog'
import GlobalButton from '@/components/shared/GlobalButton.vue'
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
const { houses, fetchHouses, loading: housesLoading } = useHouses()

const defaultDialCode = sanitizeDialCode(
  COUNTRY_BY_NAME.get(DEFAULT_COUNTRY_NAME.toLowerCase())?.dial_code
)

const formData = ref<CreateClientRequest>({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  house_id: null,
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
const phoneDialCode = ref(defaultDialCode)
const phoneLocalNumber = ref('')
const emergencyDialCode = ref(defaultDialCode)
const emergencyLocalNumber = ref('')

const selectedHouse = computed<House | null>(() => {
  if (!formData.value.house_id) {
    return null
  }
  return houses.value.find(house => house.id === formData.value.house_id) ?? null
})

const isAddressLocked = computed(() => !!selectedHouse.value)

// Country options
const countryOptions = COUNTRY_DROPDOWN_OPTIONS

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
    house_id: null,
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
  phoneDialCode.value = defaultDialCode
  phoneLocalNumber.value = ''
  emergencyDialCode.value = defaultDialCode
  emergencyLocalNumber.value = ''
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
        house_id: newClient.house_id ?? null,
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
      const phoneParts = splitPhoneNumber(newClient.phone)
      phoneDialCode.value = phoneParts.dialCode
      phoneLocalNumber.value = phoneParts.nationalNumber
      const emergencyParts = splitPhoneNumber(newClient.emergency_contact_phone)
      emergencyDialCode.value = emergencyParts.dialCode
      emergencyLocalNumber.value = emergencyParts.nationalNumber
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

const syncAddressWithHouse = (house: House) => {
  formData.value.address_line_1 = house.address_line1
  formData.value.city = house.city
  formData.value.state = house.region
  formData.value.postal_code = house.postal_code
  if (house.country) {
    formData.value.country = house.country
  }
}

watch(selectedHouse, (newHouse) => {
  if (newHouse) {
    syncAddressWithHouse(newHouse)
  }
})

watch([phoneDialCode, phoneLocalNumber], ([dialCode, localNumber]) => {
  formData.value.phone = combineDialCodeAndNumber(dialCode, localNumber)
}, { immediate: true })

watch([emergencyDialCode, emergencyLocalNumber], ([dialCode, localNumber]) => {
  formData.value.emergency_contact_phone = combineDialCodeAndNumber(dialCode, localNumber)
}, { immediate: true })

// House selection methods
const selectHouse = (house: House) => {
  if (formData.value.house_id === house.id) {
    clearHouseSelection()
    return
  }

  formData.value.house_id = house.id
  syncAddressWithHouse(house)
}

const clearHouseSelection = () => {
  formData.value.house_id = null
}

const validateForm = (): boolean => {
  errors.value = {}
  let isValid = true

  // Required field validations
  const requiredFields = [
    'first_name',
    'last_name',
    'email',
    'address_line_1',
    'city',
    'state',
    'postal_code',
    'country',
    'emergency_contact_name'
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

  if (!phoneLocalNumber.value) {
    errors.value.phone = 'Phone number is required'
    isValid = false
  }

  if (!emergencyLocalNumber.value) {
    errors.value.emergency_contact_phone = 'Emergency contact phone is required'
    isValid = false
  }

  // Status validation
  if (formData.value.is_active === null || formData.value.is_active === undefined) {
    errors.value.is_active = 'Client status is required'
    isValid = false
  }

  // Ensure address matches selected house
  if (formData.value.house_id) {
    const house = houses.value.find(h => h.id === formData.value.house_id)
    if (house) {
      const mismatchFields: Array<keyof CreateClientRequest> = []

      if (formData.value.address_line_1 !== house.address_line1) mismatchFields.push('address_line_1')
      if (formData.value.city !== house.city) mismatchFields.push('city')
      if (formData.value.state !== house.region) mismatchFields.push('state')
      if (formData.value.postal_code !== house.postal_code) mismatchFields.push('postal_code')
      if (house.country && formData.value.country !== house.country) mismatchFields.push('country')

      if (mismatchFields.length > 0) {
        mismatchFields.forEach(field => {
          errors.value[field] = 'Address must match the selected house'
        })
        isValid = false
      }
    }
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

.house-selection-grid,
.house-selection-empty {
  border: 1px solid var(--app-border);
  background: var(--app-surface);
  color: var(--app-text);
}

.house-selection-grid {
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.house-option {
  border: 1px solid var(--app-border);
  border-radius: 0.75rem;
  background: var(--app-surface);
  color: var(--app-text);
  padding: 0.75rem;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

.house-option:hover {
  border-color: var(--app-border-strong);
  background: var(--app-surface-muted);
  box-shadow: var(--app-card-shadow);
}

.house-option--selected {
  border-color: var(--app-accent);
  background: var(--app-accent-soft);
  box-shadow: 0 12px 30px rgba(6, 89, 134, 0.25);
}

.house-option__title {
  color: var(--app-text);
}

.house-selection-empty__icon {
  color: var(--app-border-strong);
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
