<template>
  <div class="employee-table-wrapper">
    <AppTable
      :items="employees"
      :headers="tableHeaders"
      :showMenu="false"
      :showOutline="true"
      :showTotal="true"
      :totalItems="employees.length"
      tableName="Employees"
      @item-click="onView"
    >
      <template #fullName="{ item }">
        {{ getDisplayInfo(item.item).fullName }}
      </template>
      <template #status="{ item }">
        <Tag :severity="getDisplayInfo(item.item).statusColor" :value="getDisplayInfo(item.item).statusLabel" class="text-xs font-medium" />
      </template>
      <template #phone="{ item }">
        <i class="pi pi-phone mr-2 text-green-500 w-4"></i>
        {{ formatEmployeePhone(item.item.phone) }}
      </template>
      <template #hireDate="{ item }">
        <i class="pi pi-calendar mr-2 w-4" style="color: #065986"></i>
        <span>Hired: {{ getDisplayInfo(item.item).hireDate }}</span>
      </template>
      <template #daysEmployed="{ item }">
        <i class="pi pi-clock mr-2 text-purple-500 w-4"></i>
        <span>{{ getDisplayInfo(item.item).daysEmployed }} days employed</span>
      </template>
      <template #menu="{ item }">
        <div class="employee-table-actions">
          <GlobalButton icon="pi pi-eye" @click="emit('view', item.item)" class="p-button-rounded p-button-outlined p-button-sm" outlined />
          <GlobalButton icon="pi pi-pencil" @click="emit('edit', item.item)" class="p-button-rounded p-button-outlined p-button-sm" severity="info" outlined />
          <GlobalButton icon="pi pi-trash" @click="emit('delete', item.item)" class="p-button-rounded p-button-outlined p-button-sm" severity="danger" outlined />
          <GlobalButton icon="pi pi-sync" @click="emit('change-status', item.item)" class="p-button-rounded p-button-outlined p-button-sm" severity="warning" outlined />
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
import { useEmployees } from '@/composables/useEmployees'

const props = defineProps<{ employees: any[] }>()
const emit = defineEmits(['view', 'edit', 'delete', 'change-status'])

const { formatEmployeePhone, getEmployeeDisplayInfo } = useEmployees()

const tableHeaders = [
  { key: 'fullName', label: 'Full Name' },
  { key: 'status', label: 'Status' },
  { key: 'phone', label: 'Phone' },
  { key: 'hireDate', label: 'Hire Date' },
  { key: 'daysEmployed', label: 'Days Employed' },
  { key: 'menu', label: 'Actions' }
]

function getDisplayInfo(item) {
  try {
    return getEmployeeDisplayInfo(item.item)
  } catch {
    return {
      fullName: 'N/A',
      statusColor: 'secondary',
      statusLabel: 'Unknown',
      hireDate: 'N/A',
      daysEmployed: 'N/A'
    }
  }
}

function getStatusColor(status) {
  return status === 'ACTIVE' ? 'success' : 'danger'
}
function getStatusLabel(status) {
  return status === 'ACTIVE' ? 'Active' : 'Inactive'
}
function getHireDateSafe(item) {
  try {
    const info = getEmployeeDisplayInfo(item.item)
    return info.hireDate || 'N/A'
  } catch {
    return 'N/A'
  }
}
function getDaysEmployedSafe(item) {
  try {
    const info = getEmployeeDisplayInfo(item.item)
    return isNaN(info.daysEmployed) ? 'N/A' : info.daysEmployed
  } catch {
    return 'N/A'
  }
}
function onView(item) {
  emit('view', item.item)
}
</script>

<style scoped>
.employee-table-wrapper {
  width: 100%;
  background: var(--app-surface);
  border-radius: 1rem;
  box-shadow: var(--app-card-shadow);
  padding: 1rem;
}

.employee-table-actions {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: center;
}
</style>
