<template>
  <div v-if="showBanner" class="mb-6">
    <Card class="warning-banner" :data-state="bannerState">
      <template #content>
        <div class="flex items-center justify-between">
          <div class="flex items-start gap-4">
            <i class="pi pi-exclamation-triangle text-amber-500 text-2xl mt-1"></i>
            <div>
              <h3 class="banner-title text-lg font-semibold mb-1">{{ bannerTitle }}</h3>
              <p class="banner-message text-sm">{{ bannerMessage }}</p>
              <div v-if="expiringSoon.length > 0" class="mt-2">
                <div class="banner-subtitle text-xs mb-1">Certificates expiring soon:</div>
                <div class="flex flex-wrap gap-1">
                  <span 
                    v-for="cert in expiringSoon.slice(0, 3)" 
                    :key="cert.id"
                    class="inline-flex items-center px-2 py-1 text-xs rounded-full banner-chip"
                  >
                    {{ cert.name }}
                  </span>
                  <span 
                    v-if="expiringSoon.length > 3"
                    class="inline-flex items-center px-2 py-1 text-xs rounded-full banner-chip"
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
import { computed, onMounted } from 'vue'
import { useCertificates } from '@/composables/useCertificates'
import type { Certificate } from '../types'
import Card from 'primevue/card'
import Button from 'primevue/button'

interface Emits {
  (e: 'add-certificate'): void
  (e: 'view-all'): void
}

defineEmits<Emits>()

const { certificates, fetchActiveCertificates } = useCertificates()

onMounted(() => {
  fetchActiveCertificates()
})

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

const bannerState = computed(() => {
  if (certificates.value.length === 0) return 'empty'
  if (expiredCertificates.value.length > 0) return 'expired'
  if (expiringSoon.value.length > 0) return 'warning'
  return 'info'
})

const showBanner = computed(() => {
  return certificates.value.length === 0 || expiredCertificates.value.length > 0 || expiringSoon.value.length > 0
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
:deep(.warning-banner) {
  --banner-bg: rgba(251, 191, 36, 0.18);
  --banner-border: rgba(251, 191, 36, 0.4);
  --banner-chip-bg: rgba(251, 191, 36, 0.18);
  --banner-chip-border: rgba(251, 191, 36, 0.35);
  --banner-chip-text: #92400e;
}

:deep(.warning-banner.p-card) {
  background: var(--banner-bg);
  border: 1px solid var(--banner-border);
  box-shadow: var(--app-card-shadow);
}

:deep(.warning-banner .p-card-content) {
  padding: 1rem 1.5rem;
}

:deep(.warning-banner[data-state='empty']) {
  --banner-bg: rgba(14, 165, 233, 0.15);
  --banner-border: rgba(14, 165, 233, 0.45);
  --banner-chip-bg: rgba(14, 165, 233, 0.18);
  --banner-chip-border: rgba(14, 165, 233, 0.4);
  --banner-chip-text: #0f5e85;
}

:deep(.warning-banner[data-state='expired']) {
  --banner-bg: rgba(248, 113, 113, 0.15);
  --banner-border: rgba(239, 68, 68, 0.45);
  --banner-chip-bg: rgba(248, 113, 113, 0.18);
  --banner-chip-border: rgba(239, 68, 68, 0.4);
  --banner-chip-text: #7f1d1d;
}

:deep(.warning-banner[data-state='warning']) {
  --banner-bg: rgba(251, 191, 36, 0.18);
  --banner-border: rgba(245, 158, 11, 0.45);
  --banner-chip-bg: rgba(251, 191, 36, 0.2);
  --banner-chip-border: rgba(251, 191, 36, 0.45);
  --banner-chip-text: #92400e;
}

:global(html.theme-dark) :deep(.warning-banner),
:global(.theme-dark) :deep(.warning-banner) {
  --banner-bg: rgba(251, 191, 36, 0.12);
  --banner-border: rgba(251, 191, 36, 0.35);
  --banner-chip-bg: rgba(251, 191, 36, 0.15);
  --banner-chip-border: rgba(251, 191, 36, 0.35);
  --banner-chip-text: #fbbf24;
}

:global(html.theme-dark) :deep(.warning-banner[data-state='empty']),
:global(.theme-dark) :deep(.warning-banner[data-state='empty']) {
  --banner-bg: rgba(56, 189, 248, 0.12);
  --banner-border: rgba(56, 189, 248, 0.35);
  --banner-chip-bg: rgba(56, 189, 248, 0.16);
  --banner-chip-border: rgba(56, 189, 248, 0.35);
  --banner-chip-text: #7dd3fc;
}

:global(html.theme-dark) :deep(.warning-banner[data-state='expired']),
:global(.theme-dark) :deep(.warning-banner[data-state='expired']) {
  --banner-bg: rgba(248, 113, 113, 0.12);
  --banner-border: rgba(239, 68, 68, 0.35);
  --banner-chip-bg: rgba(248, 113, 113, 0.15);
  --banner-chip-border: rgba(239, 68, 68, 0.35);
  --banner-chip-text: #fecaca;
}

.banner-title {
  color: var(--app-text);
}

.banner-message {
  color: var(--app-text);
}

.banner-subtitle {
  color: var(--app-text-muted);
}

.banner-chip {
  background: var(--banner-chip-bg);
  color: var(--banner-chip-text);
  border: 1px solid var(--banner-chip-border);
}
</style>
