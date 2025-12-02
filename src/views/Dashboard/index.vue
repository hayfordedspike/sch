<script setup lang="ts">
import { ref } from 'vue'
defineOptions({ name: 'DashboardView' })

import CertificateWarningBanner from '../CertificateManagement/components/CertificateWarningBanner.vue'
import AddCertificateDialog from '../CertificateManagement/components/AddCertificateDialog.vue'
import GreetingCard from '@/components/GreetingCard.vue'
import SchedulesCard from '@/components/SchedulesCard.vue'
import FilterCard from '@/components/FilterCard.vue'
import DashboardCalendar from '@/components/DashboardCalendar.vue'


const showAddCertificateDialog = ref(false)

// State for filter controls
const selectedMember = ref<string>('all')
const selectedMonth = ref<number>(new Date().getMonth())

const handleAddCertificate = (data: unknown) => {
  console.log('Add certificate:', data)
  // TODO: Call your API to save the certificate
}
</script>

<template>
  <!-- Dynamic Greeting Card -->
  <GreetingCard class="mb-6" />

  <div class="px-12 md:px-6 py-6 max-w-7xl mx-auto">
        <!-- Certificate Warning Banner -->
    <CertificateWarningBanner class="mb-6" @add-certificate="showAddCertificateDialog = true" />

    <!-- Schedules Card -->
    <SchedulesCard class="mb-6" />

    <!-- Filter Card -->
    <FilterCard
      class="mb-6"
      v-model:selectedFilter="selectedMember"
      v-model:currentDate="selectedMonth"
    />
    <DashboardCalendar
      :selectedMember="selectedMember"
      :selectedMonth="selectedMonth"
    />



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
