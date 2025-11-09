<template>
  <Dialog
    v-model:visible="dialogVisible"
    modal
    :header="`Client Details - ${client?.first_name} ${client?.last_name}`"
    :style="{ width: '50rem' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    class="client-details-dialog"
  >
    <div v-if="client" class="space-y-6">
      <!-- Contact Information -->
      <div class="section">
        <h3 class="section-title">Contact Information</h3>
        <!-- Top row: Name, Email, Phone -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 divide-y md:divide-y-0 md:divide-x divide-gray-200 mb-4">
          <div class="field-column">
            <label class="field-header">Name</label>
            <p class="field-content">{{ client.first_name }} {{ client.last_name }}</p>
          </div>
          <div class="field-column">
            <label class="field-header">Email</label>
            <p class="field-content truncate">{{ client.email }}</p>
          </div>
          <div class="field-column">
            <label class="field-header">Phone</label>
            <p class="field-content">{{ formatClientPhone(client.phone) }}</p>
          </div>
        </div>
        <!-- Bottom row: Address -->
        <div class="border-t border-gray-200 pt-4">
          <div class="field-column">
            <label class="field-header">Address</label>
            <p class="field-content">{{ client.city }}, {{ client.state }}</p>
          </div>
        </div>
      </div>

      <!-- Emergency Contact -->
      <div class="section">
        <h3 class="section-title">Emergency Contact</h3>
        <div v-if="client.emergency_contact_name || client.emergency_contact_phone" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="field">
            <label class="field-label">Contact Name</label>
            <p class="field-value">{{ client.emergency_contact_name || 'Not provided' }}</p>
          </div>
          <div class="field">
            <label class="field-label">Contact Phone</label>
            <p class="field-value">{{ client.emergency_contact_phone ? formatClientPhone(client.emergency_contact_phone) : 'Not provided' }}</p>
          </div>
        </div>
        <div v-else class="text-gray-500 italic">
          No emergency contact information provided
        </div>
      </div>

      <!-- Preferred Service -->
      <div class="section">
        <h3 class="section-title">Preferred Service</h3>
        <div class="field">
          <label class="field-label">House/Service</label>
          <span class="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {{ getHouseName(client.house_id) }}
          </span>
        </div>
      </div>

      <!-- Special Instructions -->
      <div class="section">
        <h3 class="section-title">Special Instructions</h3>
        <div class="field">
          <label class="field-label">Care Instructions</label>
          <p class="field-value">{{ client.care_notes || 'No special care instructions provided' }}</p>
        </div>
      </div>

      <!-- Notes -->
      <div class="section">
        <h3 class="section-title">Notes</h3>
        <div class="space-y-3">
          <div class="field">
            <label class="field-label">Medical Notes</label>
            <p class="field-value">{{ client.medical_notes || 'No medical notes provided' }}</p>
          </div>
          <div class="field">
            <label class="field-label">General Notes</label>
            <p class="field-value">No additional notes provided</p>
          </div>
        </div>
      </div>

      <!-- Schedules -->
      <div class="section">
        <h3 class="section-title">Schedules</h3>
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-blue-900">Upcoming Appointments</p>
              <p class="text-sm text-blue-700">2 appointments scheduled</p>
            </div>
            <Button
              label="View Schedule"
              icon="pi pi-calendar"
              class="p-button-sm"
              outlined
              severity="info"
            />
          </div>
        </div>
      </div>

      <!-- Client Timestamps -->
      <div class="section border-t pt-4">
        <h3 class="section-title text-sm">Account Information</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
          <div class="field">
            <label class="field-label text-xs">Member Since</label>
            <p class="field-value text-xs">{{ formatDate(client.created_at) }}</p>
          </div>
          <div class="field">
            <label class="field-label text-xs">Last Updated</label>
            <p class="field-value text-xs">{{ formatDate(client.updated_at) }}</p>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end space-x-3">
        <Button
          label="Close"
          icon="pi pi-times"
          @click="closeDialog"
          outlined
        />
        <Button
          label="Edit Client"
          icon="pi pi-pencil"
          @click="handleEdit"
          severity="info"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import { useClients } from '@/composables/useClients'
import { useHousesDummy } from '@/composables/useHousesDummy'
import type { Client } from '@/views/Clients/types'

interface Props {
  visible: boolean
  client: Client | null
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'edit', client: Client): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { formatClientPhone } = useClients()
const { houses } = useHousesDummy()

// Computed for dialog visibility
const dialogVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value)
})

// Get house name by ID
const getHouseName = (houseId: number) => {
  const house = houses.value.find(h => h.id === houseId)
  return house ? house.name : 'Unknown Service'
}

// Format date helper
const formatDate = (dateString: string) => {
  if (!dateString) return 'Not provided'
  try {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return 'Invalid date'
  }
}

// Methods
const closeDialog = () => {
  emit('update:visible', false)
}

const handleEdit = () => {
  if (props.client) {
    emit('edit', props.client)
  }
}
</script>

<style scoped>
.section {
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  padding: 1rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f3f4f6;
}

.field {
  margin-bottom: 0.25rem;
}

.field-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  display: block;
  margin-bottom: 0.25rem;
}

.field-value {
  color: #111827;
  font-size: 0.875rem;
  line-height: 1.625;
}

/* New styles for contact information columns */
.field-column {
  padding: 1rem;
  text-align: left;
  min-width: 0; /* Allows flex items to shrink */
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.field-header {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  display: block;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-align: left;
}

.field-content {
  color: #111827;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.5;
  word-break: break-word;
  hyphens: auto;
  text-align: left;
}

/* Responsive divider adjustments */
@media (max-width: 768px) {
  .field-column {
    padding: 0.75rem 0;
    border-right: none !important;
  }
}

@media (min-width: 769px) {
  .field-column:not(:last-child) {
    border-right: 1px solid #e5e7eb;
  }
  
  .field-column:first-child {
    padding-left: 0;
  }
  
  .field-column:last-child {
    padding-right: 0;
  }
}

:deep(.p-dialog-header) {
  background: #eff6ff;
  border-bottom: 1px solid #bfdbfe;
}

:deep(.p-dialog-title) {
  color: #1e3a8a;
  font-weight: 600;
}

:deep(.p-dialog-content) {
  max-height: 24rem;
  overflow-y: auto;
}
</style>