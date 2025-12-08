<template>
  <div class="text-center space-y-4">
   
    
    <div class=" pt-4">
      <hr class="border-t-2 border-gray-300 mb-4 mt-2" />
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