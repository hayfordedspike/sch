<script setup lang="ts">
import { ref, computed, watch, defineProps, defineEmits, onMounted } from 'vue'
import { useEmployees } from '@/composables/useEmployees'


// Props for v-model binding
const props = defineProps<{ selectedFilter: string; currentDate: number; calendarView?: 'day' | 'week' }>()
const emit = defineEmits(['update:selectedFilter', 'update:currentDate', 'update:calendarView'])

// Initialize employees composable
const { fetchEmployees, employees } = useEmployees()

// Calendar view state (Day/Week)
const calendarView = ref(props.calendarView ?? 'day')

const setCalendarView = (view: 'day' | 'week') => {
  calendarView.value = view
  emit('update:calendarView', view)
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

const selectId = `roster-team-filter-${Math.random().toString(36).slice(2, 8)}`

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


</script>
<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div class="flex items-center justify-between">
      <div class="flex flex-col gap-6 xl:flex-row xl:items-center xl:space-x-6">
        <!-- Calendar View Toggle -->

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
        <div class="roster-filter__select-group">
          <label class="roster-filter__label" :for="selectId">Team selection</label>
          <div class="roster-filter__select-wrapper">
            <select
              v-model="selectedFilter"
              :id="selectId"
              class="text-sm app-input app-select roster-filter__select"
              aria-label="Filter team members"
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
      </div>
      <div class="flex items-center space-x-2 mr-6">
          <button
            :class="['px-3 py-1 rounded-lg font-semibold text-sm', calendarView === 'day' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700']"
            @click="setCalendarView('day')"
          >Day</button>
          <button
            :class="['px-3 py-1 rounded-lg font-semibold text-sm', calendarView === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700']"
            @click="setCalendarView('week')"
          >Week</button>
        </div>
    </div>
  </div>
</template>

<style scoped>
.roster-filter__select-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.roster-filter__label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
  color: var(--app-text-muted);
}

.roster-filter__select-wrapper {
  display: inline-flex;
  width: fit-content;
  max-width: 100%;
}

.roster-filter__select {
  min-height: 2.5rem;
  min-width: 12rem;
  width: fit-content;
  text-align: center;
  text-align-last: center;
}

@media (max-width: 767px) {
  .roster-filter__select-wrapper,
  .roster-filter__select {
    width: 100%;
  }
}
</style>
