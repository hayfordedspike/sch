<template>
  <div class="p-6 bg-white min-h-screen">
    <!-- Header Section -->
    <div class="w-full mb-8">
      <div class="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div class="client-section rounded-xl p-6 shadow-sm border border-gray-200">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <!-- Title and Stats -->
            <div>
              <h1 class="text-3xl font-bold text-primary flex items-center">
                <i class="pi pi-users mr-3 text-blue-600"></i>
                Clients
              </h1>
              <p class="text-muted mt-2">
                Manage your clients information and service preferences
              </p>
            </div>
            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3">
              <GlobalButton
                @click="handleAddClient"
                icon="pi pi-plus"
                label="Add New Client"
                class="bg-blue-600 hover:bg-blue-700 border-0 text-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- View Switcher -->
    <div class="flex justify-end mb-4 gap-2">
      <GlobalButton
        :label="'Card View'"
        :severity="viewMode === 'card' ? 'primary' : 'warning'"
        :outlined="viewMode === 'table'"
        class="min-w-[120px]"
        @click="viewMode = 'card'"
      />
      <GlobalButton
        :label="'Table View'"
        :severity="viewMode === 'table' ? 'primary' : 'warning'"
        :outlined="viewMode === 'card'"
        class="min-w-[120px]"
        @click="viewMode = 'table'"
      />
    </div>
    <!-- Clients Data -->
    <div v-if="viewMode === 'card'" class="grid gap-6 clients-grid">
      <ClientCard
        v-for="client in filteredClients"
        :key="client.id"
        :client="client"
        @edit="handleEditClient"
        @delete="handleDeleteClient"
        @view-details="handleViewClientDetails"
        @activate="handleActivateClient"
        @deactivate="handleDeactivateClient"
      />
    </div>
    <div v-else>
      <ClientTable
        :clients="filteredClients"
        @view="handleViewClientDetails"
        @edit="handleEditClient"
        @delete="handleDeleteClient"
        @activate="handleActivateClient"
        @deactivate="handleDeactivateClient"
      />
    </div>
    <!-- Details Dialog -->
    <ViewClientDetailsDialog
      v-model:visible="showDetailsDialog"
      :client="detailsClient"
      @edit="handleEditClient"
    />
    <!-- Load More Button -->
    <div v-if="!loading && filteredClients.length > 0 && hasMoreClients" class="text-center mt-8">
      <GlobalButton
        @click="loadMoreClients"
        icon="pi pi-angle-down"
        label="Load More Clients"
        class="p-button-outlined"
        :loading="loadingMore"
      />
    </div>
    <!-- Add/Edit Client Dialog -->
    <AddClientDialog
      v-model:visible="showAddClientDialog"
      :client="editingClient"
      @client-added="handleClientAdded"
      @client-updated="handleClientUpdated"
    />
    <!-- Client Details Dialog -->
    <!-- TODO: Implement ClientDetailsDialog component -->
    <!-- Confirmation Dialog -->
    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { useClients } from '@/composables/useClients'
import GlobalButton from '@/components/shared/GlobalButton.vue'
import ConfirmDialog from 'primevue/confirmdialog'
import { ClientCard, AddClientDialog } from './components'
import ClientTable from './components/ClientTable.vue'
import ViewClientDetailsDialog from './components/ViewClientDetailsDialog.vue'
import type { Client } from './types'

defineOptions({ name: 'ClientsView' })

const confirm = useConfirm()
const toast = useToast()

const {
  clients,
  currentPage,
  totalPages,
  loading,
  fetchClients,
  deleteClient,
  activateClient,
  deactivateClient
} = useClients()

// Search and filter state
const loadingMore = ref(false)
const currentLimit = ref(20)

// Dialog state
const showAddClientDialog = ref(false)
const editingClient = ref<Client | null>(null)
const showDetailsDialog = ref(false)
const detailsClient = ref<Client | null>(null)

