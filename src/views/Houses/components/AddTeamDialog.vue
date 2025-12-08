<template>
  <Dialog
    v-model:visible="isVisible"
    modal
    :style="{ width: '40rem' }"
    :closable="true"
    @hide="handleClose"
  >
    <template #header>
      <h2 class="text-blue-500 font-bold text-2xl">
        Add Team to House
      </h2>
    </template>

    <div class="flex flex-col gap-4 py-4">
      <!-- Team ID -->
      <div class="flex flex-col gap-2">
        <label for="teamId" class="font-semibold">Team ID *</label>
        <InputText
          id="teamId"
          v-model="teamIdInput"
          placeholder="Enter team ID"
          type="number"
          :class="{ 'p-invalid': errors.team_id }"
        />
        <small v-if="errors.team_id" class="text-red-500">{{ errors.team_id }}</small>
      </div>

      <!-- Coverage Notes -->
      <div class="flex flex-col gap-2">
        <label for="coverageNotes" class="font-semibold">Coverage Notes</label>
        <Textarea
          id="coverageNotes"
          v-model="formData.coverage_notes"
          placeholder="Enter coverage notes (optional)"
          rows="3"
          class="app-input"
        />
      </div>

      <!-- Active Status -->
      <div class="flex items-center gap-3">
        <label for="active" class="font-semibold">Active Status</label>
        <Dropdown
          id="active"
          v-model="formData.active"
          :options="statusOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Select status"
        />
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <GlobalButton label="Cancel" @click="handleClose" type="warning" />
        <GlobalButton
          label="Add Team"
          @click="handleSubmit"
          :loading="loading"
          icon="pi pi-save"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useHouses } from '@/composables/useHouses'
import type { CreateHouseTeamRequest } from '../types'
import Dialog from 'primevue/dialog'
import GlobalButton from '@/components/shared/GlobalButton.vue'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Dropdown from 'primevue/dropdown'

interface Props {
  visible: boolean
  houseId?: number
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'team-added'): void
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  houseId: undefined
})

const emit = defineEmits<Emits>()

const { addTeamToHouse, loading } = useHouses()

const teamIdInput = ref('')
const formData = ref<CreateHouseTeamRequest>({
  team_id: 0,
  coverage_notes: '',
  active: true
})

const errors = ref<Record<string, string>>({})

const statusOptions = [
  { label: 'Active', value: true },
  { label: 'Inactive', value: false }
]

const isVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const resetForm = () => {
  teamIdInput.value = ''
  formData.value = {
    team_id: 0,
    coverage_notes: '',
    active: true
  }
}

// Watch for houseId changes - no longer needed since house_id is not in request body
// watch(
//   () => props.houseId,
//   (newHouseId) => {
//     if (newHouseId) {
//       formData.value.house_id = newHouseId
//     }
//   },
//   { immediate: true }
// )

const validateForm = (): boolean => {
  errors.value = {}
  let isValid = true

  // Convert team ID input to number
  const teamId = parseInt(teamIdInput.value)
  formData.value.team_id = teamId

  // Team ID is required
  if (!teamId || teamId <= 0 || isNaN(teamId)) {
    errors.value.team_id = 'Valid team ID is required'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  if (!props.houseId) {
    console.error('House ID is required')
    return
  }

  try {
    const result = await addTeamToHouse(props.houseId, formData.value)
    if (result?.success) {
      emit('team-added')
      handleClose()
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
</style>