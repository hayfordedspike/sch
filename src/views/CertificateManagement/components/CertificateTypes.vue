<template>
  <div class="card">
    <h2 class="text-xl font-semibold mb-4">Certificate Types</h2>
  
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-200">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Type Name</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Validity Period</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Grace Period</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(type, idx) in certificateTypes" :key="type.id" :class="idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'">
          <td class="px-6 py-4 whitespace-nowrap">
            <i class="pi pi-crown text-yellow-500 mr-2" />
            {{ type.typeName }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap">{{ type.validityPeriod }} months</td>
          <td class="px-6 py-4 whitespace-nowrap">{{ type.gracePeriod }} days</td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex gap-2">
              <Button icon="pi pi-pencil" rounded outlined severity="info" aria-label="Edit" @click="handleEditType(type)" />
              <Button icon="pi pi-trash" rounded outlined severity="danger" aria-label="Delete" @click="handleDeleteType(type)" />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    
    <AddCertificateTypeDialog
      v-if="showEditTypeModal"
      :visible="showEditTypeModal"
      :certificateType="editingType"
      @update:visible="closeEditTypeModal"
      @certificate-type-updated="closeEditTypeModal"
    />
    <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/30">
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        <div class="flex items-center mb-4">
          <i class="pi pi-exclamation-triangle text-orange-500 text-2xl mr-2" />
          <span class="font-semibold text-lg">Delete Confirmation</span>
        </div>
        <p class="mb-6">{{ typeToDelete ? `Are you sure you want to delete certificate type '${typeToDelete.typeName}'?` : 'Are you sure you want to delete this certificate type?' }}</p>
        <div class="flex justify-end gap-2">
          <button class="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300" @click="cancelDeleteType">Cancel</button>
          <button class="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700" @click="confirmDeleteType">Yes, Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'
import AddCertificateTypeDialog from './AddCertificateTypeDialog.vue'

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

const showEditTypeModal = ref(false)
const editingType = ref<CertificateType | null>(null)
const showDeleteConfirm = ref(false)
const typeToDelete = ref<CertificateType | null>(null)

const handleEditType = (type: CertificateType) => {
  editingType.value = { ...type }
  showEditTypeModal.value = true
}

const closeEditTypeModal = () => {
  showEditTypeModal.value = false
  editingType.value = null
}

const handleDeleteType = (type: CertificateType) => {
  typeToDelete.value = type
  showDeleteConfirm.value = true
}

const confirmDeleteType = () => {
  if (typeToDelete.value) {
    certificateTypes.value = certificateTypes.value.filter(t => t.id !== typeToDelete.value!.id)
  }
  showDeleteConfirm.value = false
  typeToDelete.value = null
}

const cancelDeleteType = () => {
  showDeleteConfirm.value = false
  typeToDelete.value = null
}
</script>

<style scoped>
.p-datatable .p-datatable-header {
  background: transparent;
  border: none;
  padding: 0;
}
</style>
