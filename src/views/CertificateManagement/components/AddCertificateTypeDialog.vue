<template>
  <Dialog
    v-model:visible="isVisible"
    modal
    :style="{ width: '50rem' }"
    :closable="true"
    @hide="handleClose"
  >
    <template #header>
      <h2 class="font-bold text-3xl" style="color: #065986">
        {{ editMode ? 'Edit Certificate Type' : 'Add Certificate Type' }}
      </h2>
    </template>
    <div class="flex flex-col gap-4 py-4">
      <div class="flex flex-col gap-2">
        <label for="typeName" class="font-semibold">Name of Certificate Type</label>
        <InputText
          id="typeName"
          v-model="formData.typeName"
          placeholder="Enter certificate type name"
          :class="{ 'p-invalid': errors.typeName }"
        />
        <small v-if="errors.typeName" class="text-red-500">{{ errors.typeName }}</small>
      </div>

      <div class="flex flex-col gap-2">
        <label for="description" class="font-semibold">Description</label>
        <Textarea
          id="description"
          v-model="formData.description"
          rows="5"
          placeholder="Enter description"
          class="app-input"
          :class="{ 'p-invalid': errors.description }"
        />
        <small v-if="errors.description" class="text-red-500">{{ errors.description }}</small>
      </div>

      <div class="flex flex-col gap-2">
        <label for="code" class="font-semibold">Code</label>
        <InputText
          id="code"
          v-model="formData.code"
          placeholder="Enter code"
          :class="{ 'p-invalid': errors.code }"
        />
        <small v-if="errors.code" class="text-red-500">{{ errors.code }}</small>
      </div>

      <div class="flex gap-4">
        <div class="flex flex-col gap-2 flex-1">
          <label for="validityPeriod" class="font-semibold">Validity Period (months)</label>
          <InputNumber
            id="validityPeriod"
            v-model="formData.validityPeriod"
            placeholder="Enter validity period"
            :min="1"
            :max="120"
            :class="{ 'p-invalid': errors.validityPeriod }"
          />
          <small v-if="errors.validityPeriod" class="text-red-500">{{ errors.validityPeriod }}</small>
        </div>

        <div class="flex flex-col gap-2 flex-1">
          <label for="gracePeriod" class="font-semibold">Grace Period (days)</label>
          <InputNumber
            id="gracePeriod"
            v-model="formData.gracePeriod"
            placeholder="Enter grace period"
            :min="0"
            :max="365"
            :class="{ 'p-invalid': errors.gracePeriod }"
          />
          <small v-if="errors.gracePeriod" class="text-red-500">{{ errors.gracePeriod }}</small>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <GlobalButton label="Cancel" @click="handleClose" type="warning" />
        <GlobalButton
          :label="editMode ? 'Update' : 'Add Certificate Type'"
          @click="handleSubmit"
          :loading="loading"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import Dialog from 'primevue/dialog'
import GlobalButton from '@/components/shared/GlobalButton.vue'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import { useApi } from '@/composables/useApi'

interface CertificateTypeForm {
  code: string
  typeName: string
  validityPeriod: number | null
  gracePeriod: number | null
  description: string
}

interface Props {
  visible: boolean
  certificateType?: {
    id: number
    code: string
    typeName: string
    validityPeriod: number
    gracePeriod: number
    description?: string
  }
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'certificate-type-updated'): void
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  certificateType: undefined
})

const emit = defineEmits<Emits>()

const { post, patch } = useApi()
const loading = ref(false)
const formData = ref<CertificateTypeForm>({
  code: '',
  typeName: '',
  validityPeriod: null,
  gracePeriod: null,
  description: ''
})

const errors = ref<Record<string, string>>({})

const isVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const editMode = computed(() => !!props.certificateType)

// Watch for changes in certificateType prop to populate form in edit mode
watch(
  () => props.certificateType,
  (newValue) => {
    if (newValue) {
      formData.value = {
        code: newValue.code,
        typeName: newValue.typeName,
        validityPeriod: newValue.validityPeriod,
        gracePeriod: newValue.gracePeriod,
        description: newValue.description || ''
      }
    }
  },
  { immediate: true }
)

const validateForm = (): boolean => {
  errors.value = {}
  let isValid = true

  if (!formData.value.code || formData.value.code.trim() === '') {
    errors.value.code = 'Code is required'
    isValid = false
  }

  if (!formData.value.typeName || formData.value.typeName.trim() === '') {
    errors.value.typeName = 'Type name is required'
    isValid = false
  }

  if (!formData.value.validityPeriod || formData.value.validityPeriod <= 0) {
    errors.value.validityPeriod = 'Validity period must be greater than 0'
    isValid = false
  }

  if (formData.value.gracePeriod === null || formData.value.gracePeriod < 0) {
    errors.value.gracePeriod = 'Grace period must be 0 or greater'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true

  try {
    if (editMode.value) {
      const updatePayload = {
        code: formData.value.code,
        name: formData.value.typeName,
        description: formData.value.description,
        validity_months: formData.value.validityPeriod!,
        renewal_window_days: 0,
        grace_period_days: formData.value.gracePeriod!,
        updated_at: new Date().toISOString(),
        active: 'ACTIVE'
      }
      await patch(`/certificates/${props.certificateType!.id}`, updatePayload, {
        showSuccessToast: true,
        successMessage: 'Certificate type updated successfully',
        showErrorToast: true
      })
    } else {
      const createPayload = {
        code: formData.value.code,
        name: formData.value.typeName,
        description: formData.value.description,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        validity_months: formData.value.validityPeriod!,
        renewal_window_days: 0,
        grace_period_days: formData.value.gracePeriod!
      }
      await post('/certificates/', createPayload, {
        showSuccessToast: true,
        successMessage: 'Certificate type created successfully',
        showErrorToast: true
      })
    }
    emit('certificate-type-updated')
    handleClose()
  } catch (error) {
    console.error('Error submitting form:', error)
  } finally {
    loading.value = false
  }
}

const handleClose = () => {
  formData.value = {
    code: '',
    typeName: '',
    validityPeriod: null,
    gracePeriod: null,
    description: ''
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
