
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import RosterCalendar from '@/components/RosterCalendar.vue'
import RosterFilterCard from '@/components/RosterFilterCard.vue'
import ScheduleModal from '@/components/ScheduleModal.vue'
import { VisitList } from './components'
import { AssignmentList } from './components'
import { useAssignments } from '@/composables/useAssignments'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'

defineOptions({ name: 'RosterView' })

const toast = useToast()

// Tab state
const activeTabIndex = ref(0)

// Assignment hooks for check-in/check-out
const {
  assignments,
  fetchAssignments,
  checkInAssignment,
  checkOutAssignment
} = useAssignments()

const selectedMember = ref<string>('all')
const selectedMonth = ref<number>(new Date().getMonth())
const calendarView = ref<'day' | 'week'>('day')

const showScheduleModal = ref(false)

// Dummy staff options for modal dropdown
const staffOptions = [
  { name: 'Alice Johnson', email: 'alice.johnson@carecompany.com' },
  { name: 'Bob Smith', email: 'bob.smith@carecompany.com' },
  { name: 'Carol Lee', email: 'carol.lee@carecompany.com' },
  { name: 'David Chen', email: 'david.chen@carecompany.com' },
  { name: 'Emma Wilson', email: 'emma.wilson@carecompany.com' },
  { name: 'Frank Rodriguez', email: 'frank.rodriguez@carecompany.com' }
]

// Computed
const activeTab = computed(() => {
  if (activeTabIndex.value === 0) return 'schedule'
  if (activeTabIndex.value === 1) return 'visit'
  return 'assignment'
})

// Check-in/check-out computed properties
const todaysAssignments = computed(() => {
  const today = new Date().toDateString()
  return assignments.value.filter(assignment => {
    const scheduledDate = new Date(assignment.scheduled_start_at).toDateString()
    return scheduledDate === today
  })
})

const currentAssignment = computed(() => {
  // Find the most recent assignment for today
  const assignments = todaysAssignments.value
  if (assignments.length === 0) return null

  // Return the first assignment (could be enhanced to find the most relevant one)
  return assignments[0]
})

function handleAddNewSchedlue() {
  showScheduleModal.value = true
}

function handleScheduleSubmit() {
  // Here you would add logic to save the new schedule
  // For now, just close the modal
  showScheduleModal.value = false
}

// Check-in/check-out methods
const handleQuickCheckIn = async () => {
  if (!currentAssignment.value) {
    toast.add({
      severity: 'error',
      summary: 'No Assignment',
      detail: 'No assignment found for today',
      life: 3000
    })
    return
  }

  if (currentAssignment.value.check_in_at) {
    toast.add({
      severity: 'info',
      summary: 'Already Checked In',
      detail: 'You have already checked in for today',
      life: 3000
    })
    return
  }

  try {
    await checkInAssignment(currentAssignment.value.id, {
      check_in_at: new Date().toISOString()
    })

    toast.add({
      severity: 'success',
      summary: 'Check-in Successful',
      detail: 'You have been checked in for your assignment',
      life: 3000
    })

    await fetchAssignments()
  } catch (error) {
    console.error('Check-in error:', error)
    toast.add({
      severity: 'error',
      summary: 'Check-in Failed',
      detail: 'Failed to check in. Please try again.',
      life: 5000
    })
  }
}

const handleQuickCheckOut = async () => {
  if (!currentAssignment.value) {
    toast.add({
      severity: 'error',
      summary: 'No Assignment',
      detail: 'No assignment found for today',
      life: 3000
    })
    return
  }

  if (!currentAssignment.value.check_in_at) {
    toast.add({
      severity: 'error',
      summary: 'Not Checked In',
      detail: 'You must check in first before checking out',
      life: 3000
    })
    return
  }

  if (currentAssignment.value.check_out_at) {
    toast.add({
      severity: 'info',
      summary: 'Already Checked Out',
      detail: 'You have already checked out for today',
      life: 3000
    })
    return
  }

  try {
    await checkOutAssignment(currentAssignment.value.id, {
      check_out_at: new Date().toISOString()
    })

    toast.add({
      severity: 'success',
      summary: 'Check-out Successful',
      detail: 'You have been checked out from your assignment',
      life: 3000
    })

    await fetchAssignments()
  } catch (error) {
    console.error('Check-out error:', error)
    toast.add({
      severity: 'error',
      summary: 'Check-out Failed',
      detail: 'Failed to check out. Please try again.',
      life: 5000
    })
  }
}

