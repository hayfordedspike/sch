<script setup lang="ts">
import { ref } from 'vue'
defineOptions({ name: 'DashboardView' })

import CertificateWarningBanner from '../CertificateManagement/components/CertificateWarningBanner.vue'
import AddCertificateDialog from '../CertificateManagement/components/AddCertificateDialog.vue'
import GreetingCard from '@/components/GreetingCard.vue'

const showAddCertificateDialog = ref(false)

const handleAddCertificate = (data: unknown) => {
  console.log('Add certificate:', data)
  // TODO: Call your API to save the certificate
}
</script>

<template>
  <div class="p-4">
    <!-- Dynamic Greeting Card -->
    <GreetingCard />
    
    <!-- Certificate Warning Banner -->
    <CertificateWarningBanner class="mb-6" @add-certificate="showAddCertificateDialog = true" />

    <!-- Rest of dashboard content can go here -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Dashboard widgets/cards will go here -->
    </div>

    <!-- Add Certificate Dialog -->
    <AddCertificateDialog
      v-model:visible="showAddCertificateDialog"
      @submit="handleAddCertificate"
    />
  </div>
</template>

<style scoped>

</style>
