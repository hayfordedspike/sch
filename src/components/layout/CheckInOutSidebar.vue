<template>
  <div v-if="props.visible" class="checkin-sidebar w-80 h-full flex flex-col">
    <!-- Header -->
    <div class="sidebar-header p-4">
      <div class="flex items-center gap-3">
        <div class="header-icon">
          <i class="pi pi-clock text-white text-lg"></i>
        </div>
        <div>
          <h2 class="text-lg font-semibold">Check-in/Check-out</h2>
          <p class="text-sm opacity-90">Manage staff attendance</p>
        </div>
      </div>
    </div>

    <!-- Tab Navigation -->
    <div class="sidebar-tablist flex">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="activeTab = tab.key"
        :class="[
          'sidebar-tab',
          { 'sidebar-tab--active': activeTab === tab.key }
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
        <div class="section-header">
          <h3 class="section-title">Pending Check-ins</h3>
          <p class="section-subtitle">Assignments scheduled for today</p>
        </div>

        <div class="flex-1 overflow-y-auto">
          <div v-if="pendingCheckIns.length === 0" class="empty-state">
            <i class="pi pi-check-circle text-green-500 text-3xl mb-3"></i>
            <p class="empty-title">No pending check-ins</p>
            <p class="empty-subtitle">All assignments are checked in</p>
          </div>

          <div v-else class="divide-y divide-surface">
            <div
              v-for="assignment in pendingCheckIns"
              :key="assignment.id"
              class="assignment-row"
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
                  <p class="text-sm text-muted mb-1">{{ getAssignmentDisplayInfo(assignment).visitInfo }}</p>
                  <div class="assignment-meta">
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
        <div class="section-header">
          <h3 class="section-title">Active Assignments</h3>
          <p class="section-subtitle">Currently checked-in staff</p>
        </div>

        <div class="flex-1 overflow-y-auto">
          <div v-if="activeAssignments.length === 0" class="empty-state">
            <i class="pi pi-pause-circle text-orange-500 text-3xl mb-3"></i>
            <p class="empty-title">No active assignments</p>
            <p class="empty-subtitle">All staff have checked out</p>
          </div>

          <div v-else class="divide-y divide-surface">
            <div
              v-for="assignment in activeAssignments"
              :key="assignment.id"
              class="assignment-row"
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
                  <p class="text-sm text-muted mb-1">{{ getAssignmentDisplayInfo(assignment).visitInfo }}</p>
                  <div class="assignment-meta">
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
    <div class="sidebar-footer p-4">
      <div class="grid grid-cols-2 gap-4 text-center">
        <div>
          <div class="stat-value text-green-500">{{ pendingCheckIns.length }}</div>
          <div class="stat-label">Pending Check-ins</div>
        </div>
        <div>
          <div class="stat-value text-blue-500">{{ activeAssignments.length }}</div>
          <div class="stat-label">Active Assignments</div>
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
  background: var(--app-surface);
  border-right: 1px solid var(--app-border);
  box-shadow: 4px 0 24px rgba(15, 23, 42, 0.08);
  color: var(--app-text);
}

.sidebar-header {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
}

.header-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-tablist {
  border-bottom: 1px solid var(--app-border);
  background: var(--app-surface-muted);
}

.sidebar-tab {
  flex: 1;
  padding: 0.75rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--app-text-muted);
  border-bottom: 2px solid transparent;
  transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.sidebar-tab:hover {
  color: var(--app-text);
  background: var(--app-surface);
}

.sidebar-tab--active {
  color: var(--app-text);
  border-bottom-color: var(--app-accent);
  background: var(--app-surface);
}

.section-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--app-border);
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--app-text);
  margin-bottom: 0.35rem;
}

.section-subtitle {
  font-size: 0.875rem;
  color: var(--app-text-muted);
}

.empty-state {
  padding: 2rem 1rem;
  text-align: center;
  color: var(--app-text-muted);
}

.empty-title {
  font-weight: 600;
  color: var(--app-text);
}

.empty-subtitle {
  font-size: 0.85rem;
  color: var(--app-text-muted);
  margin-top: 0.25rem;
}

.assignment-row {
  padding: 1rem 1.25rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.assignment-row:hover {
  background: var(--app-surface-muted);
}

.assignment-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.75rem;
  color: var(--app-text-muted);
}

.divide-surface > :deep(*) + :deep(*) {
  border-color: var(--app-border);
}

.sidebar-footer {
  border-top: 1px solid var(--app-border);
  background: var(--app-surface-muted);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--app-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: var(--app-surface-muted);
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: var(--app-border);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: var(--app-accent);
}

button {
  transition: all 0.2s ease-in-out;
}

:deep(.p-tag) {
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}
</style>