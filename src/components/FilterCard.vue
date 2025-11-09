<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Current date state
const currentDate = ref(new Date())

// Format the current date for display
const formattedDate = computed(() => {
  return currentDate.value.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

// Navigation functions
const goToPreviousMonth = () => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() - 1)
  currentDate.value = newDate
}

const goToNextMonth = () => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() + 1)
  currentDate.value = newDate
}

// Filter options
const filterOptions = ref([
  { label: 'All Schedules', value: 'all' },
  { label: 'Today Only', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' }
])

const selectedFilter = ref('all')

// Navigate to roster page
const goToRoster = () => {
  router.push('/roster')
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div class="flex items-center justify-between">
      <!-- Date Navigation -->
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

      <!-- Center Filter Dropdown -->
      <div class="flex items-center space-x-3">
        <label class="text-sm font-medium text-gray-700">Filter:</label>
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

      <!-- Go To Roster Button -->
      <button
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