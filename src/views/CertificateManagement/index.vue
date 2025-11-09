<template>
  <div class="p-4">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-medium text-gray-800">Certificate Management</h1>
      <div class="flex gap-3">
        <Button 
          label="Add Certificate Type" 
          icon="pi pi-plus" 
          @click="handleAddCertificateType" 
          severity="secondary"
          outlined
        />
        <Button 
          label="Add Certificate" 
          icon="pi pi-plus" 
          @click="showAddDialog = true" 
          class="bg-primary"
        />
      </div>
    </div>

    <!-- Tabs for different views -->
    <TabView>
      <TabPanel value="0" header="Certificates">
        <template #header>
          <i class="pi pi-file mr-2"></i>
          <span>Certificates</span>
        </template>
        
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
      </TabPanel>
      
      <TabPanel value="1" header="Certificate Types">
        <template #header>
          <i class="pi pi-cog mr-2"></i>
          <span>Certificate Types</span>
        </template>
        <CertificateTypes />
      </TabPanel>
    </TabView>

    <!-- Add Certificate Dialog -->
    <AddCertificateDialog 
      v-model:visible="showAddDialog"
      @certificate-added="handleCertificateAdded"
    />

    <!-- Toast for notifications -->
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Certificate } from './types'
import Button from 'primevue/button'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Toast from 'primevue/toast'
import CertificateList from './components/CertificateList.vue'
import CertificateTypes from './components/CertificateTypes.vue'
import AddCertificateDialog from './components/AddCertificateDialog.vue'
import CertificateWarningBanner from './components/CertificateWarningBanner.vue'

defineOptions({ name: 'CertificateManagementView' })

const showAddDialog = ref(false)

const handleAddCertificateType = () => {
  // Handle adding new certificate type
  console.log('Add new certificate type')
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
