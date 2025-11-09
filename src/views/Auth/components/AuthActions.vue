<template>
  <div class="space-y-6">
    <div class="text-center">
      <p class="text-sm text-gray-600 mb-4">
        Didn't receive the email?
      </p>
      <Button
        @click="handleResend"
        :loading="loading"
        class="w-full bg-primary hover:bg-primary-dark"
        label="Resend Link"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'AuthActions' })

import Button from 'primevue/button'

interface Props {
  loading?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  resend: []
}>()

const handleResend = () => {
  emit('resend')
}
</script>