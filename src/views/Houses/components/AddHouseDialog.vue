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
        {{ editMode ? 'Edit House' : 'Add New House' }}
      </h2>
    </template>

    <div class="flex flex-col gap-6 py-4">
      <!-- Basic Information Section -->
      <div class="border border-gray-200 rounded-lg p-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <i class="pi pi-home mr-2 text-blue-500"></i>
          House Information
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- House Name -->
          <div class="flex flex-col gap-2 md:col-span-2">
            <label for="houseName" class="font-semibold">House Name *</label>
            <InputText
              id="houseName"
              v-model="formData.name"
              placeholder="Enter house name"
              :class="{ 'p-invalid': errors.name }"
            />
            <small v-if="errors.name" class="text-red-500">{{ errors.name }}</small>
          </div>

          <!-- Address Line 1 -->
          <div class="flex flex-col gap-2 md:col-span-2">
            <label for="addressLine1" class="font-semibold">Address Line 1 *</label>
            <InputText
              id="addressLine1"
              v-model="formData.address_line1"
              placeholder="Enter street address"
              :class="{ 'p-invalid': errors.address_line1 }"
            />
            <small v-if="errors.address_line1" class="text-red-500">{{ errors.address_line1 }}</small>
          </div>

          <!-- City -->
          <div class="flex flex-col gap-2">
            <label for="city" class="font-semibold">City *</label>
            <InputText
              id="city"
              v-model="formData.city"
              placeholder="Enter city"
              :class="{ 'p-invalid': errors.city }"
            />
            <small v-if="errors.city" class="text-red-500">{{ errors.city }}</small>
          </div>

          <!-- Region -->
          <div class="flex flex-col gap-2">
            <label for="region" class="font-semibold">Region *</label>
            <InputText
              id="region"
              v-model="formData.region"
              placeholder="Enter region/state"
              :class="{ 'p-invalid': errors.region }"
            />
            <small v-if="errors.region" class="text-red-500">{{ errors.region }}</small>
          </div>

          <!-- Postal Code -->
          <div class="flex flex-col gap-2">
            <label for="postalCode" class="font-semibold">Postal Code *</label>
            <InputText
              id="postalCode"
              v-model="formData.postal_code"
              placeholder="Enter postal code"
              :class="{ 'p-invalid': errors.postal_code }"
            />
            <small v-if="errors.postal_code" class="text-red-500">{{ errors.postal_code }}</small>
          </div>
        </div>
      </div>

      <!-- Additional Information Section -->
      <div class="border border-gray-200 rounded-lg p-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <i class="pi pi-file-edit mr-2 text-purple-500"></i>
          Additional Information
        </h3>
        
        <div class="grid grid-cols-1 gap-4">
          <!-- Note -->
          <div class="flex flex-col gap-2">
            <label for="note" class="font-semibold">Notes *</label>
            <Textarea
              id="note"
              v-model="formData.note"
              placeholder="Enter any additional notes about this house"
              rows="3"
              :class="{ 'p-invalid': errors.note }"
            />
            <small v-if="errors.note" class="text-red-500">{{ errors.note }}</small>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button label="Cancel" severity="secondary" @click="handleClose" outlined />
        <Button
          :label="editMode ? 'Update House' : 'Add House'"
          @click="handleSubmit"
          :loading="loading"
          icon="pi pi-save"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useHouses } from '@/composables/useHouses'
import type { CreateHouseRequest, House } from '../types'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'

interface Props {
  visible: boolean
  house?: House | null
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'house-added'): void
  (e: 'house-updated'): void
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  house: null
})

const emit = defineEmits<Emits>()

const { createHouse, updateHouse, loading } = useHouses()

const formData = ref<CreateHouseRequest>({
  name: '',
  address_line1: '',
  city: '',
  region: '',
  postal_code: '',
  note: ''
})

const errors = ref<Record<string, string>>({})

const isVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const editMode = computed(() => !!props.house)

// Define resetForm function
const resetForm = () => {
  formData.value = {
    name: '',
    address_line1: '',
    city: '',
    region: '',
    postal_code: '',
    note: ''
  }
}

// Watch for house changes to populate form in edit mode
watch(
  () => props.house,
  (newHouse) => {
    if (newHouse) {
      formData.value = {
        name: newHouse.name,
        address_line1: newHouse.address_line1,
        city: newHouse.city,
        region: newHouse.region,
        postal_code: newHouse.postal_code || '',
        note: newHouse.note || ''
      }
    } else {
      resetForm()
    }
    errors.value = {}
  },
  { immediate: true }
)

const validateForm = (): boolean => {
  errors.value = {}
  let isValid = true

  // Required field validations
  const requiredFields = ['name', 'address_line1', 'city', 'region']

  requiredFields.forEach(field => {
    if (!formData.value[field as keyof CreateHouseRequest] || 
        String(formData.value[field as keyof CreateHouseRequest]).trim() === '') {
      errors.value[field] = `${field.replace('_', ' ')} is required`
      isValid = false
    }
  })

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  try {
    let result
    if (editMode.value && props.house) {
      // Update existing house
      result = await updateHouse(props.house.id, formData.value)
      if (result?.success) {
        emit('house-updated')
        handleClose()
      }
    } else {
      // Create new house
      result = await createHouse(formData.value)
      if (result?.success) {
        emit('house-added')
        handleClose()
      }
    }
  } catch (error) {
    console.error('Error in handleSubmit:', error)
  }
}

const handleClose = () => {
  resetForm()
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

/* Form sections */
.border {
  border-radius: 8px;
}
</style>