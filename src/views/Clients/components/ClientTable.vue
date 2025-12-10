<template>
  <div class="client-table-wrapper">
    <AppTable
      :items="clients"
      :headers="tableHeaders"
      :showMenu="false"
      :showOutline="true"
      :showTotal="true"
      :totalItems="clients.length"
      tableName="Clients"
      @item-click="onView"
    >
      <template #house="{ item }">
        <span class="house-chip">{{ getHouseName(item.item.house_id) }}</span>
      </template>
      <template #status="{ item }">
        <Tag :severity="item.item.is_active ? 'success' : 'danger'" :value="item.item.is_active ? 'Active' : 'Inactive'" class="text-xs font-medium" />
      </template>
      <template #phone="{ item }">
        <i class="pi pi-phone mr-2 text-green-500 w-4"></i>
        {{ formatClientPhone(item.item.phone) }}
      </template>
      <template #email="{ item }">
        <i class="pi pi-envelope mr-2 w-4" style="color: #065986"></i>
        <span class="truncate">{{ item.item.email }}</span>
      </template>
      <template #address="{ item }">
        <i class="pi pi-map-marker mr-2 text-red-500 w-4"></i>
        <span class="truncate">{{ item.item.city }}, {{ item.item.state }}</span>
      </template>
      <template #appointments="{ item }">
        <i class="pi pi-calendar mr-2 text-purple-400 w-4"></i>
        <span class="badge-muted">2 upcoming appointments</span>
      </template>
      <template #menu="{ item }">
        <div class="client-table-actions">
          <GlobalButton icon="pi pi-eye" @click="emit('view', item.item)" class="p-button-rounded p-button-outlined p-button-sm" outlined />
          <GlobalButton icon="pi pi-pencil" @click="emit('edit', item.item)" class="p-button-rounded p-button-outlined p-button-sm" severity="info" outlined />
          <GlobalButton icon="pi pi-trash" @click="emit('delete', item.item)" class="p-button-rounded p-button-outlined p-button-sm" severity="danger" outlined />
          <GlobalButton v-if="!item.item.is_active" icon="pi pi-check" @click="emit('activate', item.item)" class="p-button-rounded p-button-outlined p-button-sm" severity="success" outlined />
          <GlobalButton v-else icon="pi pi-times" @click="emit('deactivate', item.item)" class="p-button-rounded p-button-outlined p-button-sm" severity="warning" outlined />
        </div>
      </template>
    </AppTable>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import AppTable from '@/components/shared/AppTable.vue'
import GlobalButton from '@/components/shared/GlobalButton.vue'
import Tag from 'primevue/tag'

const props = defineProps<{ clients: any[] }>()
const emit = defineEmits(['view', 'edit', 'delete', 'activate', 'deactivate'])

import { useClients } from '@/composables/useClients'
import { useHouses } from '@/composables/useHouses'
const { formatClientPhone } = useClients()
const { houses } = useHouses()
const getHouseName = (houseId) => {
  if (!houseId) return 'No house assigned'
  const house = houses.value.find(h => h.id === houseId)
  return house ? house.name : `House #${houseId}`
}

const tableHeaders = [
  { key: 'first_name', label: 'First Name' },
  { key: 'last_name', label: 'Last Name' },
  { key: 'house', label: 'House' },
  { key: 'status', label: 'Status' },
  { key: 'phone', label: 'Phone' },
  { key: 'email', label: 'Email' },
  { key: 'address', label: 'Address' },
  { key: 'appointments', label: 'Upcoming Appointments' },
  { key: 'menu', label: 'Actions' }
]

function onView(item) {
  emit('view', item.item)
}
</script>

<style scoped>
.client-table-wrapper {
  width: 100%;
  background: var(--app-surface);
  border-radius: 1rem;
  box-shadow: var(--app-card-shadow);
  padding: 1rem;
}

.client-table-actions {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: center;
}
</style>
