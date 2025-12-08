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
        <div class="field md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-2">Visit For</label>
          <div class="flex gap-3">
            <GlobalButton
              label="Client"
              type="button"
              :severity="visitAssignmentType === 'client' ? 'primary' : 'secondary'"
              :outlined="visitAssignmentType !== 'client'"
              @click="visitAssignmentType = 'client'"
            />
            <GlobalButton
              label="House"
              type="button"
              :severity="visitAssignmentType === 'house' ? 'primary' : 'secondary'"
              :outlined="visitAssignmentType !== 'house'"
              @click="visitAssignmentType = 'house'"
            />
          </div>
        </div>

        <!-- Client Selection -->
        <div v-if="visitAssignmentType === 'client'" class="field">
          <label for="clientSelect" class="block text-sm font-medium text-gray-700 mb-2">Client *</label>
          <Dropdown
            id="clientSelect"
            v-model="selectedClientId"
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
        <div v-else class="field">
          <label for="houseSelect" class="block text-sm font-medium text-gray-700 mb-2">House *</label>
          <Dropdown
            id="houseSelect"
            v-model="selectedHouseId"
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
      <GlobalButton
        label="Cancel"
        icon="pi pi-times"
        class="p-button-text"
        @click="handleCancel"
        type="warning"
      />
      <GlobalButton
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
import { storeToRefs } from 'pinia'
import { useVisits } from '@/composables/useVisits'
import { useHouses } from '@/composables/useHouses'
import { useAuthStore } from '@/stores/auth'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import GlobalButton from '@/components/shared/GlobalButton.vue'
import type { Visit, CreateVisitRequest, UpdateVisitRequest } from '@/views/Roster/types'

interface ClientOption {
  label: string
  value: number
  houseId?: number | null
}

interface Props {
  visible: boolean
  visit: Visit | null
  clientOptions: ClientOption[]
  clientsLoading?: boolean
}

const props = defineProps<Props>()

const getClientHouseId = (clientId: number | null | undefined) => {
  if (!clientId) {
    return null
  }
  const option = props.clientOptions.find(option => option.value === clientId)
  return option?.houseId ?? null
}

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'visit-added': [visit: Visit]
  'visit-updated': [visit: Visit]
}>()

const dialogVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value)
})

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)
const defaultCreatedById = computed(() => user.value?.id ?? 0)

const formData = ref<CreateVisitRequest>({
  client_id: null,
  house_id: null,
  start_at: '',
  end_at: '',
  required_staff_count: 1,
  notes: '',
  created_by_id: defaultCreatedById.value
})
const selectedClientId = ref<number | null>(null)
const selectedHouseId = ref<number | null>(null)

const visitAssignmentType = ref<'client' | 'house'>('client')
const startDateTime = ref<Date | null>(null)
const endDateTime = ref<Date | null>(null)
const submitting = ref(false)
const errors = ref<Record<string, string>>({})

// Hooks
const { createVisit, updateVisit } = useVisits()

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
    selectedClientId.value = newVisit.client_id ?? null
    selectedHouseId.value = newVisit.house_id ?? null
    visitAssignmentType.value = newVisit.client_id ? 'client' : 'house'
    startDateTime.value = new Date(newVisit.start_at)
    endDateTime.value = new Date(newVisit.end_at)
  } else {
    formData.value = {
      client_id: null,
      house_id: null,
      start_at: '',
      end_at: '',
      required_staff_count: 1,
      notes: '',
      created_by_id: defaultCreatedById.value
    }
    selectedClientId.value = null
    selectedHouseId.value = null
    startDateTime.value = null
    endDateTime.value = null
    visitAssignmentType.value = 'client'
  }
  errors.value = {}
}, { immediate: true })

watch(visitAssignmentType, (type) => {
  if (type === 'client') {
    selectedHouseId.value = null
    formData.value.house_id = getClientHouseId(selectedClientId.value)
  } else {
    selectedClientId.value = null
    formData.value.client_id = null
  }
  if (type === 'client' && errors.value.house_id) {
    delete errors.value.house_id
  }
  if (type === 'house' && errors.value.client_id) {
    delete errors.value.client_id
  }
})

watch(selectedClientId, (id) => {
  if (visitAssignmentType.value === 'client') {
    formData.value.client_id = id ?? null
    formData.value.house_id = getClientHouseId(id)
  }
})

watch(selectedHouseId, (id) => {
  if (visitAssignmentType.value === 'house') {
    formData.value.house_id = id ?? null
  }
})

watch(() => props.clientOptions, () => {
  if (visitAssignmentType.value === 'client' && selectedClientId.value) {
    formData.value.house_id = getClientHouseId(selectedClientId.value)
  }
})

// Watch for date/time changes
watch([startDateTime, endDateTime], () => {
  if (startDateTime.value) {
    formData.value.start_at = startDateTime.value.toISOString()
  }
  if (endDateTime.value) {
    formData.value.end_at = endDateTime.value.toISOString()
  }
})

watch(defaultCreatedById, (newId) => {
  if (!props.visit) {
    formData.value.created_by_id = newId
  }
})


// Load houses on mount
const loadData = async () => {
  try {
    await fetchHouses({ is_active: true, limit: 100 })
  } catch (err) {
    console.error('Failed to load houses:', err)
  }
}

loadData()

const validateForm = () => {
  errors.value = {}

  if (visitAssignmentType.value === 'client') {
    if (!selectedClientId.value) {
      errors.value.client_id = 'Client is required'
    }
  } else if (!selectedHouseId.value) {
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

const prepareAssignmentTargets = () => {
  const clientId = visitAssignmentType.value === 'client' ? selectedClientId.value : null
  const houseId = visitAssignmentType.value === 'house'
    ? selectedHouseId.value
    : getClientHouseId(selectedClientId.value)
  formData.value.client_id = clientId
  formData.value.house_id = houseId ?? null
  return { clientId, houseId }
}

const handleSave = async () => {
  console.log('[AddVisitDialog] handleSave called', JSON.stringify(formData.value, null, 2))
  if (!validateForm()) {
    console.warn('[AddVisitDialog] Validation failed', errors.value)
    return
  }

  const { clientId, houseId } = prepareAssignmentTargets()

  submitting.value = true
  try {
    if (props.visit) {
      // Update existing visit
      const updateData: UpdateVisitRequest = {
        client_id: clientId,
        house_id: houseId,
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
      const payload: CreateVisitRequest = {
        ...formData.value,
        created_by_id: defaultCreatedById.value,
        client_id: clientId ?? null,
        house_id: houseId ?? null
      }
      const result = await createVisit(payload)
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