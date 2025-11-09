import { ref, watch, type Ref } from 'vue'

// Debounce a ref value
export function useDebouncedRef<T>(
  source: Ref<T>,
  delay: number
): Ref<T> {
  const debounced = ref(source.value) as Ref<T>
  let timeout: number | null = null

  watch(
    source,
    (newValue) => {
      if (timeout) {
        clearTimeout(timeout)
      }

      timeout = window.setTimeout(() => {
        debounced.value = newValue
      }, delay)
    },
    { immediate: true }
  )

  return debounced
}