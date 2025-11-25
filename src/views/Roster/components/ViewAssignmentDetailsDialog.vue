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
          <i class="pi pi-user text-white text-2xl"></i>
        </div>
        <div>
          <h2 class="text-gray-900 font-semibold text-2xl">Assignment Details</h2>
          <p class="text-gray-500 text-sm mt-1">Comprehensive assignment information</p>
        </div>
      </div>
    </template>

    <div v-if="assignment && displayInfo" class="flex flex-col gap-8 py-2">
      <!-- Assignment Header -->
      <div class="flex items-center justify-between p-1">
        <div class="flex items-center gap-4">
          <div>
            <h3 class="text-2xl font-bold text-gray-900">{{ displayInfo.employeeName }}</h3>
            <div class="flex items-center gap-3 mt-2">
              <Tag
                v-if="displayInfo"
                :severity="displayInfo.statusColor"
                :value="displayInfo.status"
                class="font-medium px-3 py-1"
              />
              <span class="text-gray-500 text-sm">•</span>
              <span class="text-gray-500 text-sm">{{ displayInfo.role }}</span>
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
          <!-- Employee -->
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700 uppercase tracking-wide">Employee</label>
            <div class="text-gray-900 text-lg font-normal py-2">
              {{ displayInfo.employeeName }}
            </div>
          </div>

          <!-- Visit -->
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700 uppercase tracking-wide">Visit</label>
            <div class="text-gray-900 text-lg font-normal py-2">
              {{ displayInfo.clientName }} @ {{ displayInfo.houseName }}
            </div>
          </div>

          <!-- Role -->
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700 uppercase tracking-wide">Role</label>
            <div class="text-gray-900 text-lg font-normal py-2 flex items-center gap-2">
              <i class="pi pi-users text-purple-600"></i>
              {{ displayInfo.role }}
            </div>
          </div>

          <!-- Status -->
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700 uppercase tracking-wide">Status</label>
            <div class="py-2">
              <Tag
                v-if="displayInfo"
                :severity="displayInfo.statusColor"
                :value="displayInfo.status"
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
          <!-- Scheduled Start -->
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700 uppercase tracking-wide">Scheduled Start</label>
            <div class="text-gray-900 text-lg font-normal py-2 flex items-center gap-2">
              <i class="pi pi-play text-green-600"></i>
              {{ displayInfo.scheduledStart }}
            </div>
          </div>

          <!-- Scheduled End -->
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700 uppercase tracking-wide">Scheduled End</label>
            <div class="text-gray-900 text-lg font-normal py-2 flex items-center gap-2">
              <i class="pi pi-stop text-red-600"></i>
              {{ displayInfo.scheduledEnd }}
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

          <!-- Assigned At -->
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700 uppercase tracking-wide">Assigned At</label>
            <div class="text-gray-900 text-lg font-normal py-2">
              {{ displayInfo.assignedAt }}
            </div>
          </div>
        </div>
      </div>

      <!-- Check-in/out Information Section -->
      <div class="space-y-1">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <i class="pi pi-check-circle text-orange-600"></i>
          Check-in/Check-out Status
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Check-in Status -->
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700 uppercase tracking-wide">Check-in Status</label>
            <div class="py-2">
              <div v-if="displayInfo.isCheckedIn" class="flex items-center gap-2">
                <i class="pi pi-check-circle text-green-600"></i>
                <span class="text-green-600 font-medium">Checked In</span>
              </div>
              <div v-else class="flex items-center gap-2">
                <i class="pi pi-times-circle text-gray-400"></i>
                <span class="text-gray-500">Not Checked In</span>
              </div>
            </div>
          </div>

          <!-- Check-out Status -->
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700 uppercase tracking-wide">Check-out Status</label>
            <div class="py-2">
              <div v-if="displayInfo.isCheckedOut" class="flex items-center gap-2">
                <i class="pi pi-check-circle text-blue-600"></i>
                <span class="text-blue-600 font-medium">Checked Out</span>
              </div>
              <div v-else class="flex items-center gap-2">
                <i class="pi pi-times-circle text-gray-400"></i>
                <span class="text-gray-500">Not Checked Out</span>
              </div>
            </div>
          </div>

          <!-- Check-in Time -->
          <div v-if="displayInfo.checkInTime" class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700 uppercase tracking-wide">Check-in Time</label>
            <div class="text-gray-900 text-lg font-normal py-2">
              {{ displayInfo.checkInTime }}
            </div>
          </div>

          <!-- Check-out Time -->
          <div v-if="displayInfo.checkOutTime" class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700 uppercase tracking-wide">Check-out Time</label>
            <div class="text-gray-900 text-lg font-normal py-2">
              {{ displayInfo.checkOutTime }}
            </div>
          </div>
        </div>

        <!-- Check-in/out Actions -->
        <div class="mt-4 flex gap-3">
          <Button
            v-if="!displayInfo.isCheckedIn"
            label="Check In"
            icon="pi pi-sign-in"
            severity="success"
            @click="$emit('check-in', assignment)"
          />
          <Button
            v-if="displayInfo.isCheckedIn && !displayInfo.isCheckedOut"
            label="Check Out"
            icon="pi pi-sign-out"
            severity="warning"
            @click="$emit('check-out', assignment)"
          />
        </div>
      </div>

      <!-- System Information Section -->
      <div class="space-y-1">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <i class="pi pi-cog text-gray-600"></i>
          System Information
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Assignment ID -->
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700 uppercase tracking-wide">Assignment ID</label>
            <div class="text-gray-900 text-lg font-normal py-2">
              {{ assignment.id }}
            </div>
          </div>

          <!-- Assigned By -->
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700 uppercase tracking-wide">Assigned By</label>
            <div class="text-gray-900 text-lg font-normal py-2">
              {{ displayInfo.assignedByName }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-between gap-2">
        <Button
          label="Edit Assignment"
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
import { computed, watch, ref, onMounted } from 'vue'
import { useAssignments } from '@/composables/useAssignments'
import { useEmployees } from '@/composables/useEmployees'
import { useVisits } from '@/composables/useVisits'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import type { Assignment } from '@/views/Roster/types'

interface Props {
  visible: boolean
  assignment: Assignment | null
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'edit', assignment: Assignment): void
  (e: 'check-in', assignment: Assignment): void
  (e: 'check-out', assignment: Assignment): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const {
  getAssignmentDisplayInfo
} = useAssignments()

// Reactive state
const isVisible = computed<boolean>({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const { getEmployee } = useEmployees()
const { getVisit } = useVisits()

const employeeName = ref('')
const visitInfo = ref('')
const assignedByName = ref('')
const clientName = ref('')
const houseName = ref('')

async function fetchNames() {
  if (props.assignment?.employee_id) {
    const emp = await getEmployee(props.assignment.employee_id)
    employeeName.value = emp ? `${emp.first_name} ${emp.last_name}` : `Employee #${props.assignment.employee_id}`
  }
  if (props.assignment?.visit_id) {
    const visit = await getVisit(props.assignment.visit_id)
    if (visit?.client_id) {
      const client = await getEmployee(visit.client_id)
      clientName.value = client ? `${client.first_name} ${client.last_name}` : ''
    }
    if (visit?.house_id) {
      const house = await getHouse(visit.house_id)
      houseName.value = house ? house.name : ''
    }
  }
  if (props.assignment?.assigned_by_id) {
    const assignedBy = await getEmployee(props.assignment.assigned_by_id)
    assignedByName.value = assignedBy ? `${assignedBy.first_name} ${assignedBy.last_name}` : ''
  }
}

onMounted(fetchNames)
watch(() => props.assignment, fetchNames, { immediate: true })

function getDuration(start: string | Date, end: string | Date): string {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const diffMs = endDate.getTime() - startDate.getTime()
  if (diffMs <= 0) return '0 min'
  const diffMins = Math.floor(diffMs / 60000)
  const hours = Math.floor(diffMins / 60)
  const mins = diffMins % 60
  if (hours > 0 && mins > 0) return `${hours} hr${hours > 1 ? 's' : ''} ${mins} min${mins > 1 ? 's' : ''}`
  if (hours > 0) return `${hours} hr${hours > 1 ? 's' : ''}`
  return `${mins} min${mins > 1 ? 's' : ''}`
}

const displayInfo = computed(() => {
  if (!props.assignment) return null
  return {
    id: props.assignment.id,
    employeeName: employeeName.value || `Employee #${props.assignment.employee_id}`,
    visitInfo: visitInfo.value || `Visit #${props.assignment.visit_id}`,
    role: props.assignment.role_on_visit,
    status: props.assignment.status,
    scheduledStart: new Date(props.assignment.scheduled_start_at).toLocaleString(),
    scheduledEnd: new Date(props.assignment.scheduled_end_at).toLocaleString(),
    duration: getDuration(props.assignment.scheduled_start_at, props.assignment.scheduled_end_at),
    assignedAt: new Date(props.assignment.assigned_at).toLocaleDateString(),
    assignedByName: assignedByName.value,
    checkInTime: props.assignment.check_in_at ? new Date(props.assignment.check_in_at).toLocaleString() : null,
    checkOutTime: props.assignment.check_out_at ? new Date(props.assignment.check_out_at).toLocaleString() : null,
    isCheckedIn: !!props.assignment.check_in_at,
    isCheckedOut: !!props.assignment.check_out_at,
    clientName: clientName.value,
    houseName: houseName.value
  }
})

// Watch for assignment changes to ensure reactivity
watch(() => props.assignment, () => {
  // Component will re-render when assignment changes
})

// Methods
const handleClose = () => {
  isVisible.value = false
}

const handleEdit = () => {
  if (props.assignment) {
    emit('edit', props.assignment)
    handleClose()
  }
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

:deep(.w-14) {
  width: 3.5rem !important;
  min-width: 3.5rem !important;
  max-width: 3.5rem !important;
}
:deep(.h-14) {
  height: 3.5rem !important;
  min-height: 3.5rem !important;
  max-height: 3.5rem !important;
}
:deep(.flex.items-center.justify-center) > i {
  font-size: 2rem !important;
  width: 2rem !important;
  height: 2rem !important;
  display: flex;
  align-items: center;
  justify-content: center;
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