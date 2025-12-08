<template>
  <Dialog
    v-model:visible="dialogVisible"
    :header="assignment ? 'Edit Assignment' : 'Create Assignment'"
    modal
    :style="{ width: '600px' }"
    :closable="true"
  >
    <div class="p-fluid">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Employee Selection -->
        <div class="field">
          <label for="employeeSelect" class="block text-sm font-medium text-gray-700 mb-2">Employee *</label>
          <Dropdown
            id="employeeSelect"
            v-model="formData.employee_id"
            :options="employeeOptions"
            option-label="label"
            option-value="value"
            placeholder="Select an employee"
            class="w-full app-input"
            :loading="employeesLoading"
            :class="{ 'p-invalid': errors.employee_id }"
          />
          <small v-if="errors.employee_id" class="p-error">{{ errors.employee_id }}</small>
        </div>

        <!-- Visit Selection -->
        <div class="field">
          <label for="visitSelect" class="block text-sm font-medium text-gray-700 mb-2">Visit *</label>
          <Dropdown
            id="visitSelect"
            v-model="formData.visit_id"
            :options="visitOptions"
            option-label="label"
            option-value="value"
            placeholder="Select a visit"
            class="w-full app-input"
            :loading="visitsLoading"
            :class="{ 'p-invalid': errors.visit_id }"
          />
          <small v-if="errors.visit_id" class="p-error">{{ errors.visit_id }}</small>
          <div
            v-if="selectedVisitTimeline"
            class="timeline-hint mt-2 text-xs"
          >
            <p class="timeline-hint__title">Visit timeline</p>
            <p><span class="font-medium">Starts:</span> {{ selectedVisitTimeline.start }}</p>
            <p><span class="font-medium">Ends:</span> {{ selectedVisitTimeline.end }}</p>
            <p>
              <span class="font-medium">Duration:</span>
              {{ selectedVisitTimeline.durationHours }} hour{{ selectedVisitTimeline.durationHours === 1 ? '' : 's' }}
            </p>
            <p><span class="font-medium">Required staff:</span> {{ selectedVisitTimeline.requiredStaff }}</p>
            <p class="timeline-hint__note">Assignments must start and end within this window.</p>
          </div>
        </div>

        <!-- Role Selection -->
        <div class="field">
          <label for="roleSelect" class="block text-sm font-medium text-gray-700 mb-2">Role *</label>
          <Dropdown
            id="roleSelect"
            v-model="formData.role_on_visit"
            :options="roleOptions"
            option-label="label"
            option-value="value"
            placeholder="Select a role"
            class="w-full app-input"
            :class="{ 'p-invalid': errors.role_on_visit }"
          />
          <small v-if="errors.role_on_visit" class="p-error">{{ errors.role_on_visit }}</small>
        </div>

        <!-- Status Selection -->
        <div class="field">
          <label for="statusSelect" class="block text-sm font-medium text-gray-700 mb-2">Status *</label>
          <Dropdown
            id="statusSelect"
            v-model="formData.status"
            :options="statusOptions"
            option-label="label"
            option-value="value"
            placeholder="Select status"
            class="w-full app-input"
            :class="{ 'p-invalid': errors.status }"
          />
          <small v-if="errors.status" class="p-error">{{ errors.status }}</small>
        </div>

        <!-- Scheduled Start Date & Time -->
        <div class="field">
          <label for="startDate" class="block text-sm font-medium text-gray-700 mb-2">Scheduled Start *</label>
          <Calendar
            id="startDate"
            v-model="startDateTime"
            placeholder="Select start date and time"
            class="w-full"
            show-time
            show-icon
            :minDate="visitDateBounds?.start ?? undefined"
            :maxDate="visitDateBounds?.end ?? undefined"
            :class="{ 'p-invalid': errors.scheduled_start_at }"
          />
          <small v-if="errors.scheduled_start_at" class="p-error">{{ errors.scheduled_start_at }}</small>
        </div>

        <!-- Scheduled End Date & Time -->
        <div class="field">
          <label for="endDate" class="block text-sm font-medium text-gray-700 mb-2">Scheduled End *</label>
          <Calendar
            id="endDate"
            v-model="endDateTime"
            placeholder="Select end date and time"
            class="w-full"
            show-time
            show-icon
            :minDate="visitDateBounds?.start ?? undefined"
            :maxDate="visitDateBounds?.end ?? undefined"
            :class="{ 'p-invalid': errors.scheduled_end_at }"
          />
          <small v-if="errors.scheduled_end_at" class="p-error">{{ errors.scheduled_end_at }}</small>
        </div>

      </div>
    </div>

    <template #footer>
      <GlobalButton
        label="Cancel"
        icon="pi pi-times"
        class="p-button-text"
        @click="handleCancel"
        type="warning"
      />
      <GlobalButton
        :label="assignment ? 'Update Assignment' : 'Create Assignment'"
        icon="pi pi-check"
        class="p-button-primary"
        :loading="submitting"
        @click="handleSave"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAssignments } from '@/composables/useAssignments'
