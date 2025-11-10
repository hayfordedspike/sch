<template>
  <Dialog
    v-model:visible="isVisible"
    modal
    :style="{ width: '50rem' }"
    :closable="true"
    @hide="handleClose"
  >
    <template #header>
      <h2 class="text-blue-500 font-bold text-3xl">
        {{ editMode ? 'Edit Certificate' : 'Add Certificate' }}
      </h2>
    </template>

    <div class="flex flex-col gap-4 py-4">
      <!-- First row: Certificate ID and Issuing Organisation -->
      <div class="flex gap-4">
        <div class="flex flex-col gap-2 flex-1">
          <label for="certificateId" class="font-semibold">Certificate ID</label>
          <InputText
            id="certificateId"
            v-model="formData.certificate_id"
            placeholder="Enter certificate ID"
            :class="{ 'p-invalid': errors.certificate_id }"
          />
          <small v-if="errors.certificate_id" class="text-red-500">{{ errors.certificate_id }}</small>
        </div>
        <div class="flex flex-col gap-2 flex-1">
          <label for="issuingOrg" class="font-semibold">Issuing Organisation</label>
          <InputText
            id="issuingOrg"
            v-model="formData.issuing_organisation"
            placeholder="Enter issuing organisation"
            :class="{ 'p-invalid': errors.issuing_organisation }"
          />
          <small v-if="errors.issuing_organisation" class="text-red-500">{{ errors.issuing_organisation }}</small>
        </div>
      </div>

      <!-- Second row: Issue Date and Expiry Date -->
      <div class="flex gap-4">
        <div class="flex flex-col gap-2 flex-1">
          <label for="issueDate" class="font-semibold">Issue Date</label>
          <Calendar
            id="issueDate"
            v-model="formData.issue_date"
            placeholder="Select issue date"
            showIcon
            :class="{ 'p-invalid': errors.issue_date }"
          />
          <small v-if="errors.issue_date" class="text-red-500">{{ errors.issue_date }}</small>
        </div>
        <div class="flex flex-col gap-2 flex-1">
          <label for="expiryDate" class="font-semibold">Expiry Date</label>
          <Calendar
            id="expiryDate"
            v-model="formData.expiry_date"
            placeholder="Select expiry date"
            showIcon
            :class="{ 'p-invalid': errors.expiry_date }"
          />
          <small v-if="errors.expiry_date" class="text-red-500">{{ errors.expiry_date }}</small>
        </div>
      </div>

      <!-- Certificate Type Dropdown -->
      <div class="flex flex-col gap-2">
        <label for="certificateType" class="font-semibold">Certificate Type</label>
        <Dropdown
          id="certificateType"
          v-model="formData.certificate_type"
          :options="certificateTypeOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Select certificate type"
          class="w-full"
          :class="{ 'p-invalid': errors.certificate_type }"
        />
        <small v-if="errors.certificate_type" class="text-red-500">{{ errors.certificate_type }}</small>
      </div>

      <!-- Certificate Item File Upload (Modern Dropzone) -->
      <div class="flex flex-col gap-2">
        <label for="certificateItem" class="font-semibold">Item Certificate</label>
        <div
          class="w-full border-2 border-dashed border-blue-400 rounded-lg flex flex-col items-center justify-center py-8 cursor-pointer hover:border-blue-600 transition relative"
          @dragover.prevent
          @drop.prevent="handleDrop"
          @click="triggerFileInput"
        >
          <input
            ref="fileInputRef"
            type="file"
            id="certificateItem"
            accept=".pdf,.jpg,.jpeg,.png"
            class="hidden"
            multiple
            @change="handleFileChange"
          />
          <div v-if="!formData.certificate_items || formData.certificate_items.length === 0" class="flex flex-col items-center">
            <i class="pi pi-upload text-4xl text-blue-400 mb-2"></i>
            <span class="text-gray-600">Drag your files or <span class="text-blue-500 font-semibold">browse</span></span>
            <span class="text-xs text-gray-400 mt-1">Max 10MB files are allowed</span>
          </div>
          <div v-else class="flex flex-col items-center w-full">
            <div v-for="(file, idx) in formData.certificate_items" :key="idx" class="flex flex-col items-center mb-4 w-full">
              <template v-if="file.type && file.type.startsWith('image/')">
                <img :src="filePreviews[idx]" alt="Preview" class="max-h-32 mb-2 rounded shadow" />
              </template>
              <template v-else>
                <i class="pi pi-file-pdf text-4xl text-red-400 mb-2"></i>
                <span class="text-gray-700">{{ file.name }}</span>
              </template>
              <Button label="Remove" severity="danger" size="small" class="mt-2" @click.stop="removeFile(idx)" />
            </div>
          </div>
        </div>
        <small class="text-gray-500 text-xs">Only support SVG, JPG, And PNG)</small>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button label="Cancel" severity="secondary" @click="handleClose" outlined />
        <Button
          :label="editMode ? 'Update Certificate' : 'Add Certificate'"
          @click="handleSubmit"
          :loading="loading"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { useCertificates } from '@/composables/useCertificates'
