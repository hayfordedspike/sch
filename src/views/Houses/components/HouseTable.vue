<template>
  <div class="house-table-wrapper">
    <AppTable
      :items="houses"
      :headers="tableHeaders"
      :showMenu="false"
      :showOutline="true"
      :showTotal="true"
      :totalItems="houses.length"
      tableName="Houses"
    >
      <template #address="{ item }">
        <i class="pi pi-home mr-2 text-blue-500 w-4"></i>
        <span class="truncate">{{ item.item.address_line1 }}</span>
      </template>
      <template #city_region="{ item }">
        <i class="pi pi-map-marker mr-2 text-red-400 w-4"></i>
        <span>{{ item.item.city }}, {{ item.item.region }}</span>
      </template>
      <template #postal_code="{ item }">
        <i class="pi pi-envelope mr-2 text-gray-400"></i>
        <span>{{ item.item.postal_code }}</span>
      </template>
      <template #note="{ item }">
        <i class="pi pi-comment mr-2 text-purple-500"></i>
        <span class="italic text-gray-500">"{{ item.item.note }}"</span>
      </template>
      <template #teams="{ item }">
        <div class="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
          <i class="pi pi-users mr-1"></i>
          <span>0 Teams</span>
        </div>
      </template>
      <template #menu="{ item }">
        <div class="house-table-actions">
          <GlobalButton icon="pi pi-eye" @click="$emit('view-teams', item)" class="p-button-rounded p-button-outlined p-button-sm" outlined />
          <GlobalButton icon="pi pi-pencil" @click="$emit('edit', item)" class="p-button-rounded p-button-outlined p-button-sm" severity="info" outlined />
          <GlobalButton icon="pi pi-trash" @click="$emit('delete', item)" class="p-button-rounded p-button-outlined p-button-sm" severity="danger" outlined />
        </div>
      </template>
    </AppTable>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import AppTable from '@/components/shared/AppTable.vue'
import GlobalButton from '@/components/shared/GlobalButton.vue'

const props = defineProps<{ houses: any[] }>()
const emit = defineEmits(['view-teams', 'edit', 'delete'])

const tableHeaders = [
  { key: 'name', label: 'Name' },
  { key: 'address', label: 'Address' },
  { key: 'city_region', label: 'City/Region' },
  { key: 'postal_code', label: 'Postal Code' },
  { key: 'note', label: 'Note' },
  { key: 'teams', label: 'Teams' },
  { key: 'menu', label: 'Actions' }
]
</script>

<style scoped>
.house-table-wrapper {
  width: 100%;
  background: var(--app-surface);
  border-radius: 1rem;
  box-shadow: var(--app-card-shadow);
  padding: 1rem;
}
.house-table-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-start;
}
:deep(.p-button) {
  border-radius: 8px;
}
</style>