import { useEmployees } from '@/composables/useEmployees'
import { useVisits } from '@/composables/useVisits'
import { useCurrentUser } from '@/composables/useCurrentUser'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import GlobalButton from '@/components/shared/GlobalButton.vue'
import type { Assignment, CreateAssignmentRequest, UpdateAssignmentRequest } from '@/views/Roster/types'

interface Props {
  visible: boolean
  assignment: Assignment | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'assignment-added': [assignment: Assignment]
  'assignment-updated': [assignment: Assignment]
}>()

const dialogVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value)
})

const { currentUser, fetchCurrentUser } = useCurrentUser()
const DEFAULT_ASSIGNMENT_DURATION_MS = 60 * 60 * 1000

const getDefaultFormData = (): CreateAssignmentRequest => ({
  visit_id: 0,
  employee_id: 0,
  role_on_visit: 'Solo',
  status: 'TENTATIVE',
  scheduled_start_at: '',
  scheduled_end_at: '',
  assigned_by_id: currentUser.value?.id ?? 0
})

const formData = ref<CreateAssignmentRequest>(getDefaultFormData())

const startDateTime = ref<Date | null>(null)
const endDateTime = ref<Date | null>(null)
const submitting = ref(false)
const errors = ref<Record<string, string>>({})

// Hooks
const { createAssignment, updateAssignment } = useAssignments()
const { employees, loading: employeesLoading, getEmployees } = useEmployees()
const { visits, loading: visitsLoading, fetchVisits } = useVisits()
const setAssignedByToCurrentUser = () => {
  if (props.assignment) {
    return
  }

  const userId = currentUser.value?.id
  if (userId) {
    formData.value.assigned_by_id = userId
  }
}

watch(currentUser, () => {
  setAssignedByToCurrentUser()
})

// Options
const employeeOptions = computed(() => {
  return employees.value.map(employee => ({
    label: `${employee.first_name} ${employee.last_name}`,
    value: employee.id
  }))
})

const visitOptions = computed(() => {
  return visits.value.map(visit => ({
    label: `Visit #${visit.id} - Client #${visit.client_id}`,
    value: visit.id
  }))
})

const selectedVisit = computed(() => {
  return visits.value.find(visit => visit.id === formData.value.visit_id) || null
})

const visitDateBounds = computed(() => {
  if (!selectedVisit.value) {
    return null
  }
  return {
    start: new Date(selectedVisit.value.start_at),
    end: new Date(selectedVisit.value.end_at)
  }
})