// View mode state
const viewMode = ref<'card' | 'table'>('card')

// Computed
const filteredClients = computed(() => {
  // No filtering - return all clients
  return [...clients.value]
})

const hasMoreClients = computed(() => {
  return currentPage.value < totalPages.value
})

// Methods
const loadClients = async (reset = false) => {
  const params = {
    skip: reset ? 0 : clients.value.length,
    limit: currentLimit.value
  }

  await fetchClients(params)
}

const handleRefresh = async () => {
  clients.value = []
  await loadClients(true)
}

const loadMoreClients = async () => {
  loadingMore.value = true
  await loadClients(false)
  loadingMore.value = false
}

const handleAddClient = () => {
  editingClient.value = null
  showAddClientDialog.value = true
}

const handleEditClient = (client: Client) => {
  editingClient.value = client
  showAddClientDialog.value = true
}

const handleClientAdded = async () => {
  toast.add({
    severity: 'success',
    summary: 'Client Added',
    detail: 'Client has been successfully added.',
    life: 3000
  })

  // Refresh the clients list
  await handleRefresh()

  // Reset dialog state
  showAddClientDialog.value = false
  editingClient.value = null
}

const handleClientUpdated = async () => {
  toast.add({
    severity: 'success',
    summary: 'Client Updated',
    detail: 'Client has been successfully updated.',
    life: 3000
  })

  // Refresh the clients list
  await handleRefresh()

  // Reset dialog state
  showAddClientDialog.value = false
  editingClient.value = null
}

const handleViewClientDetails = (client: Client) => {
  detailsClient.value = client
  showDetailsDialog.value = true
}

const handleDeleteClient = (client: Client) => {
  confirm.require({
    message: `Are you sure you want to delete "${client.first_name} ${client.last_name}"? This action cannot be undone.`,
    header: 'Delete Client',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Cancel',
    acceptLabel: 'Delete',
    rejectClass: 'p-button-secondary p-button-outlined',
    acceptClass: 'p-button-danger',
    accept: async () => {
      const result = await deleteClient(client.id)
      if (result?.success) {
        toast.add({
          severity: 'success',
          summary: 'Client Deleted',
          detail: `${client.first_name} ${client.last_name} has been deleted successfully.`,
          life: 3000
        })
      }
    }
  })
}

const handleActivateClient = async (client: Client) => {
  const result = await activateClient(client.id)
  if (result?.success) {
    toast.add({
      severity: 'success',
      summary: 'Client Activated',
      detail: `${client.first_name} ${client.last_name} has been activated.`,
      life: 3000
    })
  }
}

const handleDeactivateClient = (client: Client) => {
  confirm.require({
    message: `Are you sure you want to deactivate "${client.first_name} ${client.last_name}"?`,
    header: 'Deactivate Client',
    icon: 'pi pi-question-circle',
    rejectLabel: 'Cancel',
    acceptLabel: 'Deactivate',
    rejectClass: 'p-button-secondary p-button-outlined',
    acceptClass: 'p-button-warning',
    accept: async () => {
      const result = await deactivateClient(client.id)
      if (result?.success) {
        toast.add({
          severity: 'success',
          summary: 'Client Deactivated',
          detail: `${client.first_name} ${client.last_name} has been deactivated.`,
          life: 3000
        })
      }
    }
  })
}

// Lifecycle
onMounted(() => {
  loadClients(true)
})
</script>

<style scoped>
/* Custom styles for the clients page */
:deep(.p-inputtext) {
  border-radius: 8px;
}

:deep(.p-dropdown) {
  border-radius: 8px;
}

:deep(.p-button) {
  border-radius: 8px;
}


/* Flexible grid for client cards */
.clients-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 600px) {
  .clients-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

.client-section {
  background-color: var(--app-surface);
  border-color: var(--app-border);
  color: var(--app-text);
  box-shadow: var(--app-card-shadow);
}

.text-muted {
  color: var(--app-text-muted);
}
</style>
