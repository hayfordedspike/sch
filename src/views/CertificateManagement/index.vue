<template>
  <div class="p-6 bg-white min-h-screen">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-medium text-gray-800">Certificates</h1>
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
        <div class="app-tab-card">
          <div class="app-tab-inline">
            <button
              @click="activeTabIndex = 0"
              :class="['app-tab-button', activeTabIndex === 0 ? 'app-tab-button--active' : 'app-tab-button--inactive']"
            >
              Certificates
            </button>
            <button
              @click="activeTabIndex = 1"
              :class="['app-tab-button', activeTabIndex === 1 ? 'app-tab-button--active' : 'app-tab-button--inactive']"
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
</style>
