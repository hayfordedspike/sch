import { ref } from 'vue'

// Debounce function with proper typing
export function useDebounce<T extends (...args: never[]) => void>(
  fn: T,
  delay: number
): T {
  const timeoutRef = ref<number | null>(null)

  return ((...args: Parameters<T>) => {
    if (timeoutRef.value) {
      clearTimeout(timeoutRef.value)
    }

    timeoutRef.value = window.setTimeout(() => {
      fn(...args)
    }, delay)
  }) as T
}