const formatDateTime = (value: string) => {
  return new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const selectedVisitTimeline = computed(() => {
  if (!selectedVisit.value) {
    return null
  }

  const bounds = visitDateBounds.value
  if (!bounds) {
    return null
  }
  const { start, end } = bounds
  const durationMs = Math.max(end.getTime() - start.getTime(), 0)
  const durationHours = Math.max(1, Math.round(durationMs / (1000 * 60 * 60)))

  return {
    start: formatDateTime(selectedVisit.value.start_at),
    end: formatDateTime(selectedVisit.value.end_at),
    durationHours,
    requiredStaff: selectedVisit.value.required_staff_count
  }
})

const clampAssignmentDatesToVisit = (bounds: { start: Date; end: Date } | null) => {
  if (!bounds) {
    return
  }

  const { start, end } = bounds

  if (!startDateTime.value || startDateTime.value < start || startDateTime.value > end) {
    startDateTime.value = new Date(start.getTime())
  }

  const baselineStart = startDateTime.value ?? start
  const desiredEndTimestamp = Math.min(end.getTime(), baselineStart.getTime() + DEFAULT_ASSIGNMENT_DURATION_MS)

  if (!endDateTime.value || endDateTime.value > end || endDateTime.value <= baselineStart) {
    endDateTime.value = new Date(desiredEndTimestamp)
  }
}

watch(visitDateBounds, (bounds) => {
  if (!props.assignment) {
    clampAssignmentDatesToVisit(bounds)
  }
})

const assignedByDisplay = computed(() => {
  if (props.assignment) {
    return props.assignment.assigned_by_id
      ? `Originally assigned by user #${props.assignment.assigned_by_id}`
      : 'Assigning user not recorded'
  }

  const user = currentUser.value
  if (user) {
    const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim()
    return fullName ? `${fullName} (${user.email})` : user.email
  }
  return 'Loading your profile...'
})

const roleOptions = [
  { label: 'Solo', value: 'Solo' },
  { label: 'Lead', value: 'Lead' },
  { label: 'Support', value: 'Support' }
]

const statusOptions = [
  { label: 'Tentative', value: 'TENTATIVE' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' }
]

// Watch for assignment changes to populate form
watch(() => props.assignment, (newAssignment) => {
  if (newAssignment) {
    formData.value = {
      visit_id: newAssignment.visit_id,
      employee_id: newAssignment.employee_id,
      role_on_visit: newAssignment.role_on_visit,
      status: newAssignment.status,
      scheduled_start_at: newAssignment.scheduled_start_at,
      scheduled_end_at: newAssignment.scheduled_end_at,
      assigned_by_id: newAssignment.assigned_by_id
    }
    startDateTime.value = new Date(newAssignment.scheduled_start_at)
    endDateTime.value = new Date(newAssignment.scheduled_end_at)
  } else {
    formData.value = getDefaultFormData()
    setAssignedByToCurrentUser()
    startDateTime.value = null
    endDateTime.value = null
  }
  errors.value = {}
}, { immediate: true })

// Watch for date/time changes
watch([startDateTime, endDateTime], () => {
  if (startDateTime.value) {
    formData.value.scheduled_start_at = startDateTime.value.toISOString()
  }
  if (endDateTime.value) {
    formData.value.scheduled_end_at = endDateTime.value.toISOString()
  }
})

// Load data
const loadData = async () => {
  try {
    await Promise.all([
      getEmployees(),
      fetchVisits(),
      fetchCurrentUser()
    ])
    setAssignedByToCurrentUser()
  } catch (err) {
    console.error('Failed to load data:', err)
  }
}

loadData()

const ensureAssignedBy = async () => {
  if (props.assignment) {
    return true
  }

  if (formData.value.assigned_by_id) {
    return true
  }

  try {
    const user = currentUser.value ?? await fetchCurrentUser(true)
    if (user?.id) {
      formData.value.assigned_by_id = user.id
      return true
    }
  } catch (error) {
    console.error('Failed to fetch current user for assignment:', error)
  }

  errors.value.assigned_by_id = 'Unable to determine assigning user. Please refresh and try again.'
  return false
}

const validateForm = () => {
  errors.value = {}

  if (!formData.value.employee_id) {
    errors.value.employee_id = 'Employee is required'
  }
  if (!formData.value.visit_id) {
    errors.value.visit_id = 'Visit is required'
  }
  if (!formData.value.role_on_visit) {
    errors.value.role_on_visit = 'Role is required'
  }
  if (!formData.value.status) {
    errors.value.status = 'Status is required'
  }
  if (!formData.value.scheduled_start_at) {
    errors.value.scheduled_start_at = 'Start date and time are required'
  }
  if (!formData.value.scheduled_end_at) {
    errors.value.scheduled_end_at = 'End date and time are required'
  }
  if (formData.value.scheduled_start_at && formData.value.scheduled_end_at) {
    const start = new Date(formData.value.scheduled_start_at)
    const end = new Date(formData.value.scheduled_end_at)
    if (start >= end) {
      errors.value.scheduled_end_at = 'End time must be after start time'
    }
  }

  const bounds = visitDateBounds.value
  const visitWindowLabel = selectedVisitTimeline.value
    ? `${selectedVisitTimeline.value.start} - ${selectedVisitTimeline.value.end}`
    : 'the selected visit timeline'

  if (bounds && formData.value.scheduled_start_at) {
    const start = new Date(formData.value.scheduled_start_at)
    if (start < bounds.start || start > bounds.end) {
      errors.value.scheduled_start_at = `Start must fall within ${visitWindowLabel}.`
    }
  }

  if (bounds && formData.value.scheduled_end_at) {
    const end = new Date(formData.value.scheduled_end_at)
    if (end < bounds.start || end > bounds.end) {
      errors.value.scheduled_end_at = `End must fall within ${visitWindowLabel}.`
    }
  }

  return Object.keys(errors.value).length === 0
}

const handleCancel = () => {
  emit('update:visible', false)
  errors.value = {}
}

const handleSave = async () => {
  if (!validateForm()) {
    return
  }

  if (!(await ensureAssignedBy())) {
    return
  }

  submitting.value = true
  try {
    if (props.assignment) {
      // Update existing assignment
      const updateData: UpdateAssignmentRequest = {
        role_on_visit: formData.value.role_on_visit,
        status: formData.value.status,
        scheduled_start_at: formData.value.scheduled_start_at,
        scheduled_end_at: formData.value.scheduled_end_at
      }

      const result = await updateAssignment(props.assignment.id, updateData)
      if (result.success && result.data) {
        emit('assignment-updated', result.data)
        handleCancel()
      }
    } else {
      // Create new assignment
      const result = await createAssignment(formData.value)
      if (result.success && result.data) {
        emit('assignment-added', result.data)
        handleCancel()
      }
    }
  } catch (err) {
    console.error('Failed to save assignment:', err)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.timeline-hint {
  background: var(--app-surface-muted);
  border: 1px solid var(--app-border);
  border-radius: 0.75rem;
  padding: 0.75rem;
  color: var(--app-text-muted);
}

.timeline-hint__title {
  color: var(--app-text);
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.timeline-hint__note {
  margin-top: 0.5rem;
  color: var(--app-text-muted);
}
</style>