<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 text-center">
      <AuthHeader />
      <AuthMessage />
      <AuthActions @resend="handleResend" :loading="resending" />
      <AuthFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'AuthVerificationView' })

import { ref } from 'vue'
import AuthHeader from './components/AuthHeader.vue'
import AuthMessage from './components/AuthMessage.vue'
import AuthActions from './components/AuthActions.vue'
import AuthFooter from './components/AuthFooter.vue'

const resending = ref(false)

const handleResend = async () => {
  resending.value = true
  
  try {
    // TODO: Implement resend verification email logic
    console.log('Resending verification email...')
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Show success message or toast
    console.log('Verification email sent!')
  } catch (error) {
    console.error('Failed to resend email:', error)
  } finally {
    resending.value = false
  }
}
</script>