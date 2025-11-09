<template>
  <div class="text-center space-y-4">
    <div class="text-sm text-gray-600">
      Don't have an account?
      <a href="#" class="font-medium text-primary hover:text-primary-dark">
        Contact your administrator
      </a>
    </div>
    
    <div class="border-t border-gray-200 pt-4">
      <p class="text-xs text-gray-500">
        © {{ currentYear }} Scheduler. All rights reserved.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'SignInFooter' })

import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>