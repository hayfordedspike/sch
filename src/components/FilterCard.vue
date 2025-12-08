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

const selectId = `team-filter-${Math.random().toString(36).slice(2, 8)}`

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
  <div class="filter-card bg-white rounded-2xl shadow-md border border-gray-200 p-4 sm:p-6 md:p-8">
    <div class="filter-card__content">
      <div class="filter-card__date">
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

      <div class="filter-card__select-group">
       
        <div class="filter-card__select-wrapper">
          <select
            v-model="selectedFilter"
            :id="selectId"
            class="text-sm app-input app-select filter-card__select"
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

      <GlobalButton
        label="Go To Roster"
        @click="goToRoster"
        severity="primary"
        class="text-sm filter-card__roster-btn"
        :class="{ 'filter-card__roster-btn--mobile': isMobile }"
        :aria-label="isMobile ? 'Go to roster (opens roster view)' : undefined"
      />
    </div>
  </div>
</template>

<style scoped>
/* Custom styles for better interaction */
button:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.filter-card {
  position: relative;
  overflow: visible;
}

.filter-card__content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .filter-card__content {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .filter-card__date,
  .filter-card__select-group {
    flex: 1;
  }
}

.filter-card__date {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.filter-card__select-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.filter-card__label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
  color: var(--app-text-muted);
}

.filter-card__select-wrapper {
  position: relative;
  display: inline-flex;
  width: fit-content;
  max-width: 100%;
}

.filter-card__select {
  min-height: 2.75rem;
  width: fit-content;
  min-width: 12rem;
}

.filter-card__roster-btn {
  margin-left: auto;
}

.filter-card__roster-btn--mobile {
  width: 100%;
  margin-top: 1rem;
}

@media (max-width: 767px) {
  .filter-card__date {
    flex-direction: row;
    align-items: center;
  }

  .filter-card__content {
    gap: 1.25rem;
  }

  .filter-card__select-wrapper,
  .filter-card__select {
    width: 100%;
  }
}
</style>