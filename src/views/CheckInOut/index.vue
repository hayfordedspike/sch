<template>
  <div class="checkin-checkout-page min-h-screen">
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Header -->
      <div class="mb-8">
        <div class="checkin-card text-center p-6">
          <div class="icon-badge icon-badge--clock">
            <i class="pi pi-clock text-white text-2xl"></i>
          </div>
          <h1 class="checkin-heading text-2xl font-bold mb-2">
            Check-in/Check-out
          </h1>
          <p class="text-muted">
            Record your attendance for scheduled assignments
          </p>
        </div>
      </div>

      <!-- Current Date & Time Card -->
      <div class="mb-6">
        <div class="checkin-card p-6">
          <div class="text-center">
            <div class="icon-badge icon-badge--calendar">
              <i class="pi pi-calendar text-white text-lg"></i>
            </div>
            <div class="checkin-time text-3xl font-bold mb-1">
              {{ currentTime }}
            </div>
            <div class="text-lg text-muted mb-2">
              {{ currentDate }}
            </div>
           
          </div>
        </div>
      </div>

      <!-- Check-in/Check-out Buttons -->
      <div class="checkin-card p-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Check-in Button -->
          <div class="text-center">
            <GlobalButton
              label="Check In"
              icon="pi pi-sign-in"
              severity="success"
              size="lg"
              class="w-full h-16 text-lg font-semibold"
              :loading="checkInLoading"
              @click="handleQuickCheckIn"
            />
            <p class="text-sm text-muted mt-2">
              Start your shift for today's assignment
            </p>
          </div>

          <!-- Check-out Button -->
          <div class="text-center">
            <GlobalButton
              label="Check Out"
              icon="pi pi-sign-out"
              severity="warning"
              size="lg"
              class="w-full h-16 text-lg font-semibold"
              :loading="checkOutLoading"
              @click="handleQuickCheckOut"
            />
              <p class="text-sm text-muted mt-2">
              End your shift for today's assignment
            </p>
          </div>
        </div>

        <!-- Status Message -->
        <div v-if="statusMessage" class="mt-6 text-center">
            <div :class="['status-chip', `status-chip--${statusMessage.type}`]">
            <i :class="statusMessage.icon"></i>
            {{ statusMessage.text }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useAssignments } from '@/composables/useAssignments'
import GlobalButton from '@/components/shared/GlobalButton.vue'
import { useToast } from 'primevue/usetoast'

defineOptions({ name: 'CheckInOutView' })

const toast = useToast()

// Composables
const {
  assignments,
  fetchAssignments,
  checkInAssignment,
  checkOutAssignment
} = useAssignments()

// Reactive state
const checkInLoading = ref(false)
const checkOutLoading = ref(false)
const statusMessage = ref<{
  type: 'success' | 'error' | 'info'
  text: string
  icon: string
} | null>(null)

// Current date and time
const currentTime = ref('')
const currentDate = ref('')
const currentDay = ref('')
const currentMonth = ref('')
const currentYear = ref('')

// Update time every second
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-US', {
    hour12: true,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
  currentDate.value = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  currentDay.value = now.toLocaleDateString('en-US', { weekday: 'long' })
  currentMonth.value = now.toLocaleDateString('en-US', { month: 'long' })
  currentYear.value = now.getFullYear().toString()
}

// Start time updates
const timeInterval = setInterval(updateTime, 1000)
updateTime() // Initial call

// Cleanup interval on unmount
onUnmounted(() => {
  clearInterval(timeInterval)
})

// Computed properties
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

// Methods
const clearStatusMessage = () => {
  setTimeout(() => {
    statusMessage.value = null
  }, 5000)
}

