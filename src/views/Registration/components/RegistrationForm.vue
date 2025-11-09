<template>
  <form class="mt-8 space-y-6" @submit.prevent="onSubmit">
    <div class="space-y-4">
      <!-- First Name -->
      <div>
        <label for="firstName" class="block text-sm font-medium text-gray-700">
          First Name
        </label>
        <div class="mt-1">
          <InputText
            id="firstName"
            v-model="formData.firstName"
            type="text"
            autocomplete="given-name"
            required
            class="w-full"
            placeholder="Enter your first name"
            :class="{ 'p-invalid': errors.firstName }"
          />
          <small v-if="errors.firstName" class="p-error">{{ errors.firstName }}</small>
        </div>
      </div>

      <!-- Last Name -->
      <div>
        <label for="lastName" class="block text-sm font-medium text-gray-700">
          Last Name
        </label>
        <div class="mt-1">
          <InputText
            id="lastName"
            v-model="formData.lastName"
            type="text"
            autocomplete="family-name"
            required
            class="w-full"
            placeholder="Enter your last name"
            :class="{ 'p-invalid': errors.lastName }"
          />
          <small v-if="errors.lastName" class="p-error">{{ errors.lastName }}</small>
        </div>
      </div>

      <!-- Email -->
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700">
          Email address
        </label>
        <div class="mt-1">
          <InputText
            id="email"
            v-model="formData.email"
            type="email"
            autocomplete="email"
            required
            class="w-full"
            placeholder="Enter your email"
            :class="{ 'p-invalid': errors.email }"
          />
          <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
        </div>
      </div>

      <!-- Password -->
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700">
          Password
        </label>
        <div class="mt-1">
          <Password
            id="password"
            v-model="formData.password"
            :feedback="false"
            toggleMask
            required
            class="w-full"
            inputClass="w-full"
            placeholder="Enter your password"
            :class="{ 'p-invalid': errors.password }"
          />
          <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
        </div>
      </div>

      <!-- Confirm Password -->
      <div>
        <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <div class="mt-1">
          <Password
            id="confirmPassword"
            v-model="formData.confirmPassword"
            :feedback="false"
            toggleMask
            required
            class="w-full"
            inputClass="w-full"
            placeholder="Confirm your password"
            :class="{ 'p-invalid': errors.confirmPassword }"
          />
          <small v-if="errors.confirmPassword" class="p-error">{{ errors.confirmPassword }}</small>
        </div>
      </div>
    </div>

    <!-- API Error Message -->
    <div v-if="errors.api" class="bg-red-50 border border-red-200 rounded-md p-3">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">{{ errors.api }}</p>
        </div>
      </div>
    </div>

    <div>
      <Button
        type="submit"
        :loading="loading"
        class="w-full bg-primary hover:bg-primary-dark"
        label="Create Account"
      />
    </div>

    <!-- Horizontal line and copyright -->
    <div class="pt-4">
      <hr class="border-gray-200" />
      <p class="mt-4 text-center text-xs text-gray-500">
        © {{ currentYear }} All rights reserved
      </p>
    </div>
  </form>
</template>

<script setup lang="ts">
defineOptions({ name: 'RegistrationForm' })

import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import { useAuthStore } from '@/stores/auth'
import type { RegistrationFormData, RegistrationApiPayload } from '../types'

interface FormErrors {
  firstName?: string
  lastName?: string
  email?: string
  password?: string
  confirmPassword?: string
  api?: string
}

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

const loading = ref(false)
const currentYear = computed(() => new Date().getFullYear())

const formData = reactive<RegistrationFormData>({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const errors = reactive<FormErrors>({})

const validateForm = (): boolean => {
  // Clear previous errors
  errors.firstName = ''
  errors.lastName = ''
  errors.email = ''
  errors.password = ''
  errors.confirmPassword = ''
  errors.api = ''

  let isValid = true

  // First Name validation
  if (!formData.firstName.trim()) {
    errors.firstName = 'First name is required'
    isValid = false
  }

  // Last Name validation
  if (!formData.lastName.trim()) {
    errors.lastName = 'Last name is required'
    isValid = false
  }

  // Email validation
  if (!formData.email) {
    errors.email = 'Enter a valid email'
    isValid = false
  } else if (!formData.email.includes('@')) {
    errors.email = 'Enter a valid email'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Enter a valid email'
    isValid = false
  }

  // Password validation
  if (!formData.password) {
    errors.password = 'Password must be at least 6 characters'
    isValid = false
  } else if (formData.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
    isValid = false
  } else if (!/\d/.test(formData.password)) {
    errors.password = 'Password must contain at least one number'
    isValid = false
  }

  // Confirm Password validation
  if (!formData.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password'
    isValid = false
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
    isValid = false
  }

  return isValid
}

const onSubmit = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true

  try {
    // Create the API payload
    const apiPayload: RegistrationApiPayload = {
      email: formData.email,
      first_name: formData.firstName,
      last_name: formData.lastName,
      password: formData.password,
      hashed_password: formData.password, // The backend will handle hashing
      is_active: true,
      is_superuser: false
    }

    // Call the auth store register method
    const result = await authStore.register(apiPayload)

    if (result) {
      // Registration successful, show success toast and redirect
      toast.add({
        severity: 'success',
        summary: 'Registration Successful',
        detail: 'Account created successfully! Please check your email for verification.',
        life: 5000
      })

      // Redirect to verification page
      router.push('/auth/verify')
    } else {
      // Registration failed, show error toast
      const errorMessage = authStore.getError() || 'Registration failed'
      toast.add({
        severity: 'error',
        summary: 'Registration Failed',
        detail: errorMessage,
        life: 5000
      })

      // Also show in the form
      errors.api = errorMessage
    }
  } catch (error) {
    console.error('Registration error:', error)
    const errorMessage = authStore.getError() || 'Registration failed'

    toast.add({
      severity: 'error',
      summary: 'Registration Failed',
      detail: errorMessage,
      life: 5000
    })

    errors.api = errorMessage
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Ensure password field matches email field styling */
:deep(.p-password) {
  width: 100%;
}

:deep(.p-password .p-inputtext) {
  width: 100%;
  padding-right: 2.5rem; /* Make room for the toggle icon */
}

:deep(.p-password .p-password-toggle-icon) {
  right: 0.75rem;
  color: #6b7280; /* Gray color to match the design */
}

/* Ensure all input fields have consistent styling */
:deep(.p-inputtext) {
  height: 2.5rem; /* Consistent height */
  padding: 0.5rem 0.75rem;
}

/* Red styling for invalid fields */
:deep(.p-invalid .p-inputtext) {
  border-color: #ef4444 !important; /* Red border */
  background-color: #fef2f2; /* Light red background */
  color: #dc2626; /* Red text */
}

:deep(.p-invalid) {
  border-color: #ef4444 !important;
}

/* Error message styling */
.p-error {
  color: #dc2626 !important;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
</style>
