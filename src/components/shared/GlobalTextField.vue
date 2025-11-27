<template>
  <v-text-field
    ref="inputRef"
    v-bind="$attrs"
    :color="fieldColor"
    :error="hasRequiredError || hasError"
    :error-messages="[]"
    variant="outlined"
  />
</template>

<script setup lang="ts">
import { computed, ref, useAttrs } from 'vue'

const attrs = useAttrs()
const inputRef = ref()

const hasError = computed(() => {
  const errorMessages = attrs['error-messages']
  return errorMessages && (Array.isArray(errorMessages) ? errorMessages.length > 0 : errorMessages.trim().length > 0)
})

const hasRequiredError = computed(() => {
  return attrs.required && inputRef.value && !inputRef.value.value
})

const fieldColor = computed(() => {
  return hasError.value || hasRequiredError.value ? 'error' : 'primary'
})
</script>