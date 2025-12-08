<script setup lang="ts">
import { ref, computed, watch, defineProps, defineEmits, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useEmployees } from '@/composables/useEmployees'
import GlobalButton from '@/components/shared/GlobalButton.vue'

const router = useRouter()

// Props for v-model binding
const props = defineProps<{ selectedFilter: string; currentDate: number }>()
const emit = defineEmits(['update:selectedFilter', 'update:currentDate'])

// Initialize employees composable
const { fetchEmployees, employees } = useEmployees()

// Mobile detection
const isMobile = ref(false)

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

// Local state mirrors parent
const currentDate = ref(new Date(new Date().setMonth(props.currentDate)))
const selectedFilter = ref(props.selectedFilter)

// Format the current date for display
const formattedDate = computed(() => {
  return currentDate.value.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

// Fetch employees on mount
onMounted(async () => {
  await fetchEmployees()
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

// Team members from API
const teamMembers = computed(() => {
  return employees.value.map(employee => ({
    label: `${employee.first_name} ${employee.last_name}`,
    value: employee.id.toString() // Use employee ID as value
  }))
})

const filterOptions = computed(() => {
  return [
    { label: 'All Team Members', value: 'all' },
    ...teamMembers.value
  ]
})

// Navigation functions
const goToPreviousMonth = () => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() - 1)
  currentDate.value = newDate
  emit('update:currentDate', newDate.getMonth())
}

const goToNextMonth = () => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() + 1)
  currentDate.value = newDate
  emit('update:currentDate', newDate.getMonth())
}

watch(selectedFilter, (val) => {
  emit('update:selectedFilter', val)
})

watch(() => props.selectedFilter, (val) => {
  selectedFilter.value = val
})

watch(() => props.currentDate, (val) => {
  currentDate.value = new Date(new Date().setMonth(val))
})

// Navigate to roster page
const goToRoster = () => {
  router.push('/roster')
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow-md border border-gray-200 p-4 sm:p-6 md:p-8">
    <div class="flex w-full flex-col gap-6 md:flex-row md:items-center md:justify-between">
      <div class="flex w-full flex-col gap-6 md:w-auto md:flex-row md:items-center md:gap-10">
        <div class="flex items-center justify-between gap-4 md:justify-start">
          <button
            @click="goToPreviousMonth"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Previous month"
          >
            <i class="pi pi-chevron-left text-gray-600"></i>
          </button>
          <div class="text-lg font-medium text-gray-900 text-center md:text-left">
            {{ formattedDate }}
          </div>
          <button
            @click="goToNextMonth"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Next month"
          >
            <i class="pi pi-chevron-right text-gray-600"></i>
          </button>
        </div>

        <div class="relative w-full md:w-60">
          <select
            v-model="selectedFilter"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option
              v-for="option in filterOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>

      <GlobalButton
        v-if="!isMobile"
        label="Go To Roster"
        @click="goToRoster"
        severity="primary"
        class="text-sm"
      />
    </div>
  </div>
</template><style scoped>
/* Custom styles for better interaction */
button:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

select:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Custom arrow for select */
select {
  appearance: none !important;
  -webkit-appearance: none !important;
  -moz-appearance: none !important;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e") !important;
  background-repeat: no-repeat !important;
  background-position: right 0.5rem center !important;
  background-size: 1rem !important;
  padding-right: 2.5rem !important;
}

select:focus {
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='18,15 12,9 6,15'%3e%3c/polyline%3e%3c/svg%3e") !important;
}
</style>