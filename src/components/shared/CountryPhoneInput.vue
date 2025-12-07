<template>
  <div class="country-phone-input flex flex-col gap-1">
    <div class="flex gap-2">
      <Dropdown
        v-model="selectedDialCode"
        :options="countryOptions"
        optionLabel="label"
        optionValue="value"
        class="w-40"
        filter
        :disabled="disabled"
      >
        <template #value="slotProps">
          <div v-if="slotProps.value" class="flex flex-col leading-tight">
            <span class="font-semibold">{{ slotProps.value }}</span>
            <small class="text-gray-500">{{ getCountryName(slotProps.value) }}</small>
          </div>
          <span v-else class="text-gray-500">Code</span>
        </template>
        <template #option="{ option }">
          <div class="flex flex-col leading-tight">
            <span class="font-semibold">{{ option.value }}</span>
            <small class="text-gray-500">{{ option.name }}</small>
          </div>
        </template>
      </Dropdown>
      <InputText
        v-model="localNumber"
        type="tel"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="{ 'p-invalid': Boolean(error) }"
        class="flex-1"
      />
    </div>
    <small v-if="error" class="text-red-500">{{ error }}</small>
    <small v-else-if="helpText" class="text-gray-500">{{ helpText }}</small>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import { COUNTRIES } from '@/constants/countries'
import { sanitizeDialCode, sanitizeNationalNumber } from '@/lib/phone'

interface Props {
  modelValue?: string
  countryDialCode?: string
  placeholder?: string
  disabled?: boolean
  error?: string
  helpText?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  countryDialCode: '',
  placeholder: 'Enter phone number',
  disabled: false,
  error: '',
  helpText: ''
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'update:countryDialCode', value: string): void
}>()

const countryOptions = computed(() =>
  COUNTRIES.map(country => ({
    label: `${country.name} ${country.dial_code}`,
    value: country.dial_code,
    name: country.name
  }))
)

const selectedDialCode = ref(sanitizeDialCode(props.countryDialCode))
const localNumber = ref(sanitizeNationalNumber(props.modelValue))

const getCountryName = (dialCode: string) => {
  const match = COUNTRIES.find(country => country.dial_code === dialCode)
  return match?.name || 'Select country'
}

watch(
  () => props.countryDialCode,
  (newVal) => {
    const normalized = sanitizeDialCode(newVal)
    if (normalized !== selectedDialCode.value) {
      selectedDialCode.value = normalized
    }
  }
)

watch(
  () => props.modelValue,
  (newVal) => {
    const sanitized = sanitizeNationalNumber(newVal)
    if (sanitized !== localNumber.value) {
      localNumber.value = sanitized
    }
  }
)

watch(selectedDialCode, (newVal, oldVal) => {
  const normalized = sanitizeDialCode(newVal)
  if (normalized !== newVal) {
    selectedDialCode.value = normalized
    return
  }
  if (normalized !== oldVal) {
    emit('update:countryDialCode', normalized)
  }
})

watch(localNumber, (newVal, oldVal) => {
  const sanitized = sanitizeNationalNumber(newVal)
  if (sanitized !== newVal) {
    localNumber.value = sanitized
    return
  }
  if (sanitized !== oldVal) {
    emit('update:modelValue', sanitized)
  }
})
</script>

<style scoped>
.country-phone-input :deep(.p-dropdown) {
  min-width: 150px;
}
</style>
