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
        <div class="details-grid grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div class="field-column details-grid__item">
            <label class="field-header">Name</label>
            <p class="field-content">{{ client.first_name }} {{ client.last_name }}</p>
          </div>
          <div class="field-column details-grid__item">
            <label class="field-header">Email</label>
            <p class="field-content truncate">{{ client.email }}</p>
          </div>
          <div class="field-column details-grid__item">
            <label class="field-header">Phone</label>
            <p class="field-content">{{ formatClientPhone(client.phone) }}</p>
          </div>
        </div>
        <!-- Bottom row: Address -->
        <div class="section-divider">
          <div class="field-column">
            <label class="field-header">Address</label>
            <p class="field-content">{{ client.city }}, {{ client.state }}</p>
          </div>
        </div>
      </div>

      <!-- Emergency Contact -->
      <div class="section">
        <h3 class="section-title">Emergency Contact</h3>
        <div v-if="client.emergency_contact_name || client.emergency_contact_phone" class="details-grid grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="field-column details-grid__item">
            <label class="field-header">Contact Name</label>
            <p class="field-content">{{ client.emergency_contact_name || 'Not provided' }}</p>
          </div>
          <div class="field-column details-grid__item">
            <label class="field-header">Contact Phone</label>
            <p class="field-content">{{ client.emergency_contact_phone ? formatClientPhone(client.emergency_contact_phone) : 'Not provided' }}</p>
          </div>
        </div>
        <div v-else class="text-muted italic">
          No emergency contact information provided
        </div>
      </div>

      <!-- Preferred Service -->
      <div class="section">
        <h3 class="section-title">Preferred Service</h3>
        <div class="field">
          
          <span class="service-chip">
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
        <div class="space-y-4">
          <!-- Schedule Item 1 -->
          <div class="schedule-card">
            <div class="details-grid grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="field-column details-grid__item">
                <label class="field-header">From:</label>
                <p class="field-content">23rd September, 2025</p>
              </div>
              <div class="field-column details-grid__item">
                <label class="field-header">To:</label>
                <p class="field-content">29th September, 2025</p>
              </div>
              <div class="field-column details-grid__item">
                <label class="field-header">Time:</label>
                <p class="field-content">8:00AM - 10:00PM</p>
              </div>
            </div>
          </div>
          
          <!-- Schedule Item 2 -->
          <div class="schedule-card">
            <div class="details-grid grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="field-column details-grid__item">
                <label class="field-header">From:</label>
                <p class="field-content">30th September, 2025</p>
              </div>
              <div class="field-column details-grid__item">
                <label class="field-header">To:</label>
                <p class="field-content">5th October, 2025</p>
              </div>
              <div class="field-column details-grid__item">
                <label class="field-header">Time:</label>
                <p class="field-content">9:00AM - 3:00PM</p>
              </div>
            </div>
          </div>
          
          <!-- Schedule Item 3 -->
          <div class="schedule-card">
            <div class="details-grid grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="field-column details-grid__item">
                <label class="field-header">From:</label>
                <p class="field-content">7th October, 2025</p>
              </div>
              <div class="field-column details-grid__item">
                <label class="field-header">To:</label>
                <p class="field-content">12th October, 2025</p>
              </div>
              <div class="field-column details-grid__item">
                <label class="field-header">Time:</label>
                <p class="field-content">10:00AM - 6:00PM</p>
              </div>
            </div>
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
          class="details-primary-action"
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
import { useHouses } from '@/composables/useHouses'
import type { Client } from '@/views/Clients/types'
import type { House } from '@/views/Houses/types'

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
const { houses } = useHouses()

const getHouseName = (houseId: number | null | undefined) => {
  if (!houseId) {
    return 'No house assigned'
  }
  const house = houses.value.find(h => h.id === houseId)
  return house ? house.name : `House #${houseId}`
}

// Computed for dialog visibility
const dialogVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value)
})

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
  background: var(--app-surface);
  border-radius: 1rem;
  border: 1px solid var(--app-border);
  padding: 1.25rem;
  box-shadow: var(--app-card-shadow);
}

.section + .section {
  margin-top: 1rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--app-text);
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--app-border);
}

.field {
  margin-bottom: 0.25rem;
}

.field-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--app-text-muted);
  display: block;
  margin-bottom: 0.25rem;
}

.field-value {
  color: var(--app-text);
  font-size: 0.875rem;
  line-height: 1.625;
}

.field-column {
  padding: 1rem;
  text-align: left;
  min-width: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.field-header {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--app-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.35rem;
}

.field-content {
  color: var(--app-text);
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1.5;
  word-break: break-word;
}

.section-divider {
  border-top: 1px solid var(--app-border);
  margin-top: 1rem;
  padding-top: 1rem;
}

.details-grid {
  position: relative;
}

.details-grid__item {
  position: relative;
}

@media (max-width: 768px) {
  .field-column {
    padding-inline: 0;
  }

  .details-grid__item + .details-grid__item {
    border-top: 1px solid var(--app-border);
    padding-top: 1rem;
  }
}

@media (min-width: 769px) {
  .details-grid__item {
    padding-left: 1rem;
  }

  .details-grid__item:first-child {
    padding-left: 0;
  }

  .details-grid__item + .details-grid__item {
    border-left: 1px solid var(--app-border);
  }
}

.service-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.9rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 600;
  background: var(--app-surface-muted);
  color: var(--app-text);
  border: 1px solid var(--app-border);
}

.schedule-card {
  border: 1px solid var(--app-border);
  border-radius: 1rem;
  padding: 1rem;
  background: var(--app-surface-muted);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.details-primary-action {
  background: linear-gradient(135deg, #0ea5e9, #2563eb);
  border: none;
  color: #fff;
  border-radius: 0.75rem;
  padding-inline: 1.5rem;
  box-shadow: 0 12px 24px rgba(37, 99, 235, 0.35);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.details-primary-action:hover {
  transform: translateY(-1px);
  box-shadow: 0 15px 28px rgba(37, 99, 235, 0.45);
}

:deep(.p-dialog-header) {
  background: var(--app-surface-muted);
  border-bottom: 1px solid var(--app-border);
}

:deep(.p-dialog-title) {
  color: var(--app-text);
  font-weight: 600;
}

:deep(.p-dialog-content) {
  max-height: 24rem;
  overflow-y: auto;
  background: var(--app-surface);
}

:deep(.p-dialog-footer) {
  background: var(--app-surface-muted);
  border-top: 1px solid var(--app-border);
}

:deep(.p-dialog-content::-webkit-scrollbar) {
  width: 6px;
}

:deep(.p-dialog-content::-webkit-scrollbar-track) {
  background: var(--app-surface-muted);
}

:deep(.p-dialog-content::-webkit-scrollbar-thumb) {
  background: var(--app-border);
  border-radius: 3px;
}

:deep(.p-dialog-content::-webkit-scrollbar-thumb:hover) {
  background: var(--app-accent);
}

.text-muted {
  color: var(--app-text-muted);
}
</style>
