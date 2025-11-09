<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <SignInHeader />
      <SignInForm />
      <SignInFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'SignInView' })

import SignInHeader from './components/SignInHeader.vue'
import SignInForm from './components/SignInForm.vue'
import SignInFooter from './components/SignInFooter.vue'
</script>
