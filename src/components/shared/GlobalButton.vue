<template>
  <v-btn
    v-bind="$attrs"
    :style="buttonStyle"
  >
    <slot />
  </v-btn>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: 'primary' | 'secondary'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'primary'
})

const buttonStyle = computed(() => {
  const base = {
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.4)'
  }
  if (props.type === 'secondary') {
    return {
      ...base,
      backgroundColor: 'white',
      color: '#1976D2',
      border: '1px solid #1976D2',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.4)'
    }
  } else {
    return {
      ...base,
      backgroundColor: '#1976D2',
      color: 'white',
      border: 'none',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.4)'
    }
  }
})
</script>
