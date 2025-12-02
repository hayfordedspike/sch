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

interface Props {
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const attrs = useAttrs()
const inputRef = ref()

const hasError = computed(() => {
  const errorMessages = attrs['error-messages']

  if (Array.isArray(errorMessages)) {
    return errorMessages.length > 0
  }

  if (typeof errorMessages === 'string') {
    return errorMessages.trim().length > 0
  }

  return false
})

const hasRequiredError = computed(() => {
  return !props.loading && attrs.required && inputRef.value && !inputRef.value.value
})

const fieldColor = computed(() => {
  return hasError.value || hasRequiredError.value ? 'error' : 'primary'
})
</script>