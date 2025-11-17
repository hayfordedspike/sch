<template>
  <div v-if="showBanner" class="mb-6">
    <Card class="warning-banner">
      <template #content>
        <div class="flex items-center justify-between">
          <div class="flex items-start gap-4">
            <i class="pi pi-exclamation-triangle text-amber-500 text-2xl mt-1"></i>
            <div>
              <h3 class="text-lg font-semibold text-black mb-1">{{ bannerTitle }}</h3>
              <p class="text-black text-sm">{{ bannerMessage }}</p>
              <div v-if="expiringSoon.length > 0" class="mt-2">
                <div class="text-xs text-gray-600 mb-1">Certificates expiring soon:</div>
                <div class="flex flex-wrap gap-1">
                  <span 
                    v-for="cert in expiringSoon.slice(0, 3)" 
                    :key="cert.id"
                    class="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full"
                  >
                    {{ cert.name }}
                  </span>
                  <span 
                    v-if="expiringSoon.length > 3"
                    class="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full"
                  >
                    +{{ expiringSoon.length - 3 }} more
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div class="flex gap-2">
            <Button
              v-if="showViewAllButton"
              label="View All"
              outlined
              severity="warning"
              size="small"
              @click="$emit('view-all')"
            />
            <Button
              label="Add Certificate"
              outlined
              severity="danger"
              size="small"
              @click="$emit('add-certificate')"
            />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCertificates } from '@/composables/useCertificates'
import type { Certificate } from '../types'
import Card from 'primevue/card'
import Button from 'primevue/button'

interface Emits {
  (e: 'add-certificate'): void
  (e: 'view-all'): void
}

defineEmits<Emits>()

const { certificates } = useCertificates()

const expiringSoon = computed(() => 
  certificates.value.filter(cert => {
    if (!cert.expiry_date) return false
    const expiryDate = new Date(cert.expiry_date)
    const now = new Date()
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  })
)

const expiredCertificates = computed(() => 
  certificates.value.filter(cert => {
    const expiryDate = getExpiryDate(cert)
    if (!expiryDate) return false
    return expiryDate < new Date() && cert.status !== 'expired'
  })
)

const getExpiryDate = (certificate: Certificate) => {
  if (!certificate.validity_months) return null
  
  const createdDate = new Date(certificate.created_at)
  const expiryDate = new Date(createdDate)
  expiryDate.setMonth(createdDate.getMonth() + certificate.validity_months)
  
  return expiryDate
}

const showBanner = computed(() => {
  return certificates.value.length === 0
})

const bannerTitle = computed(() => {
  if (certificates.value.length === 0) {
    return 'No certificates found'
  }
  if (expiredCertificates.value.length > 0) {
    return `${expiredCertificates.value.length} certificate(s) expired`
  }
  if (expiringSoon.value.length > 0) {
    return `${expiringSoon.value.length} certificate(s) expiring soon`
  }
  return 'Certificate Issues'
})

const bannerMessage = computed(() => {
  if (certificates.value.length === 0) {
    return 'You haven\'t added any certificates yet. Add your first certificate to get started.'
  }
  if (expiredCertificates.value.length > 0) {
    return 'Some certificates have expired and need immediate attention. Please review and update them.'
  }
  if (expiringSoon.value.length > 0) {
    return 'Some certificates will expire within the next 30 days. Consider renewing them soon.'
  }
  return 'Please review your certificates.'
})

const showViewAllButton = computed(() => {
  return expiringSoon.value.length > 3 || expiredCertificates.value.length > 0
})
</script>

<style scoped>
:deep(.warning-banner .p-card) {
  background-color: #fef3c7;
  border: 1px solid #fde68a;
}

:deep(.warning-banner .p-card-content) {
  padding: 1rem 1.5rem;
}

.warning-banner[data-expired="true"] :deep(.p-card) {
  background-color: #fee2e2;
  border: 1px solid #fecaca;
}

.warning-banner[data-no-certs="true"] :deep(.p-card) {
  background-color: #e0f2fe;
  border: 1px solid #b3e5fc;
}
</style>
