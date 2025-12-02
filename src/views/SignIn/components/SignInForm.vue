<template>
  <form class="mt-8 space-y-6" novalidate @submit.prevent="onSubmit">
    <div class="space-y-5">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email address</label>
        <input
          id="email"
          v-model="formData.email"
          type="email"
          autocomplete="email"
          required
          :class="inputClasses('email')"
          placeholder="Enter your email"
        />
        <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          id="password"
          v-model="formData.password"
          type="password"
          required
          :class="inputClasses('password')"
          placeholder="Enter your password"
        />
        <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
      </div>
    </div>

    <p v-if="errors.api" class="text-sm text-red-600">{{ errors.api }}</p>

    <button
      type="submit"
      class="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 px-4 text-white font-semibold shadow transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
      :disabled="loading"
    >
      <i v-if="loading" class="pi pi-spin pi-spinner" aria-hidden="true"></i>
      <span>Sign in</span>
    </button>
  </form>
</template>

<script setup lang="ts">
defineOptions({ name: 'SignInForm' })

import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
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

const baseInputClasses = 'block w-full rounded-lg border px-3 py-2 shadow-sm focus:outline-none transition-colors duration-200 text-gray-900 placeholder-gray-400'
const inputClasses = (field: keyof FormErrors) => {
  const hasError = Boolean(errors[field])
  const stateClasses = hasError
    ? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500'
    : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'

  return `${baseInputClasses} ${stateClasses}`
}

const validateForm = (): boolean => {
  // Clear previous errors
  errors.email = ''
  errors.password = ''
  errors.api = ''

  let isValid = true

  // Email validation
  if (!formData.email) {
    errors.email = 'Email is required.'
    isValid = false
  } else if (!formData.email.includes('@')) {
    errors.email = 'Please enter a valid email address.'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Please enter a valid email address.'
    isValid = false
  }

  // Password validation
  if (!formData.password) {
    errors.password = 'Password is required.'
    isValid = false
  } else if (formData.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.'
    isValid = false
  } else if (!/\d/.test(formData.password)) {
    errors.password = 'Password must contain at least one number.'
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
