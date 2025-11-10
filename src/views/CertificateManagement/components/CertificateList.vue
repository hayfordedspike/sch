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

   
  
      <div class="overflow-x-auto w-full">
        <table class="min-w-full divide-y divide-gray-200 table-auto md:table-fixed">
      <thead class="bg-gray-200">
        <tr>
    
          <th class="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Certificate ID</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Issuing Organisation</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Issue Date</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Expiry Date</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Type</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Item Certificate</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(cert, idx) in certificates" :key="cert.id" :class="idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'">
          <td class="px-4 py-2 whitespace-nowrap">{{ cert.certificate_id || '-' }}</td>
          <td class="px-4 py-2 whitespace-nowrap">{{ cert.issuing_organisation || '-' }}</td>
          <td class="px-4 py-2 whitespace-nowrap">{{ cert.issue_date ? (new Date(cert.issue_date)).toLocaleDateString() : '-' }}</td>
          <td class="px-4 py-2 whitespace-nowrap">{{ cert.expiry_date ? (new Date(cert.expiry_date)).toLocaleDateString() : '-' }}</td>
          <td class="px-4 py-2 whitespace-nowrap">{{ cert.certificate_type || '-' }}</td>
          <td class="px-4 py-2 whitespace-nowrap">
            <span v-if="cert.certificate_items && cert.certificate_items.length">
              <span class="text-blue-600">{{ cert.certificate_items[0].name }}</span>
            </span>
            <span v-else class="text-gray-400">No file</span>
          </td>
          <td class="px-4 py-2 whitespace-nowrap">
            <div class="flex gap-2">
              <Button icon="pi pi-pencil" rounded outlined severity="info" aria-label="Edit" @click="handleEditCertificate(cert)" />
              <Button icon="pi pi-trash" rounded outlined severity="danger" aria-label="Delete" @click="handleDeleteCertificate(cert)" />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
      </div>

    <!-- Custom Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/30">
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        <div class="flex items-center mb-4">
          <i class="pi pi-exclamation-triangle text-orange-500 text-2xl mr-2" />
          <span class="font-semibold text-lg">Delete Confirmation</span>
        </div>
  <p class="mb-6">{{ certificateToDelete ? `Are you sure you want to delete certificate '${certificateToDelete.code}'?` : 'Are you sure you want to delete this certificate?' }}</p>
        <div class="flex justify-end gap-2">
          <button class="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300" @click="cancelDeleteCertificate">Cancel</button>
          <button class="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700" @click="confirmDeleteCertificate">Yes, Delete</button>
        </div>
      </div>
    </div>

    <!-- Preview Dialog -->
    <Dialog v-model:visible="previewModalVisible" modal header="Preview Certificate Item" :style="{ width: '400px' }">
      <!-- Preview modal removed as requested -->
    </Dialog>

    <AddCertificateDialog
  v-if="showEditModal"
  :visible="showEditModal"
  :certificate="editingCertificate ? { ...editingCertificate, id: String(editingCertificate.id) } : undefined"
  @update:visible="closeEditModal"
  @certificate-updated="closeEditModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import AddCertificateDialog from './AddCertificateDialog.vue'

import type { Certificate } from '../types'

// Emits
defineEmits<{
  'add-certificate': []
  'view-certificate': [certificate: Certificate]
  'edit-certificate': [certificate: Certificate]
}>()

// Dummy certificates for development
const certificates = ref<Certificate[]>([
  {
    id: 1,
    code: 'CERT-001',
    name: 'Basic Life Support',
    description: 'BLS for healthcare providers',
    certificate_id: 'BLS-2025',
    issuing_organisation: 'Red Cross',
    issue_date: '2025-01-10',
    expiry_date: '2027-01-10',
    certificate_type: 'bls',
    certificate_items: [new File([""], "bls_certificate.pdf", { type: "application/pdf" })],
    validity_months: 24,
    renewal_window_days: 30,
    grace_period_days: 7,
    status: 'active',
    created_at: '2025-01-10',
    updated_at: '2025-01-10'
  },
  {
    id: 2,
    code: 'CERT-002',
    name: 'CPR',
    description: 'CPR for adults and children',
    certificate_id: 'CPR-2025',
    issuing_organisation: 'American Heart Association',
    issue_date: '2025-02-15',
    expiry_date: '2026-02-15',
    certificate_type: 'cpr',
    certificate_items: [new File([""], "cpr_certificate.pdf", { type: "application/pdf" })],
    validity_months: 12,
    renewal_window_days: 15,
    grace_period_days: 5,
    status: 'active',
    created_at: '2025-02-15',
    updated_at: '2025-02-15'
  }
])

// Dummy delete handler
const showDeleteConfirm = ref(false)
const certificateToDelete = ref<Certificate | null>(null)

const handleDeleteCertificate = (certificate: Certificate) => {
  certificateToDelete.value = certificate
  showDeleteConfirm.value = true
}

const confirmDeleteCertificate = () => {
  if (certificateToDelete.value) {
    certificates.value = certificates.value.filter(c => c.id !== certificateToDelete.value!.id)
  }
  showDeleteConfirm.value = false
  certificateToDelete.value = null
}

const cancelDeleteCertificate = () => {
  showDeleteConfirm.value = false
  certificateToDelete.value = null
}

const previewModalVisible = ref(false)


const showEditModal = ref(false)
const editingCertificate = ref<Certificate | null | undefined>(undefined)

const handleEditCertificate = (certificate: Certificate) => {
  editingCertificate.value = { ...certificate }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editingCertificate.value = null
}
</script>
