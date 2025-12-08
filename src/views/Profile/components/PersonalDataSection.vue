<template>
  <Card class="mb-8 profile-panel">
    <template #header>
      <div class="px-6 py-4 border-b border-gray-200 profile-panel__header">
        <h2 class="text-xl font-semibold text-gray-900 flex items-center">
          <i class="pi pi-user mr-3 text-blue-600"></i>
          Contact Information
        </h2>
      </div>
    </template>

    <template #content>
      <div class="p-6 profile-panel__body">
        <!-- View Mode -->
        <div v-if="!editing" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:divide-x lg:divide-gray-200">
            <!-- Date of Birth -->
            <div class="lg:pl-6 lg:first:pl-0">
              <label class="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
              <div class="text-lg font-semibold text-gray-600 break-words">
                {{ formatDate(profileData.dateOfBirth) || 'Not provided' }}
              </div>
            </div>

            <!-- Email -->
            <div class="lg:pl-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div class="text-lg font-semibold text-gray-600 break-all">
                {{ user?.email || 'Not provided' }}
              </div>
            </div>

            <!-- Phone -->
            <div class="lg:pl-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <div class="text-lg font-semibold text-gray-600 break-words">
                {{ formattedPhone }}
              </div>
            </div>

            <!-- Address -->
            <div class="md:col-span-2 lg:col-span-1 lg:pl-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <div class="text-lg font-semibold text-gray-600 break-words">
                {{ profileData.address || 'Not provided' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Edit Mode -->
        <div v-else class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Full Name -->
            <div>
              <label for="fullName" class="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span class="text-red-500">*</span>
              </label>
              <InputText
                id="fullName"
                :model-value="profileData.fullName"
                @update:model-value="updateField('fullName', $event)"
                placeholder="Enter your full name"
                class="w-full"
                required
              />
            </div>

            <!-- Email -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span class="text-red-500">*</span>
              </label>
              <InputText
                id="email"
                :model-value="profileData.email"
                @update:model-value="updateField('email', $event)"
                placeholder="Enter your email"
                type="email"
                class="w-full"
                required
              />
            </div>

            <!-- Phone -->
            <div>
              <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <CountryPhoneInput
                v-model="phoneLocalNumber"
                v-model:countryDialCode="phoneDialCode"
                placeholder="Enter your phone number"
              />
            </div>

            <!-- Date of Birth -->
            <div>
              <label for="dateOfBirth" class="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              <div class="relative">
                <Calendar
                  id="dateOfBirth"
                  :model-value="profileData.dateOfBirth ? new Date(profileData.dateOfBirth) : null"
                  @update:model-value="updateDateField('dateOfBirth', $event)"
                  placeholder="Select your date of birth"
                  class="w-full calendar-with-icon"
                  dateFormat="yy-mm-dd"
                  :maxDate="new Date()"
                  :yearNavigator="true"
                  yearRange="1940:2010"
                />
                <i class="pi pi-calendar absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10"></i>
              </div>
            </div>
          </div>

          <!-- Address (full width) -->
          <div>
            <label for="address" class="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <Textarea
              id="address"
              :model-value="profileData.address"
              @update:model-value="updateField('address', $event)"
              placeholder="Enter your full address"
              class="w-full"
              rows="3"
              autoResize
            />
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Calendar from 'primevue/calendar'
import CountryPhoneInput from '@/components/shared/CountryPhoneInput.vue'
import { COUNTRY_BY_NAME, DEFAULT_COUNTRY_NAME } from '@/constants/countries'
import { combineDialCodeAndNumber, splitPhoneNumber, sanitizeDialCode, formatInternationalPhone } from '@/lib/phone'
import type { User } from '@/stores/auth'
import type { ProfileData } from '../types'

interface Props {
  user: User | null
  editing: boolean
  profileData: ProfileData
}

interface Emits {
  (e: 'update', field: string, value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const defaultDialCode = sanitizeDialCode(
  COUNTRY_BY_NAME.get(DEFAULT_COUNTRY_NAME.toLowerCase())?.dial_code
)
const phoneDialCode = ref(defaultDialCode)
const phoneLocalNumber = ref('')

watch(
  () => props.profileData.phone,
  (newPhone) => {
    const parts = splitPhoneNumber(newPhone)
    phoneDialCode.value = parts.dialCode
    phoneLocalNumber.value = parts.nationalNumber
  },
  { immediate: true }
)

watch([phoneDialCode, phoneLocalNumber], ([dialCode, localNumber]) => {
  const combined = localNumber ? combineDialCodeAndNumber(dialCode, localNumber) : ''
  if ((props.profileData.phone || '') !== combined) {
    emit('update', 'phone', combined)
  }
})

const formattedPhone = computed(() => {
  const formatted = formatInternationalPhone(props.profileData.phone)
  return formatted || 'Not provided'
})

// const displayFullName = computed(() => {
//   const user = props.user
//   if (!user) return 'Not provided'

//   const firstName = user.first_name
//   const lastName = user.last_name

//   if (firstName && lastName) {
//     return `${firstName} ${lastName}`
//   } else if (firstName) {
//     return firstName
//   } else if (user.email) {
//     return user.email.split('@')[0]
//   }

//   return 'Not provided'
// })

const updateField = (field: string, value: string | undefined) => {
  emit('update', field, value || '')
}

const updateDateField = (field: string, value: Date | null) => {
  const dateString = value ? value.toISOString().split('T')[0] : ''
  emit('update', field, dateString)
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''

  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.profile-panel {
  background-color: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 1.25rem;
  box-shadow: var(--app-card-shadow);
  transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

.profile-panel__header {
  border-color: var(--app-border);
  color: var(--app-text-strong);
}

.profile-panel__body {
  background-color: var(--app-surface);
  color: var(--app-text);
}

.profile-panel label {
  color: var(--app-text-muted);
}

:deep(.p-card-header) {
  padding: 0;
}

:deep(.p-card-content) {
  padding: 0;
}

/* Input field styling */
:deep(.p-inputtext) {
  padding: 0.75rem;
  border: 2px solid var(--app-border);
  border-radius: 8px;
  transition: border-color 0.3s ease, background-color 0.3s ease;
  background-color: var(--app-input-bg);
  color: var(--app-text);
}

:deep(.p-inputtext:focus) {
  border-color: var(--app-accent);
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.35);
}

:deep(.p-calendar .p-inputtext) {
  width: 100%;
}

:deep(.p-textarea) {
  border: 2px solid var(--app-border);
  border-radius: 8px;
  padding: 0.75rem;
  transition: border-color 0.3s ease, background-color 0.3s ease;
  background-color: var(--app-input-bg);
  color: var(--app-text);
}

:deep(.p-textarea:focus) {
  border-color: var(--app-accent);
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.35);
}

/* Calendar icon styling - position inside the input field */
:deep(.calendar-with-icon .p-inputtext) {
  padding-right: 2.5rem;
}
</style>
