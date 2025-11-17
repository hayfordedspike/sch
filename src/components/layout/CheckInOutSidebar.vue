<template>
  <div v-if="props.visible" class="checkin-sidebar bg-white border-r border-gray-200 w-80 h-full flex flex-col">
    <!-- Header -->
    <div class="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <i class="pi pi-clock text-white text-lg"></i>
        </div>
        <div>
          <h2 class="text-lg font-semibold">Check-in/Check-out</h2>
          <p class="text-sm opacity-90">Manage staff attendance</p>
        </div>
      </div>
    </div>

    <!-- Tab Navigation -->
    <div class="flex border-b border-gray-200 bg-gray-50">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="activeTab = tab.key"
        :class="[
          'flex-1 py-3 px-4 text-sm font-medium transition-colors duration-200',
          activeTab === tab.key
            ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        ]"
      >
        <i :class="tab.icon" class="mr-2"></i>
        {{ tab.label }}
      </button>
    </div>

    <!-- Content Area -->
    <div class="flex-1 overflow-hidden">
      <!-- Check-in Tab -->
      <div v-if="activeTab === 'checkin'" class="h-full flex flex-col">
        <div class="p-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Pending Check-ins</h3>
          <p class="text-sm text-gray-600">Assignments scheduled for today</p>
        </div>

        <div class="flex-1 overflow-y-auto">
          <div v-if="pendingCheckIns.length === 0" class="p-8 text-center">
            <i class="pi pi-check-circle text-green-500 text-3xl mb-3"></i>
            <p class="text-gray-500">No pending check-ins</p>
            <p class="text-sm text-gray-400 mt-1">All assignments are checked in</p>
          </div>

          <div v-else class="divide-y divide-gray-100">
            <div
              v-for="assignment in pendingCheckIns"
              :key="assignment.id"
              class="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              @click="handleCheckIn(assignment)"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <h4 class="font-medium text-gray-900">{{ getAssignmentDisplayInfo(assignment).employeeName }}</h4>
                    <Tag
                      :severity="getStatusSeverity(assignment.status)"
                      :value="getStatusLabel(assignment.status)"
                      class="text-xs px-2 py-0.5"
                    />
                  </div>
                  <p class="text-sm text-gray-600 mb-1">{{ getAssignmentDisplayInfo(assignment).visitInfo }}</p>
                  <div class="flex items-center gap-4 text-xs text-gray-500">
                    <span class="flex items-center gap-1">
                      <i class="pi pi-clock"></i>
                      {{ formatTime(assignment.scheduled_start_at) }}
                    </span>
                    <span class="flex items-center gap-1">
                      <i class="pi pi-map-marker"></i>
                      {{ getAssignmentDisplayInfo(assignment).role }}
                    </span>
                  </div>
                </div>
                <Button
                  label="Check In"
                  size="small"
                  severity="success"
                  class="text-xs px-3 py-1"
                  @click.stop="handleCheckIn(assignment)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Check-out Tab -->
      <div v-if="activeTab === 'checkout'" class="h-full flex flex-col">
        <div class="p-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Active Assignments</h3>
          <p class="text-sm text-gray-600">Currently checked-in staff</p>
        </div>

        <div class="flex-1 overflow-y-auto">
          <div v-if="activeAssignments.length === 0" class="p-8 text-center">
            <i class="pi pi-pause-circle text-orange-500 text-3xl mb-3"></i>
            <p class="text-gray-500">No active assignments</p>
            <p class="text-sm text-gray-400 mt-1">All staff have checked out</p>
          </div>

          <div v-else class="divide-y divide-gray-100">
            <div
              v-for="assignment in activeAssignments"
              :key="assignment.id"
              class="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              @click="handleCheckOut(assignment)"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <h4 class="font-medium text-gray-900">{{ getAssignmentDisplayInfo(assignment).employeeName }}</h4>
                    <Tag
                      severity="success"
                      value="Checked In"
                      class="text-xs px-2 py-0.5"
                    />
                  </div>
                  <p class="text-sm text-gray-600 mb-1">{{ getAssignmentDisplayInfo(assignment).visitInfo }}</p>
                  <div class="flex items-center gap-4 text-xs text-gray-500">
                    <span class="flex items-center gap-1">
                      <i class="pi pi-clock"></i>
                      Checked in: {{ formatTime(assignment.check_in_at!) }}
                    </span>
                    <span class="flex items-center gap-1">
                      <i class="pi pi-map-marker"></i>
                      {{ getAssignmentDisplayInfo(assignment).role }}
                    </span>
                  </div>
                </div>
                <Button
                  label="Check Out"
                  size="small"
                  severity="warning"
                  class="text-xs px-3 py-1"
                  @click.stop="handleCheckOut(assignment)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Stats -->
    <div class="p-4 border-t border-gray-200 bg-gray-50">
      <div class="grid grid-cols-2 gap-4 text-center">
        <div>
          <div class="text-2xl font-bold text-green-600">{{ pendingCheckIns.length }}</div>
          <div class="text-xs text-gray-600">Pending Check-ins</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-blue-600">{{ activeAssignments.length }}</div>
          <div class="text-xs text-gray-600">Active Assignments</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAssignments } from '@/composables/useAssignments'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import { useToast } from 'primevue/usetoast'
