<template>
  <Dialog
    v-model:visible="dialogVisible"
    :header="team ? 'Edit My Team' : 'Add My Team'"
    modal
    :style="{ width: '500px' }"
    :closable="true"
  >
    <div class="p-fluid">
      <div class="field mb-4">
        <label for="myTeamName" class="block text-sm font-medium text-muted mb-2">Name</label>
        <InputText
          id="myTeamName"
          v-model="formData.name"
          placeholder="Enter team name"
          class="w-full"
        />
      </div>
      <div class="field mb-4">
        <label for="myTeamDescription" class="block text-sm font-medium text-muted mb-2">Description</label>
        <Textarea
          id="myTeamDescription"
          v-model="formData.description"
          placeholder="Enter team description"
          rows="3"
          class="w-full"
        />
      </div>
      <div class="field mb-4">
        <label for="myTeamManagerId" class="block text-sm font-medium text-muted mb-2">Manager</label>
        <Dropdown
          id="myTeamManagerId"
          v-model="selectedManager"
          :options="employeeOptions"
          option-label="label"
          option-value="value"
          placeholder="Select a manager"
          class="w-full"
          :loading="employeesLoading"
        />
      </div>
    </div>
    <template #footer>
      <Button
        label="Cancel"
        icon="pi pi-times"
        class="p-button-text"
        @click="handleCancel"
      />
      <Button
        label="Save"
        icon="pi pi-check"
        class="p-button-primary"
        @click="handleSave"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import type { Team, CreateTeamRequest, UpdateTeamRequest } from './types'
import { useEmployees } from '@/composables/useEmployees'

interface Props {
  visible: boolean
  team: Team | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'team-added': [team: CreateTeamRequest]
  'team-updated': [team: UpdateTeamRequest]
}>()

const dialogVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value)
})

const formData = ref<CreateTeamRequest>({
  name: '',
  description: '',
  manager_employee_id: 0
})

// Employees logic
const { employees, loading: employeesLoading, getEmployees } = useEmployees()

const selectedManager = ref<number | null>(null)

const employeeOptions = computed(() => {
  return employees.value.map(employee => ({
    label: `${employee.first_name} ${employee.last_name}`,
    value: employee.id
  }))
})

// Watch for selected manager changes
watch(selectedManager, (newValue) => {
  formData.value.manager_employee_id = newValue || 0
})

watch(() => props.team, (newTeam) => {
  if (newTeam) {
    formData.value = {
      name: newTeam.name,
      description: newTeam.description,
      manager_employee_id: newTeam.manager_employee_id
    }
    selectedManager.value = newTeam.manager_employee_id
  } else {
    formData.value = {
      name: '',
      description: '',
      manager_employee_id: 0
    }
    selectedManager.value = null
  }
}, { immediate: true })

// Load employees on mount
onMounted(async () => {
  try {
    await getEmployees()
  } catch (err) {
    console.error('Failed to load employees:', err)
  }
})

const handleCancel = () => {
  emit('update:visible', false)
}

const handleSave = () => {
  if (props.team) {
    // Update existing team
    emit('team-updated', formData.value)
  } else {
    // Add new team
    emit('team-added', formData.value)
  }
}
</script>

<style scoped>
:deep(.p-dialog .p-dialog-header) {
  background: var(--app-surface-muted);
  border-bottom: 1px solid var(--app-border);
}

:deep(.p-dialog .p-dialog-content) {
  background: var(--app-surface);
}

:deep(.p-dialog .p-dialog-footer) {
  background: var(--app-surface-muted);
  border-top: 1px solid var(--app-border);
}

:deep(.p-inputtext),
:deep(.p-dropdown) {
  background: var(--app-input-bg);
  border-color: var(--app-input-border);
  color: var(--app-text);
}

:deep(.p-inputtext:focus),
:deep(.p-dropdown:focus-within) {
  border-color: var(--app-accent);
  box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.35);
}
</style>