import { ref, computed, watch } from 'vue'
import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'

import type { Certificate, CreateCertificateRequest } from '@/types/certificate' // <-- Add this import

interface Props {
  visible: boolean
  certificate?: Certificate | null
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'certificate-added'): void
  (e: 'certificate-updated'): void
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  certificate: null
})

const emit = defineEmits<Emits>()

const { createCertificate, updateCertificate, loading } = useCertificates()

import { ref as vueRef } from 'vue'
const fileInputRef = vueRef<HTMLInputElement | null>(null)

const formData = ref<CreateCertificateRequest & {
  certificate_id?: string
  issuing_organisation?: string
  issue_date?: Date | null
  expiry_date?: Date | null
  certificate_type?: string
  certificate_items?: File[]
}>({
  code: '',
  name: '',
  description: '',
  validity_months: 12,
  renewal_window_days: 30,
  grace_period_days: 7,
  certificate_id: '',
  issuing_organisation: '',
  issue_date: null,
  expiry_date: null,
  certificate_type: '',
  certificate_items: []
})

const filePreviews = ref<string[]>([])

function triggerFileInput() {
  fileInputRef.value?.click()
}

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    formData.value.certificate_items = Array.from(input.files)
    filePreviews.value = formData.value.certificate_items.map(file =>
      file.type.startsWith('image/') ? URL.createObjectURL(file) : ''
    )
  }
}

function handleDrop(event: DragEvent) {
  if (event.dataTransfer && event.dataTransfer.files.length > 0) {
    formData.value.certificate_items = Array.from(event.dataTransfer.files)
    filePreviews.value = formData.value.certificate_items.map(file =>
      file.type.startsWith('image/') ? URL.createObjectURL(file) : ''
    )
  }
}

function removeFile(idx: number) {
  formData.value.certificate_items?.splice(idx, 1)
  filePreviews.value.splice(idx, 1)
}
const certificateTypeOptions = [
  { label: 'Basic Life Support', value: 'bls' },
  { label: 'Advanced Cardiac Life Support', value: 'acls' },
  { label: 'Pediatric Advanced Life Support', value: 'pals' },
  { label: 'First Aid', value: 'firstaid' },
  { label: 'CPR', value: 'cpr' },
  { label: 'Other', value: 'other' }
]

const errors = ref<Record<string, string>>({})

const isVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const editMode = computed(() => !!props.certificate)

// Watch for certificate changes to populate form in edit mode
watch(
  () => props.certificate,
  (newCertificate) => {
    if (newCertificate) {
      formData.value = {
        code: newCertificate.code,
        name: newCertificate.name,
        description: newCertificate.description,
        validity_months: newCertificate.validity_months,
        renewal_window_days: newCertificate.renewal_window_days,
        grace_period_days: newCertificate.grace_period_days
      }
    } else {
      // Reset form for add mode
      formData.value = {
        code: '',
        name: '',
        description: '',
        validity_months: 12,
        renewal_window_days: 30,
        grace_period_days: 7
      }
    }
    errors.value = {}
  },
  { immediate: true }
)

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

  try {
    let result
    if (editMode.value && props.certificate) {
      // Update existing certificate
      result = await updateCertificate(Number(props.certificate.id), formData.value)
      if (result?.success) {
        emit('certificate-updated')
        handleClose() // Close modal after successful update
      } else {
        // Handle update failure case
        console.error('Update failed: operation was not successful')
      }
    } else {
      // Create new certificate
      result = await createCertificate(formData.value)
      if (result) {
        emit('certificate-added')
        handleClose() // Close modal after successful creation
      } else {
        // Handle creation failure case
        console.error('Creation failed: no result returned')
      }
    }
  } catch (error) {
    console.error('Error in handleSubmit:', error)
    // Don't close modal on error, let user see the error and try again
  }
}

const handleClose = () => {
  // Reset form data for both add and edit modes
  formData.value = {
    code: '',
    name: '',
    description: '',
    validity_months: 12,
    renewal_window_days: 30,
    grace_period_days: 7
  }

  // Clear any validation errors
  errors.value = {}

  // Close the modal
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
