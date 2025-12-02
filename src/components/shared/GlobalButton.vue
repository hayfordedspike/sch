<template>
  <v-btn
    v-bind="$attrs"
    :class="variantClass"
  >
    <slot />
  </v-btn>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: 'primary' | 'secondary' | 'tertiary'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'primary'
})

const variantClass = computed(() => {
  const base = 'shadow-[0_4px_6px_rgba(0,0,0,0.4)] border transition-colors duration-200 rounded-lg'

  if (props.type === 'secondary') {
    return `${base} bg-white text-[#1976D2] border-[#1976D2] hover:bg-blue-50`
  }

  if (props.type === 'tertiary') {
    return `${base} bg-white text-red-600 border-red-600 hover:bg-red-50`
  }

  return `${base} bg-[#1976D2] text-white border-transparent hover:bg-[#12579f]`
})
</script>
