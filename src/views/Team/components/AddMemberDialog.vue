<template>
  <Dialog
    v-model:visible="dialogVisible"
    modal
    :header="isEditing ? 'Edit Member' : 'Add New Member'"
    :style="{ width: '50rem' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    class="p-fluid"
  >
    <form @submit.prevent="handleSubmit" class="space-y-6 p-2">
      <!-- Row 1: Full Name and Email -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2">
          <label for="name" class="block text-sm font-semibold text-muted">
            Full Name <span class="text-red-500">*</span>
          </label>
          <InputText
            id="name"
            v-model="formData.name"
            placeholder="Enter full name"
            :class="{ 'p-invalid': errors.name }"
            required
          />
          <small v-if="errors.name" class="text-red-500 text-xs">{{ errors.name }}</small>
        </div>

        <div class="space-y-2">
          <label for="email" class="block text-sm font-semibold text-muted">
            Email Address <span class="text-red-500">*</span>
          </label>
          <InputText
            id="email"
            v-model="formData.email"
            type="email"
            placeholder="Enter email address"
            :class="{ 'p-invalid': errors.email }"
            required
          />
          <small v-if="errors.email" class="text-red-500 text-xs">{{ errors.email }}</small>
        </div>
      </div>

      <!-- Row 2: Phone and Address -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2">
          <label for="phone" class="block text-sm font-semibold text-muted">
            Phone Number
          </label>
          <CountryPhoneInput
            v-model="phoneLocalNumber"
            v-model:countryDialCode="phoneDialCode"
            placeholder="Enter phone number"
            :error="errors.phone"
          />
        </div>

        <div class="space-y-2">
          <label for="address" class="block text-sm font-semibold text-muted">
            Address
          </label>
          <InputText
            id="address"
            v-model="formData.address"
            placeholder="Enter full address"
            :class="{ 'p-invalid': errors.address }"
          />
          <small v-if="errors.address" class="text-red-500 text-xs">{{ errors.address }}</small>
        </div>
      </div>

      <!-- Availability Cards -->
      <div class="space-y-4">
        <label class="block text-sm font-semibold text-muted">
          Availability <span class="text-red-500">*</span>
        </label>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <div
            v-for="day in daysOfWeek"
            :key="day.value"
            @click="toggleDay(day.value)"
            :class="[
              'member-availability',
              { 'member-availability--active': formData.availability.includes(day.value) }
            ]"
          >
            <div class="font-medium text-sm whitespace-nowrap">{{ day.label }}</div>
          </div>
        </div>
        <small v-if="errors.availability" class="text-red-500 text-xs">{{ errors.availability }}</small>
      </div>

      <!-- Notes Section -->
      <div class="space-y-2 pt-4">
        <label for="notes" class="block text-sm font-semibold text-muted">
          Notes
        </label>
        <Textarea
          id="notes"
          v-model="formData.notes"
          rows="4"
          placeholder="Enter any additional notes about this member..."
          :class="{ 'p-invalid': errors.notes }"
        />
        <small v-if="errors.notes" class="text-red-500 text-xs">{{ errors.notes }}</small>
      </div>
    </form>

    <template #footer>
      <div class="flex justify-end gap-3 pt-4">
      
         <Button
          label="Cancel"
          icon="pi pi-times"
          @click="handleCancel"
          class="p-button-text"
        />
        <Button
          :label="isEditing ? 'Update Member' : 'Add Member'"
          icon="pi pi-check"
          class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white border-0 rounded-lg transition-colors"
          @click="handleSubmit"
          :loading="loading"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import CountryPhoneInput from '@/components/shared/CountryPhoneInput.vue'
import { COUNTRY_BY_NAME, DEFAULT_COUNTRY_NAME } from '@/constants/countries'
import { combineDialCodeAndNumber, splitPhoneNumber, sanitizeDialCode } from '@/lib/phone'

interface MemberFormData {
  name: string
  email: string
  phone: string
  address: string
  availability: string[]
  notes: string
}

interface MemberDialogProps {
  visible: boolean
  member?: MemberFormData | null
}

interface MemberDialogEmits {
  (e: 'update:visible', value: boolean): void
  (e: 'member-added', member: MemberFormData): void
  (e: 'member-updated', member: MemberFormData): void
}

const props = withDefaults(defineProps<MemberDialogProps>(), {
  member: null
})

const emit = defineEmits<MemberDialogEmits>()

// Days of week for availability
const daysOfWeek = [
  { label: 'Monday', value: 'Monday' },
  { label: 'Tuesday', value: 'Tuesday' },
  { label: 'Wednesday', value: 'Wednesday' },
  { label: 'Thursday', value: 'Thursday' },
  { label: 'Friday', value: 'Friday' },
  { label: 'Saturday', value: 'Saturday' },
  { label: 'Sunday', value: 'Sunday' }
]

// Form state
const loading = ref(false)
const errors = ref<Record<string, string>>({})
const defaultDialCode = sanitizeDialCode(
  COUNTRY_BY_NAME.get(DEFAULT_COUNTRY_NAME.toLowerCase())?.dial_code
)
const phoneDialCode = ref(defaultDialCode)
const phoneLocalNumber = ref('')

