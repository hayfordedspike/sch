<template>
  <form class="mt-8 space-y-6" @submit.prevent="onSubmit">
    <div class="space-y-4">
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
        label="Sign in"
      />
    </div>

    <!-- Horizontal line and copyright - HIDDEN -->
    <!-- <div class="pt-4">
      <hr class="border-gray-200" />
      <p class="mt-4 text-center text-xs text-gray-500">
        © {{ currentYear }} All rights reserved
      </p>
    </div> -->
  </form>
</template>

<script setup lang="ts">
defineOptions({ name: 'SignInForm' })

import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import { useAuthStore } from '@/stores/auth'
import type { SignInFormData } from '../types'

interface FormErrors {
  email?: string
  password?: string
  api?: string
}

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

const loading = ref(false)

const formData = reactive<SignInFormData>({
  email: '',
  password: '',
  rememberMe: false
})

const errors = reactive<FormErrors>({})

const validateForm = (): boolean => {
  // Clear previous errors
  errors.email = ''
  errors.password = ''
  errors.api = ''

  let isValid = true

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

  return isValid
}

const onSubmit = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true

  try {
    // Call the auth store signIn method
    await authStore.signIn({ 
      email: formData.email, 
      password: formData.password,
      rememberMe: formData.rememberMe 
    })

    // Sign in successful, show success toast and redirect
    toast.add({
      severity: 'success',
      summary: 'Sign In Successful',
      detail: 'Welcome back! You have been signed in successfully.',
      life: 3000
    })
    
    // Redirect to intended page or dashboard
    const redirectPath = router.currentRoute.value.query.redirect as string
    if (redirectPath && redirectPath !== '/signin') {
      router.push(redirectPath)
    } else {
      router.push('/')
    }
  } catch (error) {
    console.error('Sign in error:', error)
    const errorMessage = authStore.getError() || 'Sign in failed'
    
    toast.add({
      severity: 'error',
      summary: 'Sign In Failed',
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

/* Ensure both input fields have consistent styling */
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
