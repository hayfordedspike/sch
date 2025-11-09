<template>
  <div class="text-center space-y-4">
    <div class="text-sm text-gray-600">
      Already have an account?
      <router-link to="/signin" class="font-medium text-primary hover:text-primary-dark">
        Sign in here
      </router-link>
    </div>
    
    <div class="border-t border-gray-200 pt-4">
      <p class="text-xs text-gray-500">
        By creating an account, you agree to our terms of service and privacy policy.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'RegistrationFooter' })
</script>