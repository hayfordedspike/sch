<template>
  <Card class="client-card hover:shadow-lg transition-all duration-300 cursor-pointer">
    <template #header>
      <div class="client-card__header">
        <div class="client-card__actions">
          <GlobalButton
            icon="pi pi-pencil"
            class="p-button-rounded p-button-outlined p-button-sm client-card__action-btn"
            @click.stop="handleEdit"
            v-tooltip="'Edit Client'"
            severity="info"
          />
          <GlobalButton
            icon="pi pi-trash"
            class="p-button-rounded p-button-outlined p-button-sm client-card__action-btn"
            @click.stop="handleDelete"
            v-tooltip="'Delete Client'"
            severity="danger"
          />
          <GlobalButton
            v-if="!client.is_active"
            icon="pi pi-check"
            class="p-button-rounded p-button-outlined p-button-sm client-card__action-btn"
            @click.stop="handleActivate"
            v-tooltip="'Activate Client'"
            severity="success"
          />
          <GlobalButton
            v-else
            icon="pi pi-times"
            class="p-button-rounded p-button-outlined p-button-sm client-card__action-btn"
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
        <h3 class="text-xl font-bold text-primary mb-2">
          {{ displayInfo.fullName }}
        </h3>

        <!-- House Name -->
        <div class="mb-2">
          <span class="house-chip">
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
        <div class="space-y-2 text-sm text-muted mb-4">
          <!-- Phone -->
          <div class="flex items-center">
            <i class="pi pi-phone mr-2 text-green-500 w-4"></i>
            <span>{{ formatClientPhone(client.phone) }}</span>
          </div>

          <!-- Email -->
          <div class="flex items-center">
            <i class="pi pi-envelope mr-2 w-4" style="color: #065986"></i>
            <span class="truncate">{{ client.email }}</span>
          </div>

          <!-- Address -->
          <div class="flex items-center">
            <i class="pi pi-map-marker mr-2 text-red-500 w-4"></i>
            <span class="truncate">{{ client.city }}, {{ client.state }}</span>
          </div>

          <!-- Upcoming Appointments -->
          <div class="flex items-center">
            <i class="pi pi-calendar mr-2 text-purple-400 w-4"></i>
            <span class="badge-muted">2 upcoming appointments</span>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="p-0">
        <!-- View Details Button -->
        <GlobalButton
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
import GlobalButton from '@/components/shared/GlobalButton.vue'
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
const getHouseName = (houseId: number | null | undefined) => {
  if (!houseId) {
    return 'No house assigned'
  }
  const house = houses.value.find(h => h.id === houseId)
  return house ? house.name : `House #${houseId}`
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
/* Card base styles */
/* Card base styles */
.client-card {
  border: 1px solid var(--app-border);
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  min-width: 260px;
  box-sizing: border-box;
  padding: 1.25rem 1rem 1rem 1rem;
  margin: 0 auto 1.5rem auto;
  background: var(--app-surface);
  color: var(--app-text);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  box-shadow: var(--app-card-shadow);
}

.client-card:hover {
  border-color: var(--app-border-strong);
  transform: translateY(-2px);
}

.client-card__header {
  display: flex;
  justify-content: flex-end;
  padding: 0.25rem 0.5rem 0;
}

.client-card__actions {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.client-card__action-btn {
  min-width: 2.5rem;
}

/* Card content spacing */
:deep(.p-card-header),
:deep(.p-card-content),
:deep(.p-card-footer) {
  padding: 0.5rem 0;
}

/* Tag styling */
:deep(.p-tag) {
  font-size: 0.85rem;
  padding: 0.3rem 1rem;
  border-radius: 9999px;
  font-weight: 500;
  border: none;
}

/* Button spacing */
:deep(.p-button-sm) {
  padding: 0.375rem 0.75rem;
  font-size: 0.95rem;
}

:deep(.p-button-rounded) {
  width: 2.2rem;
  height: 2.2rem;
  padding: 0;
}

/* Responsive styles */
@media (max-width: 600px) {
  .client-card {
    max-width: 98vw;
    min-width: 0;
    padding: 0.75rem 0.5rem;
  }
  .client-card__header {
    justify-content: flex-start;
    padding: 0.25rem 0.25rem 0.5rem;
  }
  .client-card__actions {
    width: 100%;
    justify-content: flex-start;
  }
  .client-card__action-btn {
    flex: 1 1 30%;
  }
  h3.text-xl {
    font-size: 1.1rem;
    word-break: break-word;
    overflow-wrap: anywhere;
  }
  :deep(.p-tag) {
    font-size: 0.75rem;
    padding: 0.2rem 0.5rem;
  }
}

/* Ensure long names/content wrap and don't overflow */
h3.text-xl, .truncate, .client-card span {
  word-break: break-word;
  overflow-wrap: anywhere;
}

.house-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  background-color: var(--app-surface-muted);
  color: var(--app-text);
}

.badge-muted {
  font-size: 0.75rem;
  background-color: var(--app-surface-muted);
  color: var(--app-text);
  padding: 0.15rem 0.65rem;
  border-radius: 9999px;
}

.text-muted {
  color: var(--app-text-muted);
}
</style>
