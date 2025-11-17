<script setup lang="ts">
import { ref, computed, watch, defineProps, defineEmits, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useEmployees } from '@/composables/useEmployees'

const router = useRouter()

// Props for v-model binding
const props = defineProps<{ selectedFilter: string; currentDate: number }>()
const emit = defineEmits(['update:selectedFilter', 'update:currentDate'])

// Initialize employees composable
const { fetchEmployees, employees } = useEmployees()

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
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div class="flex items-center justify-between">

      <div class="flex items-center space-x-6">

        <div class="flex items-center space-x-4">
          <button
            @click="goToPreviousMonth"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Previous month"
          >
            <i class="pi pi-chevron-left text-gray-600"></i>
          </button>
          <div class="text-lg font-medium text-gray-900 min-w-0">
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

        <div class="flex items-center space-x-3">
          <select
            v-model="selectedFilter"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

      </div> <button
        @click="goToRoster"
        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Go To Roster
      </button>

    </div>
  </div>
</template>

<style scoped>
/* Custom styles for better interaction */
button:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

select:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>
