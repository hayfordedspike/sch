<template>
  <form class="mt-8 space-y-6" novalidate @submit.prevent="onSubmit">
    <div class="space-y-4">
      <div>
        <GlobalTextField
          id="email"
          v-model="formData.email"
          label="Email address"
          type="email"
          autocomplete="email"
          required
          :error-messages="errors.email"
          placeholder="Enter your email"
        />
      </div>

      <div>
        <GlobalTextField
          id="password"
          v-model="formData.password"
          label="Password"
          type="password"
          required
          :error-messages="errors.password"
          placeholder="Enter your password"
        />
      </div>
    </div>

  

    <div>
      <GlobalButton
        @click="onSubmit"
        :loading="loading"
        block
        size="large"
      >
        Sign in
      </GlobalButton>
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
import { useAuthStore } from '@/stores/auth'
import { GlobalTextField, GlobalButton } from '@/components'
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
    errors.email = ' '
    isValid = false
  } else if (!formData.email.includes('@')) {
    errors.email = ' '
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = ' '
    isValid = false
  }

  // Password validation
  if (!formData.password) {
    errors.password = ' '
    isValid = false
  } else if (formData.password.length < 6) {
    errors.password = ' '
    isValid = false
  } else if (!/\d/.test(formData.password)) {
    errors.password = ' '
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
/* Vuetify components handle their own styling, no additional CSS needed */
</style>