// Initial form data
const initialFormData: MemberFormData = {
  name: '',
  email: '',
  phone: '',
  address: '',
  availability: [],
  notes: ''
}

const formData = ref<MemberFormData>({ ...initialFormData })

// Computed
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const isEditing = computed(() => !!props.member)

// Watchers
watch(
  () => props.visible,
  (newVisible) => {
    if (newVisible) {
      resetForm()
      if (props.member) {
        // Pre-fill form with existing member data
        formData.value = { ...props.member }
        if (props.member.phone) {
          const phoneParts = splitPhoneNumber(props.member.phone)
          phoneDialCode.value = phoneParts.dialCode
          phoneLocalNumber.value = phoneParts.nationalNumber
        }
      } else {
        phoneDialCode.value = defaultDialCode
        phoneLocalNumber.value = ''
      }
    }
  }
)

watch([phoneDialCode, phoneLocalNumber], ([dialCode, localNumber]) => {
  formData.value.phone = localNumber ? combineDialCodeAndNumber(dialCode, localNumber) : ''
}, { immediate: true })

// Methods
const resetForm = () => {
  formData.value = { ...initialFormData }
  errors.value = {}
  phoneDialCode.value = defaultDialCode
  phoneLocalNumber.value = ''
}

const toggleDay = (day: string) => {
  const index = formData.value.availability.indexOf(day)
  if (index > -1) {
    formData.value.availability.splice(index, 1)
  } else {
    formData.value.availability.push(day)
  }
}

const validateForm = (): boolean => {
  errors.value = {}
  let isValid = true

  // Required field validations
  if (!formData.value.name.trim()) {
    errors.value.name = 'Name is required'
    isValid = false
  }

  if (!formData.value.email.trim()) {
    errors.value.email = 'Email is required'
    isValid = false
  } else if (!/\S+@\S+\.\S+/.test(formData.value.email)) {
    errors.value.email = 'Please enter a valid email address'
    isValid = false
  }

  if (formData.value.availability.length === 0) {
    errors.value.availability = 'Please select at least one day of availability'
    isValid = false
  }

  // Optional phone validation
  if (phoneLocalNumber.value) {
    const combinedPhone = combineDialCodeAndNumber(phoneDialCode.value, phoneLocalNumber.value)
    if (!/^\+[1-9]\d{3,14}$/.test(combinedPhone)) {
      errors.value.phone = 'Please enter a valid phone number'
      isValid = false
    }
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true

  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (isEditing.value) {
      emit('member-updated', { ...formData.value })
    } else {
      emit('member-added', { ...formData.value })
    }

    dialogVisible.value = false
  } catch (error) {
    console.error('Error saving member:', error)
    // Handle error (could show toast notification)
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  dialogVisible.value = false
}
</script>

<style scoped>
:deep(.p-dialog-header) {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  border-radius: 12px 12px 0 0;
}

:deep(.p-dialog-header .p-dialog-title) {
  font-weight: 600;
  font-size: 1.125rem;
}

:deep(.p-dialog-header .p-dialog-header-icon) {
  color: white;
}

:deep(.p-dialog-header .p-dialog-header-icon:hover) {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
}

:deep(.p-dialog-content) {
  padding: 1.5rem;
  border-radius: 0 0 12px 12px;
  background: var(--app-surface);
}

:deep(.p-dialog-footer) {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--app-border);
  background: var(--app-surface-muted);
}

/* Ensure PrimeVue inputs display properly with Tailwind styles */
:deep(.p-inputtext) {
  width: 100% !important;
  padding: 0.75rem 1rem !important;
  border: 1px solid var(--app-input-border) !important;
  border-radius: 0.5rem !important;
  font-size: 0.875rem !important;
  transition: all 0.2s ease !important;
  background-color: var(--app-input-bg) !important;
  color: var(--app-text) !important;
}

:deep(.p-inputtext:focus) {
  outline: none !important;
  border-color: #8b5cf6 !important;
  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2) !important;
}

:deep(.p-textarea) {
  width: 100% !important;
  padding: 0.75rem 1rem !important;
  border: 1px solid var(--app-input-border) !important;
  border-radius: 0.5rem !important;
  font-size: 0.875rem !important;
  transition: all 0.2s ease !important;
  background-color: var(--app-input-bg) !important;
  color: var(--app-text) !important;
  resize: none !important;
  font-family: inherit !important;
}

:deep(.p-textarea:focus) {
  outline: none !important;
  border-color: #8b5cf6 !important;
  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2) !important;
}

/* Error states */
:deep(.p-invalid.p-inputtext),
:deep(.p-invalid.p-textarea) {
  border-color: #ef4444 !important;
}

:deep(.p-invalid.p-inputtext:focus),
:deep(.p-invalid.p-textarea:focus) {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2) !important;
}

.member-availability {
  cursor: pointer;
  border-radius: 0.85rem;
  border: 2px solid var(--app-border);
  padding: 0.55rem 0.75rem;
  text-align: center;
  transition: all 0.2s ease;
  min-width: fit-content;
  background: var(--app-surface);
  color: var(--app-text-muted);
}

.member-availability:hover {
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.12);
  border-color: var(--app-accent);
}

.member-availability--active {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 12px 24px rgba(37, 99, 235, 0.35);
}
</style>
