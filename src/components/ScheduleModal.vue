
<template>
  <Dialog v-model:visible="visible" modal header="Create New Schedule" :style="{ width: '850px' }">
    <form @submit.prevent="handleSubmit">
      <div class="mb-4">
        <label class="block text-sm font-medium mb-1">Schedule Title</label>
        <InputText v-model="form.title" required class="w-full" placeholder="Enter schedule title" />
      </div>
      <div class="mb-4 flex gap-4">
        <div class="flex-1">
          <label class="block text-sm font-medium mb-1">Service Type</label>
          <Dropdown v-model="form.type" :options="scheduleTypes" optionLabel="label" optionValue="value" class="w-full" placeholder="Select type" />
        </div>
        <div class="flex-1">
          <label class="block text-sm font-medium mb-1">Assign To</label>
          <Dropdown v-model="form.assignedTo" :options="staffOptions" optionLabel="name" optionValue="email" class="w-full" placeholder="Select staff" />
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
            <InputText v-model="form.startTime" required class="w-1/2" placeholder="Start (e.g. 9:00 AM)" />
            <span class="mx-2 text-center font-semibold">To</span>
            <InputText v-model="form.endTime" required class="w-1/2" placeholder="End (e.g. 10:00 AM)" />
          </div>
        </div>
      </div>
      <div class="mb-4 flex gap-4">
        <div class="flex-1">
          <label class="block text-sm font-medium mb-1">Client</label>
          <Dropdown v-model="form.client" :options="dummyClients" optionLabel="label" optionValue="value" class="w-full" placeholder="Select client" />
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
import { ref, watch, defineProps, defineEmits } from 'vue'

const dummyClients = [
  { label: 'Mrs. Joyce', value: 'Mrs. Joyce' },
  { label: 'Mr. Smith', value: 'Mr. Smith' },
  { label: 'Ms. Brown', value: 'Ms. Brown' },
  { label: 'Mr. Wilson', value: 'Mr. Wilson' },
  { label: 'Anderson Family', value: 'Anderson Family' },
  { label: 'Mrs. Garcia', value: 'Mrs. Garcia' },
  { label: 'Ward Patients', value: 'Ward Patients' },
  { label: 'Multiple Clients', value: 'Multiple Clients' },
  { label: 'Group Session', value: 'Group Session' },
  { label: 'Mr. Taylor', value: 'Mr. Taylor' },
  { label: 'Unknown', value: 'Unknown' }
]

const props = defineProps<{ visible: boolean, staffOptions: Array<{ name: string, email: string }> }>()
const emit = defineEmits(['update:visible', 'submit'])

const visible = ref(props.visible)
watch(() => props.visible, v => visible.value = v)

const form = ref({
  title: '',
  type: '',
  assignedTo: '',
  date: null,
  startTime: '',
  endTime: '',
  client: '',
  location: '',
  note: ''
})

const scheduleTypes = [
  { label: 'Care Routine', value: 'care' },
  { label: 'Medication', value: 'medication' },
  { label: 'Physical Therapy', value: 'therapy' },
  { label: 'Consultation', value: 'consultation' },
  { label: 'Other', value: 'other' }
]

function close() {
  emit('update:visible', false)
}

function handleSubmit() {
  emit('submit', { ...form.value })
  close()
}
</script>

<style scoped>
/* Add any custom styles if needed */
</style>
