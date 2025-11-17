<template>
  <Dialog
    v-model:visible="isVisible"
    modal
    :style="{ width: '52rem' }"
    :closable="true"
    @hide="handleClose"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <div class="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
          <i class="pi pi-map-marker text-white text-2xl"></i>
        </div>
        <div>
          <h2 class="text-gray-900 font-semibold text-2xl">Visit Details</h2>
          <p class="text-gray-500 text-sm mt-1">Comprehensive visit information</p>
        </div>
      </div>
    </template>

    <div v-if="visit && displayInfo" class="flex flex-col gap-8 py-2">
      <!-- Visit Header -->
      <div class="flex items-center justify-between p-1">
        <div class="flex items-center gap-4">
          <div>
            <h3 class="text-2xl font-bold text-gray-900">{{ displayInfo.clientName }}</h3>
            <div class="flex items-center gap-3 mt-2">
              <Tag
                v-if="displayInfo"
                :severity="getStatusSeverity(displayInfo.status)"
                :value="displayInfo.statusLabel"
                class="font-medium px-3 py-1"
              />
              <span class="text-gray-500 text-sm">•</span>
              <span class="text-gray-500 text-sm">{{ displayInfo.duration }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Basic Information Section -->
      <div class="space-y-1">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <i class="pi pi-info-circle text-blue-600"></i>
          Basic Information
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Client -->
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700 uppercase tracking-wide">Client</label>
            <div class="text-gray-900 text-lg font-normal py-2">
              {{ displayInfo.clientName }}
            </div>
          </div>

          <!-- House -->
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700 uppercase tracking-wide">House</label>
            <div class="text-gray-900 text-lg font-normal py-2">
              {{ displayInfo.houseName }}
            </div>
          </div>

          <!-- Required Staff -->
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700 uppercase tracking-wide">Required Staff</label>
            <div class="text-gray-900 text-lg font-normal py-2 flex items-center gap-2">
              <i class="pi pi-users text-purple-600"></i>
              {{ displayInfo.requiredStaff }} staff member{{ displayInfo.requiredStaff > 1 ? 's' : '' }}
            </div>
          </div>

          <!-- Status -->
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700 uppercase tracking-wide">Status</label>
            <div class="py-2">
              <Tag
                v-if="displayInfo"
                :severity="getStatusSeverity(displayInfo.status)"
                :value="displayInfo.statusLabel"
                class="font-medium px-3 py-1 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Schedule Information Section -->
      <div class="space-y-1">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <i class="pi pi-calendar text-green-600"></i>
          Schedule Information
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Start Date & Time -->
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700 uppercase tracking-wide">Start Date & Time</label>
            <div class="text-gray-900 text-lg font-normal py-2 flex items-center gap-2">
              <i class="pi pi-play text-green-600"></i>
              {{ displayInfo.startDate }}
            </div>
          </div>

          <!-- End Date & Time -->
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700 uppercase tracking-wide">End Date & Time</label>
            <div class="text-gray-900 text-lg font-normal py-2 flex items-center gap-2">
              <i class="pi pi-stop text-red-600"></i>
              {{ displayInfo.endDate }}
            </div>
          </div>

          <!-- Duration -->
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700 uppercase tracking-wide">Duration</label>
            <div class="text-gray-900 text-lg font-normal py-2 flex items-center gap-2">
              <i class="pi pi-clock text-blue-600"></i>
              {{ displayInfo.duration }}
            </div>
          </div>

          <!-- Created At -->
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700 uppercase tracking-wide">Created At</label>
            <div class="text-gray-900 text-lg font-normal py-2">
              {{ formatDate(visit.created_at) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Notes Section -->
      <div v-if="visit.notes" class="space-y-1">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <i class="pi pi-comment text-gray-600"></i>
          Notes
        </h3>

        <div class="bg-gray-50 rounded-lg p-4">
          <p class="text-gray-700 whitespace-pre-wrap">{{ visit.notes }}</p>
        </div>
      </div>

      <!-- System Information Section -->
      <div class="space-y-1">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <i class="pi pi-cog text-gray-600"></i>
          System Information
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Visit ID -->
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700 uppercase tracking-wide">Visit ID</label>
            <div class="text-gray-900 text-lg font-normal py-2">
              {{ visit.id }}
            </div>
          </div>

          <!-- Created By -->
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700 uppercase tracking-wide">Created By</label>
            <div class="text-gray-900 text-lg font-normal py-2">
              Employee #{{ visit.created_by_id }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-between gap-2">
        <Button
          label="Edit Visit"
          icon="pi pi-pencil"
          class="p-button-outlined"
          @click="handleEdit"
        />
        <Button
          label="Close"
          icon="pi pi-times"
          class="p-button-text text-gray-600 hover:text-gray-800"
          @click="handleClose"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useVisits } from '@/composables/useVisits'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import type { Visit } from '@/views/Roster/types'

interface Props {
  visible: boolean
  visit: Visit | null
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'edit', visit: Visit): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const {
  getVisitDisplayInfo
} = useVisits()

// Reactive state
const isVisible = computed<boolean>({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const displayInfo = computed(() => {
  if (!props.visit) return null
  try {
    return getVisitDisplayInfo(props.visit)
  } catch (error) {
    console.error('Error getting visit display info:', error)
    return null
  }
})

// Watch for visit changes to ensure reactivity
watch(() => props.visit, () => {
  // Component will re-render when visit changes
})

// Methods
const handleClose = () => {
  isVisible.value = false
}

const handleEdit = () => {
  if (props.visit) {
    emit('edit', props.visit)
    handleClose()
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusSeverity = (status: string) => {
  const severities: Record<string, string> = {
    scheduled: 'warning',
    in_progress: 'info',
    completed: 'success',
    cancelled: 'danger'
  }
  return severities[status] || 'secondary'
}
</script>

<style scoped>
:deep(.p-dialog-header) {
  padding: 1.5rem 2rem 1rem;
  border-bottom: 1px solid #f1f5f9;
}

:deep(.p-dialog-content) {
  padding: 0 2rem;
}

:deep(.p-dialog-footer) {
  padding: 1rem 2rem;
  border-top: 1px solid #f1f5f9;
}

/* Remove all rounded corners, backgrounds, and borders */
:deep(.p-dialog) {
  border-radius: 0;
}

:deep(.p-tag) {
  border-radius: 0;
  border: none;
  font-weight: 500;
}

/* Clean typography and spacing */
label {
  color: #64748b;
  font-weight: 600;
  letter-spacing: 0.025em;
}

/* Remove any background colors and borders from content areas */
.text-gray-900 {
  color: #1f2937;
}

.text-gray-700 {
  color: #374151;
}

.text-gray-500 {
  color: #6b7280;
}
</style>