// Lifecycle
onMounted(async () => {
  await fetchAssignments()
})
</script>

<template>
  <div class="min-h-screen bg-white py-8">
    <!-- Header Section -->
    <div class="w-full mb-8">
      <div class="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white rounded-xl p-6">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <!-- Title and Stats -->
            <div>
              <h1 class="text-3xl font-bold text-gray-900 flex items-center">
                <i class="pi pi-calendar mr-3 text-blue-600"></i>
                Roster Management
              </h1>
              <p class="text-gray-600 mt-2">
                Visual Schedule Planning And Team Roster
              </p>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3">
              <Button
                v-if="activeTab === 'schedule'"
                @click="handleAddNewSchedlue"
                icon="pi pi-plus"
                label="Create New Schedule"
                class="bg-blue-600 hover:bg-blue-700 border-0 text-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Check-in/Check-out Section -->
    <div class="w-full mb-6">
      <div class="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <i class="pi pi-clock text-green-600"></i>
                Quick Check-in/Check-out
              </h2>
              <p class="text-gray-600 text-sm">
                Record your attendance for today's assignment
              </p>
            </div>

            <div class="flex gap-3">
              <Button
                label="Check In"
                icon="pi pi-sign-in"
                severity="success"
                size="small"
                :loading="false"
                @click="handleQuickCheckIn"
                class="px-6"
              />
              <Button
                label="Check Out"
                icon="pi pi-sign-out"
                severity="warning"
                size="small"
                :loading="false"
                @click="handleQuickCheckOut"
                class="px-6"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs Navigation -->
    <div class="w-full mb-6">
      <div class="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white p-4">
          <!-- Custom Tab Navigation -->
          <div class="inline-flex border-b-2 border-blue-300 relative">
            <button
              @click="activeTabIndex = 0"
              :class="[
                'px-5 py-3 font-medium transition-all duration-200 relative whitespace-nowrap',
                activeTabIndex === 0
                  ? 'text-black font-bold bg-white border-t-2 border-l-2 border-r-2 border-t-blue-300 border-l-blue-300 border-r-blue-300 border-b-2 border-b-white -mb-0.5 z-10'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              ]"
            >
              Schedule
            </button>
            <button
              @click="activeTabIndex = 1"
              :class="[
                'px-5 py-3 font-medium transition-all duration-200 relative whitespace-nowrap',
                activeTabIndex === 1
                  ? 'text-black font-bold bg-white border-t-2 border-l-2 border-r-2 border-t-blue-300 border-l-blue-300 border-r-blue-300 border-b-2 border-b-white -mb-0.5 z-10'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              ]"
            >
              Visit
            </button>
            <button
              @click="activeTabIndex = 2"
              :class="[
                'px-5 py-3 font-medium transition-all duration-200 relative whitespace-nowrap',
                activeTabIndex === 2
                  ? 'text-black font-bold bg-white border-t-2 border-l-2 border-r-2 border-t-blue-300 border-l-blue-300 border-r-blue-300 border-b-2 border-b-white -mb-0.5 z-10'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              ]"
            >
              Assignment
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Section -->
    <div class="w-full">
      <div class="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200">
          <!-- Schedule Content -->
          <div v-if="activeTab === 'schedule'" class="p-6">
            <div class="flex flex-col sm:flex-row gap-3 mb-6">
              <ScheduleModal
                :visible="showScheduleModal"
                :staffOptions="staffOptions"
                @update:visible="showScheduleModal = $event"
                @submit="handleScheduleSubmit"
              />
            </div>

            <RosterFilterCard
              class="mb-6"
              v-model:selectedFilter="selectedMember"
              v-model:currentDate="selectedMonth"
              v-model:calendarView="calendarView"
            />
            <RosterCalendar
              :selectedMember="selectedMember"
              :selectedMonth="selectedMonth"
              :calendarView="calendarView"
            />
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <!-- Roster widgets/cards will go here -->
            </div>
          </div>

          <!-- Visit Content -->
          <div v-if="activeTab === 'visit'" class="p-6">
            <VisitList />
          </div>

          <!-- Assignment Content -->
          <div v-if="activeTab === 'assignment'" class="p-6">
            <AssignmentList />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom styles for the roster page */
:deep(.p-inputtext) {
  border-radius: 8px;
}

:deep(.p-dropdown) {
  border-radius: 8px;
}

:deep(.p-button) {
  border-radius: 8px;
}

/* Grid responsive adjustments */
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1025px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
