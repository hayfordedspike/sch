<template>
  <Dialog
    v-model:visible="isVisible"
    modal
    :style="{ width: '50rem' }"
    :closable="true"
    @hide="handleClose"
  >
    <template #header>
      <h2 class="text-blue-500 font-bold text-3xl">Add Certificate</h2>
    </template>

    <div class="flex flex-col gap-4 py-4">
      <!-- First row: Certificate Code and Name -->
      <div class="flex gap-4">
        <div class="flex flex-col gap-2 flex-1">
          <label for="code" class="font-semibold">Certificate Code</label>
          <InputText
            id="code"
            v-model="formData.code"
            placeholder="Enter certificate code (e.g., CERT001)"
            :class="{ 'p-invalid': errors.code }"
          />
          <small v-if="errors.code" class="text-red-500">{{ errors.code }}</small>
        </div>

        <div class="flex flex-col gap-2 flex-1">
          <label for="name" class="font-semibold">Certificate Name</label>
          <InputText
            id="name"
            v-model="formData.name"
            placeholder="Enter certificate name"
            :class="{ 'p-invalid': errors.name }"
          />
          <small v-if="errors.name" class="text-red-500">{{ errors.name }}</small>
        </div>
      </div>

      <!-- Description -->
      <div class="flex flex-col gap-2">
        <label for="description" class="font-semibold">Description</label>
        <Textarea
          id="description"
          v-model="formData.description"
          placeholder="Enter certificate description"
          :class="{ 'p-invalid': errors.description }"
          rows="3"
        />
        <small v-if="errors.description" class="text-red-500">{{ errors.description }}</small>
      </div>

      <!-- Second row: Validity Period and Renewal Window -->
      <div class="flex gap-4">
        <div class="flex flex-col gap-2 flex-1">
          <label for="validityMonths" class="font-semibold">Validity Period (Months)</label>
          <InputNumber
            id="validityMonths"
            v-model="formData.validity_months"
            placeholder="Enter validity in months"
            :class="{ 'p-invalid': errors.validity_months }"
            :min="1"
            :max="120"
          />
          <small v-if="errors.validity_months" class="text-red-500">{{ errors.validity_months }}</small>
        </div>

        <div class="flex flex-col gap-2 flex-1">
          <label for="renewalWindowDays" class="font-semibold">Renewal Window (Days)</label>
          <InputNumber
            id="renewalWindowDays"
            v-model="formData.renewal_window_days"
            placeholder="Enter renewal window in days"
            :class="{ 'p-invalid': errors.renewal_window_days }"
            :min="0"
            :max="365"
          />
          <small v-if="errors.renewal_window_days" class="text-red-500">{{ errors.renewal_window_days }}</small>
        </div>
      </div>

      <!-- Grace Period -->
      <div class="flex flex-col gap-2">
        <label for="gracePeriodDays" class="font-semibold">Grace Period (Days)</label>
        <InputNumber
          id="gracePeriodDays"
          v-model="formData.grace_period_days"
          placeholder="Enter grace period in days"
          :class="{ 'p-invalid': errors.grace_period_days }"
          :min="0"
          :max="365"
        />
        <small v-if="errors.grace_period_days" class="text-red-500">{{ errors.grace_period_days }}</small>
        <small class="text-gray-500 text-xs">Grace period allows certificate holders to continue working after expiry</small>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button label="Cancel" severity="secondary" @click="handleClose" outlined />
        <Button
          label="Add Certificate"
          @click="handleSubmit"
          :loading="loading"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCertificates } from '@/composables/useCertificates'
import type { CreateCertificateRequest } from '../types'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import InputNumber from 'primevue/inputnumber'

interface Props {
  visible: boolean
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'certificate-added'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { createCertificate, loading } = useCertificates()

const formData = ref<CreateCertificateRequest>({
  code: '',
  name: '',
  description: '',
  validity_months: 12,
  renewal_window_days: 30,
  grace_period_days: 7
})

const errors = ref<Record<string, string>>({})

const isVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const validateForm = (): boolean => {
  errors.value = {}
  let isValid = true

  if (!formData.value.code || formData.value.code.trim() === '') {
    errors.value.code = 'Certificate code is required'
    isValid = false
  }

  if (!formData.value.name || formData.value.name.trim() === '') {
    errors.value.name = 'Certificate name is required'
    isValid = false
  }

  if (!formData.value.description || formData.value.description.trim() === '') {
    errors.value.description = 'Description is required'
    isValid = false
  }

  if (!formData.value.validity_months || formData.value.validity_months < 1) {
    errors.value.validity_months = 'Validity period must be at least 1 month'
    isValid = false
  }

  if (formData.value.renewal_window_days < 0) {
    errors.value.renewal_window_days = 'Renewal window cannot be negative'
    isValid = false
  }

  if (formData.value.grace_period_days < 0) {
    errors.value.grace_period_days = 'Grace period cannot be negative'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  const result = await createCertificate(formData.value)
  
  if (result) {
    emit('certificate-added')
    handleClose()
  }
}

const handleClose = () => {
  formData.value = {
    code: '',
    name: '',
    description: '',
    validity_months: 12,
    renewal_window_days: 30,
    grace_period_days: 7
  }
  errors.value = {}
  emit('update:visible', false)
}
</script>

<style scoped>
.p-invalid {
  border-color: #ef4444;
}

:deep(.p-dialog-header-close) {
  width: 1.75rem !important;
  height: 1.75rem !important;
  border-radius: 50% !important;
  border: 2px solid #9ca3af !important;
  background: transparent !important;
  color: #6b7280 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0 !important;
}

:deep(.p-dialog-header-close .p-icon) {
  width: 0.75rem !important;
  height: 0.75rem !important;
}

:deep(.p-dialog-header-close:hover) {
  background: #f3f4f6 !important;
  border-color: #6b7280 !important;
  color: #4b5563 !important;
}

:deep(.p-dialog-header-close:focus) {
  box-shadow: none !important;
  border: 2px solid #9ca3af !important;
}

:deep(.p-dialog-header-close:active) {
  border: 2px solid #9ca3af !important;
}
</style>
