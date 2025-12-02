
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
        </div>

        <div class="flex-1">
          <label class="block text-sm font-medium mb-1">Client Location</label>
          <InputText v-model="form.location" required class="w-full" placeholder="Location" />
        </div>
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium mb-1">Note <span class="text-xs text-gray-400">(optional)</span></label>
        <Textarea v-model="form.note" class="w-full" rows="2" placeholder="Additional notes" />
      </div>
      <div class="flex justify-end gap-2 mt-6">
        <Button label="Cancel" class="p-button-text" @click="close" />
        <Button label="Create" type="submit" class="bg-blue-600 text-white" />
      </div>
    </form>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, defineProps } from 'vue'
import { useToast } from 'primevue/usetoast'
import api from '@/axios.config'
import { useEmployees } from '@/composables/useEmployees'
import { useClients } from '@/composables/useClients'

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

// Generate 24-hour time options in 15-minute intervals, AM/PM format
const timeOptions = Array.from({ length: 24 * 4 }, (_, i) => {
  const hour = Math.floor(i / 4)
  const minute = (i % 4) * 15
  const ampm = hour < 12 ? 'AM' : 'PM'
  const displayHour = hour % 12 === 0 ? 12 : hour % 12
  const label = `${displayHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${ampm}`
  const value = `${displayHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${ampm}`
  return { label, value }
})



// Use active employees for assign-to dropdown
const { employees, fetchEmployees, activeEmployees } = useEmployees()
const assignToOptions = ref<{ label: string; value: number }[]>([])

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
    const response = await api.post('/schedules', payload)
    if (response?.data) {
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
</style>