const handleQuickCheckIn = async () => {
  if (!currentAssignment.value) {
    statusMessage.value = {
      type: 'error',
      text: 'No assignment found for today',
      icon: 'pi pi-exclamation-triangle'
    }
    clearStatusMessage()
    return
  }

  if (currentAssignment.value.check_in_at) {
    statusMessage.value = {
      type: 'info',
      text: 'Already checked in for today',
      icon: 'pi pi-info-circle'
    }
    clearStatusMessage()
    return
  }

  checkInLoading.value = true
  try {
    await checkInAssignment(currentAssignment.value.id, {
      check_in_at: new Date().toISOString()
    })

    statusMessage.value = {
      type: 'success',
      text: 'Successfully checked in!',
      icon: 'pi pi-check-circle'
    }

    toast.add({
      severity: 'success',
      summary: 'Check-in Successful',
      detail: 'You have been checked in for your assignment',
      life: 3000
    })

    await fetchAssignments()
  } catch (error) {
    console.error('Check-in error:', error)
    statusMessage.value = {
      type: 'error',
      text: 'Failed to check in. Please try again.',
      icon: 'pi pi-times-circle'
    }

    toast.add({
      severity: 'error',
      summary: 'Check-in Failed',
      detail: 'Failed to check in. Please try again.',
      life: 5000
    })
  } finally {
    checkInLoading.value = false
    clearStatusMessage()
  }
}

const handleQuickCheckOut = async () => {
  if (!currentAssignment.value) {
    statusMessage.value = {
      type: 'error',
      text: 'No assignment found for today',
      icon: 'pi pi-exclamation-triangle'
    }
    clearStatusMessage()
    return
  }

  if (!currentAssignment.value.check_in_at) {
    statusMessage.value = {
      type: 'error',
      text: 'You must check in first before checking out',
      icon: 'pi pi-exclamation-triangle'
    }
    clearStatusMessage()
    return
  }

  if (currentAssignment.value.check_out_at) {
    statusMessage.value = {
      type: 'info',
      text: 'Already checked out for today',
      icon: 'pi pi-info-circle'
    }
    clearStatusMessage()
    return
  }

  checkOutLoading.value = true
  try {
    await checkOutAssignment(currentAssignment.value.id, {
      check_out_at: new Date().toISOString()
    })

    statusMessage.value = {
      type: 'success',
      text: 'Successfully checked out!',
      icon: 'pi pi-check-circle'
    }

    toast.add({
      severity: 'success',
      summary: 'Check-out Successful',
      detail: 'You have been checked out from your assignment',
      life: 3000
    })

    await fetchAssignments()
  } catch (error) {
    console.error('Check-out error:', error)
    statusMessage.value = {
      type: 'error',
      text: 'Failed to check out. Please try again.',
      icon: 'pi pi-times-circle'
    }

    toast.add({
      severity: 'error',
      summary: 'Check-out Failed',
      detail: 'Failed to check out. Please try again.',
      life: 5000
    })
  } finally {
    checkOutLoading.value = false
    clearStatusMessage()
  }
}

// Initialize
fetchAssignments()
</script>

<style scoped>
.checkin-checkout-page {
  --checkin-bg-start: var(--app-background);
  --checkin-bg-end: var(--app-surface-muted);
  background: linear-gradient(135deg, var(--checkin-bg-start), var(--checkin-bg-end));
  transition: background 0.3s ease, color 0.3s ease;
  color: var(--app-text);
}

:global(html.theme-dark) .checkin-checkout-page,
:global(.theme-dark) .checkin-checkout-page {
  --checkin-bg-start: #050d1f;
  --checkin-bg-end: #0f1d3b;
}

.checkin-heading,
.checkin-time {
  color: var(--app-text);
}

.checkin-card {
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 1.25rem;
  box-shadow: var(--app-card-shadow);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.checkin-card:hover {
  border-color: var(--app-accent);
}

.icon-badge {
  width: 4rem;
  height: 4rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem auto;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.15);
}

.icon-badge--clock {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
}

.icon-badge--calendar {
  width: 3.25rem;
  height: 3.25rem;
  background: linear-gradient(135deg, #7c3aed, #4c1d95);
}

.status-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.25rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.95rem;
  border: 1px solid transparent;
}

.status-chip--success {
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.35);
  color: #10b981;
}

.status-chip--error {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.35);
  color: #ef4444;
}

.status-chip--info {
  background: rgba(59, 130, 246, 0.12);
  border-color: rgba(59, 130, 246, 0.35);
  color: #3b82f6;
}

/* Custom button styles for larger touch targets */
:deep(.p-button) {
  border-radius: 0.75rem;
  transition: all 0.2s ease-in-out;
}

:deep(.p-button:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

:deep(.p-button-success) {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-color: #10b981;
}

:deep(.p-button-warning) {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border-color: #f59e0b;
}
</style>