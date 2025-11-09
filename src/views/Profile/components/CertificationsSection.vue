<template>
  <Card class="mb-8">
    <template #header>
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 class="text-xl font-semibold text-gray-900 flex items-center">
          <i class="pi pi-verified mr-3 text-green-600"></i>
          My Certifications
        </h2>
        <Button
          @click="$emit('add-certificate')"
          class="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 border-0"
          label="Add Certificate"
          icon="pi pi-plus"
          size="small"
        />
      </div>
    </template>
    
    <template #content>
      <div class="p-6">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <i class="pi pi-spinner pi-spin text-gray-400" style="font-size: 2rem;"></i>
          <p class="text-gray-600 mt-4">Loading certificates...</p>
        </div>

        <!-- Certifications List -->
        <div v-else-if="userCertifications.length > 0" class="space-y-4">
          <div 
            v-for="certification in userCertifications" 
            :key="certification.id"
            class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-300"
          >
            <div class="flex items-center justify-between">
              <!-- Left side: Crown icon + Certificate info -->
              <div class="flex items-center flex-1">
                <!-- Crown icon -->
                <div class="mr-4">
                  <i class="pi pi-crown text-yellow-500" style="font-size: 1.5rem;"></i>
                </div>
                
                <!-- Certificate details -->
                <div class="flex-1">
                  <!-- First line: Name and Status -->
                  <div class="flex items-center mb-1">
                    <h3 class="text-lg font-semibold text-gray-900 mr-3">
                      {{ certification.name }}
                    </h3>
                    <Tag 
                      :severity="getStatusSeverity(getCalculatedStatus(certification))"
                      :value="getStatusLabel(getCalculatedStatus(certification))"
                      class="capitalize rounded-full"
                    />
                  </div>
                  
                  <!-- Second line: Code, Issued, Expires with dots -->
                  <div class="flex items-center text-sm text-gray-600">
                    <span class="font-mono">{{ certification.certificateNumber }}</span>
                    <span class="mx-2">•</span>
                    <span>Issued: {{ formatDate(certification.created_at) }}</span>
                    <span class="mx-2">•</span>
                    <span :class="getExpiryDateColor(getCalculatedStatus(certification))">
                      Expires: {{ formatDate(getCalculatedExpiryDate(certification).toISOString()) }}
                    </span>
                  </div>

                  <!-- Days until expiry for expiring certificates -->
                  <div v-if="getCalculatedStatus(certification) === 'expiring'" class="mt-1">
                    <div class="flex items-center text-xs text-orange-600">
                      <i class="pi pi-exclamation-triangle mr-1"></i>
                      <span>{{ getDaysUntilCalculatedExpiry(certification) }} days until expiry</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right side: Action buttons -->
              <div class="flex space-x-2 ml-4">
                <Button
                  icon="pi pi-pencil"
                  class="p-button-rounded p-button-outlined p-button-sm"
                  @click="editCertificate(certification)"
                  v-tooltip="'Edit Certificate'"
                  severity="info"
                />
                <Button
                  icon="pi pi-trash"
                  class="p-button-rounded p-button-outlined p-button-sm"
                  @click="deleteCertificate(certification)"
                  v-tooltip="'Delete Certificate'"
                  severity="danger"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="!loading" class="text-center py-12">
          <div class="mb-4">
            <i class="pi pi-verified text-gray-300" style="font-size: 4rem;"></i>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No Certifications Yet</h3>
          <p class="text-gray-600 mb-6">
            You haven't added any certifications to your profile yet.
          </p>
          <Button
            @click="$emit('add-certificate')"
            class="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 border-0"
            label="Add Your First Certificate"
            icon="pi pi-plus"
          />
        </div>
      </div>
    </template>
  </Card>

  <!-- Confirmation Dialog -->
  <ConfirmDialog />
</template>

<script setup lang="ts">
import { useConfirm } from 'primevue/useconfirm'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import ConfirmDialog from 'primevue/confirmdialog'
import type { UserCertification } from '../types'

interface Props {
  userCertifications: UserCertification[]
  loading?: boolean
}

interface Emits {
  (e: 'add-certificate'): void
  (e: 'edit-certificate', certification: UserCertification): void
  (e: 'delete-certificate', certification: UserCertification): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const confirm = useConfirm()

// Note: props are used in template (userCertifications, loading)

// Methods
const getStatusSeverity = (status: string) => {
  switch (status) {
    case 'active':
      return 'success'
    case 'expiring':
      return 'warning'
    case 'expired':
      return 'danger'
    default:
      return 'info'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'active':
      return 'Valid'
    case 'expiring':
      return 'Expiring Soon'
    case 'expired':
      return 'Expired'
    default:
      return 'Expired'
  }
}

const getExpiryDateColor = (status: string) => {
  switch (status) {
    case 'expired':
      return 'text-red-600'  // Red for expired
    case 'expiring':
      return 'text-orange-600'  // Orange for expiring soon
    case 'active':
    default:
      return 'text-gray-600'  // Default gray for active/other
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const calculateExpiryDate = (created_at: string, validity_months: number) => {
  const createdDate = new Date(created_at)
  const expiryDate = new Date(createdDate)
  expiryDate.setMonth(createdDate.getMonth() + validity_months)
  return expiryDate
}

const getCalculatedExpiryDate = (certification: UserCertification) => {
  return calculateExpiryDate(certification.created_at, certification.validity_months)
}

const getCalculatedStatus = (certification: UserCertification) => {
  const expiryDate = calculateExpiryDate(certification.created_at, certification.validity_months)
  const today = new Date()
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysUntilExpiry <= 0) {
    return 'expired'
  } else if (daysUntilExpiry <= 30) {
    return 'expiring'
  } else {
    return 'active'
  }
}

const getDaysUntilCalculatedExpiry = (certification: UserCertification) => {
  const expiryDate = calculateExpiryDate(certification.created_at, certification.validity_months)
  const today = new Date()
  const diffTime = expiryDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

const editCertificate = (certification: UserCertification) => {
  emit('edit-certificate', certification)
}

const deleteCertificate = (certification: UserCertification) => {
  confirm.require({
    message: `Are you sure you want to delete this certificate "${certification.name}"?`,
    header: 'Delete Confirmation',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'No, Cancel',
    acceptLabel: 'Yes, Delete',
    rejectClass: 'p-button-secondary p-button-outlined',
    acceptClass: 'p-button-danger',
    accept: () => {
      emit('delete-certificate', certification)
    },
    reject: () => {
      // User cancelled, do nothing
    }
  })
}
</script>

<style scoped>
:deep(.p-card-header) {
  padding: 0;
}

:deep(.p-card-content) {
  padding: 0;
}

/* Hover effects for certification cards */
.border:hover {
  border-color: #d1d5db;
}

/* Tag styling */
:deep(.p-tag) {
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px; /* Fully rounded */
  font-weight: 500;
  border: none;
}

/* Status tag colors with muted backgrounds */
:deep(.p-tag.p-tag-success) {
  background-color: #84cc16; /* Muted lime green */
  color: white;
}

:deep(.p-tag.p-tag-warning) {
  background-color: #f59e0b; /* Muted amber/orange */
  color: white;
}

:deep(.p-tag.p-tag-danger) {
  background-color: #ef4444; /* Muted red */
  color: white;
}

:deep(.p-tag.p-tag-info) {
  background-color: #8b5cf6; /* Muted violet */
  color: white;
}
</style>