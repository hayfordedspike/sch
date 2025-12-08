<template>
  <div class="p-6 bg-white min-h-screen">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-medium text-gray-800">Certificate Management</h1>
      <div class="flex gap-3">
        <GlobalButton 
          label="Add Certificate Type" 
          icon="pi pi-plus" 
          @click="handleAddCertificateType" 
          severity="secondary"
          outlined
        />
        <GlobalButton 
          label="Add Certificate" 
          icon="pi pi-plus" 
          @click="showAddDialog = true" 
          class="bg-primary"
        />
      </div>
    </div>

    <!-- Custom Tab Navigation -->
    <div class="w-full mb-6">
      <div class="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white p-4">
          <div class="inline-flex border-b-2 border-blue-300 relative">
            <button
              @click="activeTabIndex = 0"
              :class="[
                'px-5 py-3 font-medium transition-all duration-200 relative whitespace-nowrap',
                activeTabIndex === 0
                  ? 'text-black font-bold bg-white border-t-2 border-l-2 border-r-2 border-t-blue-300 border-l-blue-300 border-r-blue-300 border-b-2 border-b-white -mb-0.5 z-10'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              ]"
            >
              Certificates
            </button>
            <button
              @click="activeTabIndex = 1"
              :class="[
                'px-5 py-3 font-medium transition-all duration-200 relative whitespace-nowrap',
                activeTabIndex === 1
                  ? 'text-black font-bold bg-white border-t-2 border-l-2 border-r-2 border-t-blue-300 border-l-blue-300 border-r-blue-300 border-b-2 border-b-white -mb-0.5 z-10'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              ]"
            >
              Certificate Types
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="w-full">
      <div class="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200">
          <div v-if="activeTab === 'certificates'" class="p-6">
            <!-- Warning Banner -->
            <CertificateWarningBanner 
              @add-certificate="showAddDialog = true"
              @view-all="handleViewAllExpiring"
            />
            <CertificateList 
              @add-certificate="showAddDialog = true"
              @view-certificate="handleViewCertificate"
              @edit-certificate="handleEditCertificate"
            />
          </div>
          <div v-if="activeTab === 'types'" class="p-6">
            <CertificateTypes />
          </div>
        </div>
      </div>
    </div>

    <!-- Add Certificate Dialog -->
    <AddCertificateDialog 
      v-model:visible="showAddDialog"
      @certificate-added="handleCertificateAdded"
    />

    <!-- Add Certificate Type Dialog -->
    <AddCertificateTypeDialog
      v-model:visible="showAddTypeDialog"
    />

    <!-- Toast for notifications -->
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Certificate } from './types'
import GlobalButton from '@/components/shared/GlobalButton.vue'
import Toast from 'primevue/toast'
import CertificateList from './components/CertificateList.vue'
import CertificateTypes from './components/CertificateTypes.vue'
import AddCertificateDialog from './components/AddCertificateDialog.vue'
import AddCertificateTypeDialog from './components/AddCertificateTypeDialog.vue'
import CertificateWarningBanner from './components/CertificateWarningBanner.vue'

defineOptions({ name: 'CertificateManagementView' })

const showAddDialog = ref(false)
const showAddTypeDialog = ref(false)
const activeTabIndex = ref(0)
const activeTab = computed(() => {
  return activeTabIndex.value === 0 ? 'certificates' : 'types'
})

const handleAddCertificateType = () => {
  showAddTypeDialog.value = true
}

const handleViewCertificate = (certificate: Certificate) => {
  console.log('View certificate:', certificate)
  // Implement view logic here
}

const handleEditCertificate = (certificate: Certificate) => {
  console.log('Edit certificate:', certificate)
  // Implement edit logic here
}

const handleViewAllExpiring = () => {
  console.log('View all expiring certificates')
  // Implement filter/view logic for expiring certificates
}

const handleCertificateAdded = () => {
  // Refresh the certificate list
  console.log('Certificate added successfully')
}
</script>

<style scoped>
:deep(.p-tabview .p-tabview-nav li .p-tabview-nav-link) {
  border: 1px solid transparent;
  border-bottom: 1px solid #dee2e6;
  background: transparent;
  color: #6c757d;
  padding: 1rem 1.5rem;
  font-weight: 500;
  border-top-right-radius: 6px;
  border-top-left-radius: 6px;
  transition: all 0.2s;
  margin: 0 0.125rem -1px 0;
}

:deep(.p-tabview .p-tabview-nav li.p-highlight .p-tabview-nav-link) {
  background: white;
  border-color: #dee2e6 #dee2e6 white #dee2e6;
  color: #495057;
}

:deep(.p-tabview .p-tabview-panels) {
  background: white;
  padding: 1.5rem;
  border: 1px solid #dee2e6;
  border-top: 0;
  border-radius: 0 0 6px 6px;
}
</style>
