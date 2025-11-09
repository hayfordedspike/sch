<template>
  <div class="certificate-list p-4">
    <div class="mb-4 flex justify-between items-center">
      <h3 class="text-lg font-semibold">Certificate List</h3>
      <Button 
        label="Add Certificate" 
        icon="pi pi-plus" 
        @click="$emit('add-certificate')"
        class="p-button-primary"
      />
    </div>

    <DataTable 
      :value="certificates" 
      :paginator="true" 
      :rows="10"
      :loading="loading"
      :totalRecords="certificates.length"
      responsiveLayout="scroll"
      class="p-datatable-sm"
    >
      <Column field="code" header="Code" sortable>
        <template #body="slotProps">
          <span class="font-mono text-sm">{{ slotProps.data.code }}</span>
        </template>
      </Column>
      
      <Column field="name" header="Certificate Name" sortable>
        <template #body="slotProps">
          <div>
            <div class="font-medium">{{ slotProps.data.name }}</div>
            <div class="text-sm text-gray-500">{{ slotProps.data.description }}</div>
          </div>
        </template>
      </Column>
      
      <Column field="created_at" header="Created Date" sortable>
        <template #body="slotProps">
          {{ formatCertificateDate(slotProps.data.created_at) }}
        </template>
      </Column>
      
      <Column field="validity_months" header="Validity" sortable>
        <template #body="slotProps">
          <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {{ slotProps.data.validity_months }} months
          </span>
        </template>
      </Column>
      
      <Column header="Expiry Date" sortable>
        <template #body="slotProps">
          <div v-if="getExpiryDate(slotProps.data)">
            <div class="text-sm">{{ formatCertificateDate(getExpiryDate(slotProps.data)!.toISOString()) }}</div>
            <div v-if="isExpiringSoon(slotProps.data)" class="text-xs text-orange-600 font-medium">
              Expires Soon
            </div>
          </div>
          <span v-else class="text-gray-400">N/A</span>
        </template>
      </Column>
      
      <Column field="status" header="Status" sortable>
        <template #body="slotProps">
          <Tag 
            :severity="getCertificateStatusSeverity(slotProps.data.status)"
            class="capitalize"
          >
            {{ slotProps.data.status }}
          </Tag>
        </template>
      </Column>
      
      <Column header="Actions" :exportable="false">
        <template #body="slotProps">
          <div class="flex gap-2">
            <Button 
              icon="pi pi-eye" 
              class="p-button-rounded p-button-outlined p-button-sm" 
              @click="$emit('view-certificate', slotProps.data)"
              v-tooltip="'View Details'"
            />
            <Button 
              icon="pi pi-pencil" 
              class="p-button-rounded p-button-outlined p-button-sm" 
              @click="$emit('edit-certificate', slotProps.data)"
              v-tooltip="'Edit Certificate'"
            />
            <Button 
              icon="pi pi-trash" 
              class="p-button-rounded p-button-outlined p-button-sm p-button-danger" 
              @click="confirmDelete(slotProps.data)"
              v-tooltip="'Delete Certificate'"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- Delete Confirmation Dialog -->
    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import { useCertificates } from '@/composables/useCertificates'
import type { Certificate } from '../types'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import ConfirmDialog from 'primevue/confirmdialog'

// Emits
defineEmits<{
  'add-certificate': []
  'view-certificate': [certificate: Certificate]
  'edit-certificate': [certificate: Certificate]
}>()

// Composables
const confirm = useConfirm()
const { 
  certificates, 
  loading, 
  fetchCertificates, 
  deleteCertificate,
  getCertificateStatusSeverity,
  formatCertificateDate,
  isExpiringSoon,
  getExpiryDate
} = useCertificates()

// Methods
const confirmDelete = (certificate: Certificate) => {
  confirm.require({
    message: `Are you sure you want to delete certificate "${certificate.name}"?`,
    header: 'Delete Confirmation',
    icon: 'pi pi-info-circle',
    rejectLabel: 'Cancel',
    acceptLabel: 'Delete',
    rejectClass: 'p-button-secondary p-button-outlined',
    acceptClass: 'p-button-danger',
    accept: () => {
      deleteCertificate(certificate.id)
    }
  })
}

// Lifecycle
onMounted(() => {
  fetchCertificates()
})
</script>
