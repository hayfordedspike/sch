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
            class="w-full"
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
            class="w-full"
            :loading="visitsLoading"
            :class="{ 'p-invalid': errors.visit_id }"
          />
          <small v-if="errors.visit_id" class="p-error">{{ errors.visit_id }}</small>
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
            class="w-full"
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
            class="w-full"
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
            :class="{ 'p-invalid': errors.scheduled_end_at }"
          />
          <small v-if="errors.scheduled_end_at" class="p-error">{{ errors.scheduled_end_at }}</small>
        </div>

        <!-- Assigned By (only for new assignments) -->
        <div v-if="!assignment" class="field">
          <label for="assignedBy" class="block text-sm font-medium text-gray-700 mb-2">Assigned By</label>
          <Dropdown
            id="assignedBy"
            v-model="formData.assigned_by_id"
            :options="employeeOptions"
            option-label="label"
            option-value="value"
            placeholder="Select assigner"
            class="w-full"
            :loading="employeesLoading"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <Button
        label="Cancel"
        icon="pi pi-times"
        class="p-button-text"
        @click="handleCancel"
      />
      <Button
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
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import Button from 'primevue/button'
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

const formData = ref<CreateAssignmentRequest>({
  visit_id: 0,
  employee_id: 0,
  role_on_visit: 'Solo',
  status: 'TENTATIVE',
  scheduled_start_at: '',
  scheduled_end_at: '',
  assigned_by_id: 0
})

const startDateTime = ref<Date | null>(null)
const endDateTime = ref<Date | null>(null)
const submitting = ref(false)
const errors = ref<Record<string, string>>({})

// Hooks
const { createAssignment, updateAssignment } = useAssignments()
const { employees, loading: employeesLoading, getEmployees } = useEmployees()
const { visits, loading: visitsLoading, fetchVisits } = useVisits()

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
    formData.value = {
      visit_id: 0,
      employee_id: 0,
      role_on_visit: 'Solo',
      status: 'TENTATIVE',
      scheduled_start_at: '',
      scheduled_end_at: '',
      assigned_by_id: 0
    }
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
      fetchVisits()
    ])
  } catch (err) {
    console.error('Failed to load data:', err)
  }
}

loadData()

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