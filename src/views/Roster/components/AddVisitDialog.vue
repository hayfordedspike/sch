<template>
  <Dialog
    v-model:visible="dialogVisible"
    :header="visit ? 'Edit Visit' : 'Add New Visit'"
    modal
    :style="{ width: '600px' }"
    :closable="true"
  >
    <div class="p-fluid">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Client Selection -->
        <div class="field">
          <label for="clientSelect" class="block text-sm font-medium text-gray-700 mb-2">Client *</label>
          <Dropdown
            id="clientSelect"
            v-model="formData.client_id"
            :options="clientOptions"
            option-label="label"
            option-value="value"
            placeholder="Select a client"
            class="w-full"
            :loading="clientsLoading"
            :class="{ 'p-invalid': errors.client_id }"
          />
          <small v-if="errors.client_id" class="p-error">{{ errors.client_id }}</small>
        </div>

        <!-- House Selection -->
        <div class="field">
          <label for="houseSelect" class="block text-sm font-medium text-gray-700 mb-2">House *</label>
          <Dropdown
            id="houseSelect"
            v-model="formData.house_id"
            :options="houseOptions"
            option-label="label"
            option-value="value"
            placeholder="Select a house"
            class="w-full"
            :class="{ 'p-invalid': errors.house_id }"
          />
          <small v-if="errors.house_id" class="p-error">{{ errors.house_id }}</small>
        </div>

        <!-- Start Date & Time -->
        <div class="field">
          <label for="startDate" class="block text-sm font-medium text-gray-700 mb-2">Start Date & Time *</label>
          <Calendar
            id="startDate"
            v-model="startDateTime"
            placeholder="Select start date and time"
            class="w-full"
            show-time
            show-icon
            :class="{ 'p-invalid': errors.start_at }"
          />
          <small v-if="errors.start_at" class="p-error">{{ errors.start_at }}</small>
        </div>

        <!-- End Date & Time -->
        <div class="field">
          <label for="endDate" class="block text-sm font-medium text-gray-700 mb-2">End Date & Time *</label>
          <Calendar
            id="endDate"
            v-model="endDateTime"
            placeholder="Select end date and time"
            class="w-full"
            show-time
            show-icon
            :class="{ 'p-invalid': errors.end_at }"
          />
          <small v-if="errors.end_at" class="p-error">{{ errors.end_at }}</small>
        </div>

        <!-- Required Staff Count -->
        <div class="field">
          <label for="staffCount" class="block text-sm font-medium text-gray-700 mb-2">Required Staff Count *</label>
          <InputNumber
            id="staffCount"
            v-model="formData.required_staff_count"
            placeholder="Enter staff count"
            class="w-full"
            :min="1"
            :max="10"
            :class="{ 'p-invalid': errors.required_staff_count }"
          />
          <small v-if="errors.required_staff_count" class="p-error">{{ errors.required_staff_count }}</small>
        </div>

        <!-- Created By (only for new visits) -->
        <div v-if="!visit" class="field">
          <label for="createdBy" class="block text-sm font-medium text-gray-700 mb-2">Created By</label>
          <Dropdown
            id="createdBy"
            v-model="formData.created_by_id"
            :options="employeeOptions"
            option-label="label"
            option-value="value"
            placeholder="Select creator"
            class="w-full"
            :loading="employeesLoading"
          />
        </div>
      </div>

      <!-- Notes -->
      <div class="field">
        <label for="notes" class="block text-sm font-medium text-gray-700 mb-2">Notes</label>
        <Textarea
          id="notes"
          v-model="formData.notes"
          placeholder="Enter visit notes (optional)"
          rows="3"
          class="w-full"
        />
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
        :label="visit ? 'Update Visit' : 'Create Visit'"
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
import { useVisits } from '@/composables/useVisits'
import { useEmployees } from '@/composables/useEmployees'
import { useHouses } from '@/composables/useHouses'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import type { Visit, CreateVisitRequest, UpdateVisitRequest } from '@/views/Roster/types'

interface Props {
  visible: boolean
  visit: Visit | null
  clientOptions: Array<{ label: string; value: number }>
  clientsLoading?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'visit-added': [visit: Visit]
  'visit-updated': [visit: Visit]
}>()

const dialogVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value)
})

const formData = ref<CreateVisitRequest>({
  client_id: 0,
  house_id: 0,
  start_at: '',
  end_at: '',
  required_staff_count: 1,
  notes: '',
  created_by_id: 0
})

