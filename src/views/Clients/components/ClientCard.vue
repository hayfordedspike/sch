<template>
  <Card class="client-card hover:shadow-lg transition-all duration-300 cursor-pointer">
    <template #header>
      <div class="relative">
        <!-- Action Buttons -->
        <div class="absolute top-4 right-4 flex space-x-1">
          <Button
            icon="pi pi-pencil"
            class="p-button-rounded p-button-outlined p-button-sm"
            @click.stop="handleEdit"
            v-tooltip="'Edit Client'"
            severity="info"
          />
          <Button
            icon="pi pi-trash"
            class="p-button-rounded p-button-outlined p-button-sm"
            @click.stop="handleDelete"
            v-tooltip="'Delete Client'"
            severity="danger"
          />
          <Button
            v-if="!client.is_active"
            icon="pi pi-check"
            class="p-button-rounded p-button-outlined p-button-sm"
            @click.stop="handleActivate"
            v-tooltip="'Activate Client'"
            severity="success"
          />
          <Button
            v-else
            icon="pi pi-times"
            class="p-button-rounded p-button-outlined p-button-sm"
            @click.stop="handleDeactivate"
            v-tooltip="'Deactivate Client'"
            severity="warning"
          />
        </div>
      </div>
    </template>

    <template #content>
      <div class="px-6 pb-4">
        <!-- Client Name -->
        <h3 class="text-xl font-bold text-gray-900 mb-2">
          {{ displayInfo.fullName }}
        </h3>

        <!-- House Name -->
        <div class="mb-2">
          <span class="text-sm font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
            {{ getHouseName(client.house_id) }}
          </span>
        </div>

        <!-- Client Status -->
        <div class="mb-3">
          <Tag
            :severity="client.is_active ? 'success' : 'danger'"
            :value="client.is_active ? 'Active' : 'Inactive'"
            class="text-xs font-medium"
          />
        </div>

        <!-- Client Details -->
        <div class="space-y-2 text-sm text-gray-600 mb-4">
          <!-- Phone -->
          <div class="flex items-center">
            <i class="pi pi-phone mr-2 text-green-500 w-4"></i>
            <span>{{ formatClientPhone(client.phone) }}</span>
          </div>

          <!-- Email -->
          <div class="flex items-center">
            <i class="pi pi-envelope mr-2 text-blue-500 w-4"></i>
            <span class="truncate">{{ client.email }}</span>
          </div>

          <!-- Address -->
          <div class="flex items-center">
            <i class="pi pi-map-marker mr-2 text-red-500 w-4"></i>
            <span class="truncate">{{ client.city }}, {{ client.state }}</span>
          </div>

          <!-- Upcoming Appointments -->
          <div class="flex items-center">
            <i class="pi pi-calendar mr-2 text-purple-500 w-4"></i>
            <span class="text-xs bg-white text-back px-2 py-1 rounded">2 upcoming appointments</span>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="p-0">
        <!-- View Details Button -->
        <Button
          label="View Details"
          icon="pi pi-eye"
          class="w-full rounded-t-none"
          @click.stop="handleViewDetails"
          outlined
        />
      </div>
    </template>
  </Card>

  <!-- View Details Dialog -->
  <ViewClientDetailsDialog
    v-model:visible="showDetailsDialog"
    :client="client"
    @edit="handleEdit"
  />
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useClients } from '@/composables/useClients'
import { useHouses } from '@/composables/useHouses'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import ViewClientDetailsDialog from './ViewClientDetailsDialog.vue'
import type { Client } from '@/views/Clients/types'

interface Props {
  client: Client
}

interface Emits {
  (e: 'edit', client: Client): void
  (e: 'delete', client: Client): void
  (e: 'view-details', client: Client): void
  (e: 'activate', client: Client): void
  (e: 'deactivate', client: Client): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const {
  getClientDisplayInfo,
  formatClientPhone
} = useClients()

const { houses, fetchHouses } = useHouses()

// Reactive data
const showDetailsDialog = ref(false)

// Computed
const displayInfo = computed(() => getClientDisplayInfo(props.client))

// Get house name by ID
const getHouseName = (houseId: number) => {
  const house = houses.value.find(h => h.id === houseId)
  return house ? house.name : 'Unknown House'
}

// Methods
const handleEdit = () => {
  emit('edit', props.client)
}

const handleDelete = () => {
  emit('delete', props.client)
}

const handleViewDetails = () => {
  showDetailsDialog.value = true
}

const handleActivate = () => {
  emit('activate', props.client)
}

const handleDeactivate = () => {
  emit('deactivate', props.client)
}

// Lifecycle
onMounted(() => {
  fetchHouses({ limit: 100 })
})
</script>

<style scoped>
.client-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  height: 100%;
}

.client-card:hover {
  border-color: #d1d5db;
  transform: translateY(-2px);
}

:deep(.p-card-header) {
  padding: 0;
}

:deep(.p-card-content) {
  padding: 0;
}

:deep(.p-card-footer) {
  padding: 0;
}

/* Tag styling */
:deep(.p-tag) {
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-weight: 500;
  border: none;
}

/* Button spacing */
:deep(.p-button-sm) {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

:deep(.p-button-rounded) {
  width: 2rem;
  height: 2rem;
  padding: 0;
}
</style>
