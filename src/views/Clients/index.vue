<template>
  <div class="min-h-screen bg-white py-8">
    <!-- Header Section -->
    <div class="w-full mb-8">
      <div class="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white rounded-xl  p-6">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <!-- Title and Stats -->
            <div>
              <h1 class="text-3xl font-bold text-gray-900 flex items-center">
                <i class="pi pi-users mr-3 text-blue-600"></i>
                Client Management
              </h1>
              <p class="text-gray-600 mt-2">
                Manage your clients information and service preferences
              </p>

            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3">
              <Button
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

    <!-- Clients Grid -->
    <div class="w-full">
      <div class="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Loading State -->
        <div v-if="loading && clients.length === 0" class="text-center py-12">
          <i class="pi pi-spinner pi-spin text-gray-400" style="font-size: 2rem;"></i>
          <p class="text-gray-600 mt-4">Loading clients...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="!loading && filteredClients.length === 0" class="text-center py-12">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
            <div class="mb-4">
              <i class="pi pi-users text-gray-300" style="font-size: 4rem;"></i>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No Clients Yet</h3>
            <p class="text-gray-600 mb-6">
              Get started by adding your first client to the system.
            </p>
            <Button
              @click="handleAddClient"
              icon="pi pi-plus"
              label="Add Your First Client"
              class="bg-blue-600 hover:bg-blue-700 border-0 text-white font-semibold py-3 px-6"
            />
          </div>
        </div>

        <!-- Clients Grid -->
        <div v-else class="grid gap-6 clients-grid">
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

        <!-- Load More Button -->
        <div v-if="!loading && filteredClients.length > 0 && hasMoreClients" class="text-center mt-8">
          <Button
            @click="loadMoreClients"
            icon="pi pi-angle-down"
            label="Load More Clients"
            class="p-button-outlined"
            :loading="loadingMore"
          />
        </div>
      </div>
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
import Button from 'primevue/button'
import ConfirmDialog from 'primevue/confirmdialog'
import { ClientCard, AddClientDialog } from './components'
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
  // TODO: Open client details dialog or navigate to details page
  toast.add({
    severity: 'info',
    summary: 'View Details',
    detail: `Detailed view for ${client.first_name} ${client.last_name} coming soon`,
    life: 3000
  })
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
</style>
