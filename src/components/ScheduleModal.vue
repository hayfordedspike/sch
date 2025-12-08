<template>
  <Dialog v-model:visible="visible" modal header="Create New Schedule" :style="{ width: '850px' }">
    <form @submit.prevent="handleSubmit">
      <div class="mb-4">
        <label class="block text-sm font-medium mb-1">Schedule Title</label>
        <InputText v-model="form.title" required class="w-full" placeholder="Enter schedule title" />
      </div>
      <div class="mb-4 flex gap-4">
        <div class="flex-1">
          <label class="block text-sm font-medium mb-1">Assign To</label>
          <Dropdown
            v-model="form.assignedTo"
            :options="assignToOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
            placeholder="Select staff"
          />
        </div>
      </div>
      <div class="mb-4 flex gap-2">
        <div class="flex-1">
          <label class="block text-sm font-medium mb-1">Date</label>
          <Calendar v-model="form.date" class="w-full" showIcon />
        </div>
        <div class="flex-1">
          <label class="block text-sm font-medium mb-1">Time</label>
          <div class="flex items-center gap-2">
            <Dropdown v-model="form.startTime" :options="timeOptions" optionLabel="label" optionValue="value" class="w-1/2" placeholder="Start time" />
            <span class="mx-2 text-center font-semibold">To</span>
            <Dropdown v-model="form.endTime" :options="timeOptions" optionLabel="label" optionValue="value" class="w-1/2" placeholder="End time" />
          </div>
        </div>
      </div>
      
      <div class="mb-4 flex gap-4">
        
        <div class="flex-1">
          <label class="block text-sm font-medium mb-1">Client</label>
          <Dropdown v-model="form.client" :options="clientOptions" optionLabel="label" optionValue="value" class="w-full" placeholder="Select client" />
          
          <div class="pt-4" style="min-height: 16px;"></div>
        </div>

        <div class="flex-1">
          <div class="flex justify-between items-center">
            <label class="block text-sm font-medium mb-1 truncate">Client Location</label>
            <GlobalButton
              v-show="locationLocked"
              label="Clear"
              size="sm"
              severity="secondary"
              text
              type="button"
              class="shrink-0 mb-1"
              @click="clearPrefilledLocation"
            />
          </div>
          
          <InputText
            v-model="form.location"
            required
            class="w-full overflow-hidden whitespace-nowrap text-overflow-ellipsis" 
            placeholder="Location"
            :disabled="locationLocked"
          />
          
          <div style="min-height: 16px;" class="pt-0.5">  
            <small v-if="locationLocked" class="text-xs text-gray-500">Clear the pre-filled address to enter a different location.</small>
          </div>
        </div>
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium mb-1">Note <span class="text-xs text-gray-400">(optional)</span></label>
        <Textarea v-model="form.note" class="w-full" rows="2" placeholder="Additional notes" />
      </div>
      <div class="flex justify-end gap-2 mt-6">
        <GlobalButton label="Cancel" class="p-button-text" @click="close" type="warning" />
        <GlobalButton label="Create" type="submit" class="bg-blue-600 text-white" />
      </div>
    </form>
  </Dialog>
</template>

<script setup lang="ts">
// ... (Script block remains unchanged)

import { ref, watch, onMounted, defineProps, computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useApi } from '@/composables/useApi'
import { useEmployees } from '@/composables/useEmployees'
import { useClients } from '@/composables/useClients'
import type { Client } from '@/views/Clients/types'
import GlobalButton from '@/components/shared/GlobalButton.vue'

// Use active clients for client dropdown
const { clients, fetchClients, activeClients } = useClients()
const clientOptions = ref<{ label: string; value: number }[]>([])

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits(['update:visible'])

const visible = ref(props.visible)
watch(() => props.visible, v => visible.value = v)


const form = ref({
  title: '',
  assignedTo: null as number | null,
  date: null as Date | null,
  startTime: '',
  endTime: '',
  client: null as number | null,
  location: '',
  note: ''
})

const locationLocked = ref(false)
const { post } = useApi()

// Generate 24-hour time options in 15-minute intervals, AM/PM format
const timeOptions = Array.from({ length: 24 * 4 }, (_, i) => {
  const hour = Math.floor(i / 4)
  const minute = (i % 4) * 15
  const ampm = hour < 12 ? 'AM' : 'PM'
  const displayHour = hour % 12 === 0 ? 12 : hour % 12
  // Format the time value consistently for both display and internal use
  const value = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
  const label = `${displayHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${ampm}`
  return { label, value }
})


// Use active employees for assign-to dropdown
const { employees, fetchEmployees, activeEmployees } = useEmployees()
const assignToOptions = ref<{ label: string; value: number }[]>([])

const selectedClient = computed(() => {
  if (!form.value.client) return null
  return activeClients.value.find(c => c.id === form.value.client) ?? null
})

const formatClientAddress = (client: Client): string => {
  const cityState = [client.city, client.state].filter(Boolean).join(', ')
  return [
    client.address_line_1,
    client.address_line_2,
    cityState,
    client.postal_code,
    client.country
  ]
    .map(part => (typeof part === 'string' ? part.trim() : ''))
    .filter(Boolean)
    .join(', ')
}

const clearPrefilledLocation = () => {
  locationLocked.value = false
  form.value.location = ''
}

watch(selectedClient, (client) => {
  if (client) {
    form.value.location = formatClientAddress(client)
    locationLocked.value = true
  } else {
    locationLocked.value = false
    form.value.location = ''
  }
}, { immediate: true })

onMounted(async () => {
  await fetchEmployees({ status: 'ACTIVE', limit: 100 })
  assignToOptions.value = activeEmployees.value.map(e => ({
    label: `${e.first_name} ${e.last_name}`,
    value: e.id
  }))

  await fetchClients({ is_active: true, limit: 100 })
  clientOptions.value = activeClients.value.map(c => ({
    label: `${c.first_name} ${c.last_name}`,
    value: c.id
  }))
})

function close() {
  emit('update:visible', false)
}

const toast = useToast()

async function handleSubmit() {
  try {
    // You may want to validate form here
    const payload = { ...form.value }
    const response = await post('/schedules/', payload, {
      showErrorToast: false,
      showSuccessToast: false
    })
    if (response) {
      toast.add({
        severity: 'success',
        summary: 'Schedule Created',
        detail: 'The schedule was created successfully.',
        life: 3000
      })
      close()
    } else {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to create schedule.',
        life: 4000
      })
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create schedule.'
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 4000
    })
  }
}
</script>

<style scoped>
/* Add any custom styles if needed */

/* PrimeVue components often render their inner text inside a wrapper element.
   Sometimes, Tailwind's `truncate` doesn't apply directly to the text 
   within the component's internal structure. This CSS ensures truncation works 
   for the `InputText` by explicitly targeting its native input element.
*/
.text-overflow-ellipsis input {
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}
</style>