import type { Assignment } from '@/views/Roster/types'

interface Props {
  visible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: true
})

// Tab configuration
const tabs: Array<{ key: 'checkin' | 'checkout'; label: string; icon: string }> = [
  { key: 'checkin', label: 'Check-in', icon: 'pi pi-sign-in' },
  { key: 'checkout', label: 'Check-out', icon: 'pi pi-sign-out' }
]

// Reactive state
const activeTab = ref<'checkin' | 'checkout'>('checkin')
const refreshInterval = ref<number | null>(null)
const toast = useToast()

// Composables
const {
  assignments,
  fetchAssignments,
  checkInAssignment,
  checkOutAssignment,
  getAssignmentDisplayInfo
} = useAssignments()

// Computed properties
const pendingCheckIns = computed(() => {
  const today = new Date().toDateString()
  return assignments.value.filter(assignment => {
    const scheduledDate = new Date(assignment.scheduled_start_at).toDateString()
    return scheduledDate === today && !assignment.check_in_at
  })
})

const activeAssignments = computed(() => {
  return assignments.value.filter(assignment =>
    assignment.check_in_at && !assignment.check_out_at
  )
})

// Methods
const getStatusSeverity = (status: string) => {
  switch (status) {
    case 'scheduled': return 'info'
    case 'in_progress': return 'success'
    case 'completed': return 'success'
    case 'cancelled': return 'danger'
    default: return 'secondary'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'scheduled': return 'Scheduled'
    case 'in_progress': return 'In Progress'
    case 'completed': return 'Completed'
    case 'cancelled': return 'Cancelled'
    default: return status
  }
}

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

const handleCheckIn = async (assignment: Assignment) => {
  try {
    const displayInfo = getAssignmentDisplayInfo(assignment)
    await checkInAssignment(assignment.id, {
      check_in_at: new Date().toISOString()
    })
    toast.add({
      severity: 'success',
      summary: 'Check-in Successful',
      detail: `Checked in ${displayInfo.employeeName}`,
      life: 3000
    })
    await fetchAssignments() // Refresh the list
  } catch (error) {
    console.error('Check-in error:', error)
    toast.add({
      severity: 'error',
      summary: 'Check-in Failed',
      detail: 'Failed to check in',
      life: 5000
    })
  }
}

const handleCheckOut = async (assignment: Assignment) => {
  try {
    const displayInfo = getAssignmentDisplayInfo(assignment)
    await checkOutAssignment(assignment.id, {
      check_out_at: new Date().toISOString()
    })
    toast.add({
      severity: 'success',
      summary: 'Check-out Successful',
      detail: `Checked out ${displayInfo.employeeName}`,
      life: 3000
    })
    await fetchAssignments() // Refresh the list
  } catch (error) {
    console.error('Check-out error:', error)
    toast.add({
      severity: 'error',
      summary: 'Check-out Failed',
      detail: 'Failed to check out',
      life: 5000
    })
  }
}

// Auto-refresh functionality
const startAutoRefresh = () => {
  refreshInterval.value = setInterval(async () => {
    await fetchAssignments()
  }, 30000) // Refresh every 30 seconds
}

const stopAutoRefresh = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }
}

// Lifecycle
onMounted(async () => {
  await fetchAssignments()
  startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped>
.checkin-sidebar {
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Tab transitions */
button {
  transition: all 0.2s ease-in-out;
}

/* Tag styling */
:deep(.p-tag) {
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}
</style>