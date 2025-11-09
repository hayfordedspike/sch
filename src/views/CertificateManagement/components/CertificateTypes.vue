<template>
  <div class="card">
    <h2 class="text-xl font-semibold mb-4">Certificate Types</h2>
    <DataTable :value="certificateTypes" :paginator="true" :rows="10" stripedRows>
      <Column field="typeName" header="Type Name" sortable></Column>
      <Column field="validityPeriod" header="Validity Period" sortable>
        <template #body="slotProps">
          {{ slotProps.data.validityPeriod }} months
        </template>
      </Column>
      <Column field="gracePeriod" header="Grace Period" sortable>
        <template #body="slotProps">
          {{ slotProps.data.gracePeriod }} days
        </template>
      </Column>
      <Column header="Actions">
        <template #body>
          <div class="flex gap-2">
            <Button icon="pi pi-pencil" rounded outlined severity="info" aria-label="Edit" />
            <Button icon="pi pi-trash" rounded outlined severity="danger" aria-label="Delete" />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'

interface CertificateType {
  id: number
  typeName: string
  validityPeriod: number // in months
  gracePeriod: number // in days
}

// Sample data - replace with actual data from your API
const certificateTypes = ref<CertificateType[]>([
  {
    id: 1,
    typeName: 'First Aid',
    validityPeriod: 24,
    gracePeriod: 30
  },
  {
    id: 2,
    typeName: 'CPR',
    validityPeriod: 12,
    gracePeriod: 15
  }
])
</script>

<style scoped>
.p-datatable .p-datatable-header {
  background: transparent;
  border: none;
  padding: 0;
}
</style>