const startDateTime = ref<Date | null>(null)
const endDateTime = ref<Date | null>(null)
const submitting = ref(false)
const errors = ref<Record<string, string>>({})

// Hooks
const { createVisit, updateVisit } = useVisits()
const { employees, loading: employeesLoading, getEmployees } = useEmployees()


const employeeOptions = computed(() => {
  return employees.value.map(employee => ({
    label: `${employee.first_name} ${employee.last_name}`,
    value: employee.id
  }))
})

// Active houses for house dropdown
const { houses, fetchHouses } = useHouses()
const houseOptions = computed(() => {
  return houses.value.map(house => ({
    label: `${house.name} (${house.address_line1}${house.city ? ', ' + house.city : ''})`,
    value: house.id
  }))
})

// Watch for visit changes to populate form
watch(() => props.visit, (newVisit) => {
  if (newVisit) {
    formData.value = {
      client_id: newVisit.client_id,
      house_id: newVisit.house_id,
      start_at: newVisit.start_at,
      end_at: newVisit.end_at,
      required_staff_count: newVisit.required_staff_count,
      notes: newVisit.notes,
      created_by_id: newVisit.created_by_id
    }
    startDateTime.value = new Date(newVisit.start_at)
    endDateTime.value = new Date(newVisit.end_at)
  } else {
    formData.value = {
      client_id: 0,
      house_id: 0,
      start_at: '',
      end_at: '',
      required_staff_count: 1,
      notes: '',
      created_by_id: 0
    }
    startDateTime.value = null
    endDateTime.value = null
  }
  errors.value = {}
}, { immediate: true })

// Watch for date/time changes
watch([startDateTime, endDateTime], () => {
  if (startDateTime.value) {
    formData.value.start_at = startDateTime.value.toISOString()
  }
  if (endDateTime.value) {
    formData.value.end_at = endDateTime.value.toISOString()
  }
})


// Load employees and houses on mount
const loadData = async () => {
  try {
    await getEmployees()
    await fetchHouses({ is_active: true, limit: 100 })
  } catch (err) {
    console.error('Failed to load employees or houses:', err)
  }
}

loadData()

const validateForm = () => {
  errors.value = {}

  if (!formData.value.client_id) {
    errors.value.client_id = 'Client is required'
  }
  if (!formData.value.house_id) {
    errors.value.house_id = 'House is required'
  }
  if (!formData.value.start_at) {
    errors.value.start_at = 'Start date and time are required'
  }
  if (!formData.value.end_at) {
    errors.value.end_at = 'End date and time are required'
  }
  if (formData.value.start_at && formData.value.end_at) {
    const start = new Date(formData.value.start_at)
    const end = new Date(formData.value.end_at)
    if (start >= end) {
      errors.value.end_at = 'End time must be after start time'
    }
  }
  if (!formData.value.required_staff_count || formData.value.required_staff_count < 1) {
    errors.value.required_staff_count = 'At least 1 staff member is required'
  }

  return Object.keys(errors.value).length === 0
}

const handleCancel = () => {
  emit('update:visible', false)
  errors.value = {}
}

const handleSave = async () => {
  console.log('[AddVisitDialog] handleSave called', JSON.stringify(formData.value, null, 2))
  if (!validateForm()) {
    console.warn('[AddVisitDialog] Validation failed', errors.value)
    return
  }

  submitting.value = true
  try {
    if (props.visit) {
      // Update existing visit
      const updateData: UpdateVisitRequest = {
        client_id: formData.value.client_id,
        house_id: formData.value.house_id,
        start_at: formData.value.start_at,
        end_at: formData.value.end_at,
        required_staff_count: formData.value.required_staff_count,
        notes: formData.value.notes
      }
      console.log('[AddVisitDialog] Calling updateVisit', updateData)
      const result = await updateVisit(props.visit.id, updateData)
      console.log('[AddVisitDialog] updateVisit result', result)
      if (result.success && result.data) {
        emit('visit-updated', result.data)
        handleCancel()
      }
    } else {
      // Create new visit
      console.log('[AddVisitDialog] Calling createVisit', formData.value)
      const result = await createVisit(formData.value)
      console.log('[AddVisitDialog] createVisit result', result)
      if (result.success && result.data) {
        emit('visit-added', result.data)
        handleCancel()
      }
    }
  } catch (err) {
    console.error('[AddVisitDialog] Failed to save visit:', err)
  } finally {
    submitting.value = false
  }
}
</script>