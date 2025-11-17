<template>
  <div class="checkin-checkout-page min-h-screen bg-gray-50">
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Header -->
      <div class="mb-8">
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
          <div class="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="pi pi-clock text-white text-2xl"></i>
          </div>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">
            Check-in/Check-out
          </h1>
          <p class="text-gray-600">
            Record your attendance for scheduled assignments
          </p>
        </div>
      </div>

      <!-- Current Date & Time Card -->
      <div class="mb-6">
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div class="text-center">
            <div class="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="pi pi-calendar text-white text-lg"></i>
            </div>
            <div class="text-3xl font-bold text-gray-900 mb-1">
              {{ currentTime }}
            </div>
            <div class="text-lg text-gray-600 mb-2">
              {{ currentDate }}
            </div>
            <div class="text-sm text-gray-500">
              {{ currentDay }}, {{ currentMonth }} {{ currentYear }}
            </div>
          </div>
        </div>
      </div>

      <!-- Check-in/Check-out Buttons -->
      <div class="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Check-in Button -->
          <div class="text-center">
            <Button
              label="Check In"
              icon="pi pi-sign-in"
              severity="success"
              size="large"
              class="w-full h-16 text-lg font-semibold"
              :loading="checkInLoading"
              @click="handleQuickCheckIn"
            />
            <p class="text-sm text-gray-500 mt-2">
              Start your shift for today's assignment
            </p>
          </div>

          <!-- Check-out Button -->
          <div class="text-center">
            <Button
              label="Check Out"
              icon="pi pi-sign-out"
              severity="warning"
              size="large"
              class="w-full h-16 text-lg font-semibold"
              :loading="checkOutLoading"
              @click="handleQuickCheckOut"
            />
            <p class="text-sm text-gray-500 mt-2">
              End your shift for today's assignment
            </p>
          </div>
        </div>

        <!-- Status Message -->
        <div v-if="statusMessage" class="mt-6 text-center">
          <div
            :class="[
              'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium',
              statusMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
              statusMessage.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
              'bg-blue-50 text-blue-700 border border-blue-200'
            ]"
          >
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
import Button from 'primevue/button'
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
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
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