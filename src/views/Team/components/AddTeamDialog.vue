<template>
  <Dialog
    v-model:visible="dialogVisible"
    :modal="true"
    :header="isEditing ? 'Edit Team' : 'Create Team Group'"
    :style="{ width: '600px' }"
    :breakpoints="{ '960px': '75vw', '641px': '90vw' }"
    :closable="true"
    @hide="resetForm"
  >
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Group Name -->
      <div class="field">
        <label for="name" class="block text-sm font-medium text-muted mb-2">
          Group Name <span class="text-red-500">*</span>
        </label>
        <InputText
          id="name"
          v-model="formData.name"
          placeholder="Enter group name"
          class="w-full"
          :class="{ 'p-invalid': errors.name }"
          required
        />
        <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
      </div>

      <!-- Team Members Card List -->
      <div class="team-dialog-panel">
        <div class="font-semibold text-gray-900 mb-2">Team Members</div>
        <div v-for="member in allMembers" :key="member.id" class="flex items-center justify-between py-2">
          <div class="flex items-center space-x-3">
            <!-- Checkbox -->
            <input type="checkbox" v-model="selectedMemberIds" :value="member.id" class="form-checkbox h-5 w-5 text-blue-600" />
            <!-- User Icon -->
            <div class="team-dialog-avatar">
              <i class="pi pi-user text-muted text-sm"></i>
            </div>
            <!-- Full Name -->
            <div class="font-medium text-gray-900">{{ member.name }}</div>
          </div>
          <!-- Position -->
          <div class="team-dialog-chip">{{ member.position }}</div>
        </div>
      </div>

      <!-- Assign Team Lead Dropdown -->
      <div class="field">
        <label for="teamLead" class="block text-sm font-medium text-muted mb-2">Assign Team Lead (Optional)</label>
        <select id="teamLead" v-model="selectedTeamLeadId" class="team-select">
          <option value="" disabled>Select team lead</option>
          <option v-for="member in selectedMembers.length ? selectedMembers : allMembers" :key="member.id" :value="member.id">{{ member.name }}</option>
        </select>
      </div>
    </form>

    <template #footer>
      <div class="flex justify-end space-x-3">
        <GlobalButton
          label="Cancel"
          icon="pi pi-times"
          @click="handleCancel"
          class="p-button-text"
          type="warning"
        />
        <GlobalButton
          :label="isEditing ? 'Update Team' : 'Create Team'"
          icon="pi pi-check"
          @click="handleSubmit"
          :loading="loading"
          class="team-primary-action"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTeamsDummy } from '@/composables/useTeamsDummy'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
// ...existing code...
import GlobalButton from '@/components/shared/GlobalButton.vue'
import type { Team } from '@/composables/useTeams'

interface Props {
  visible: boolean
  team?: Team | null
}

interface Emits {
  (e: 'update:visible', visible: boolean): void
  (e: 'team-added'): void
  (e: 'team-updated'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { loading } = useTeamsDummy()

// Form data
const formData = ref<{ name: string }>({
  name: ''
})

// Dummy members list (replace with real data as needed)
const allMembers = ref([
  { id: 1, name: 'Alice Johnson', position: 'Nurse' },
  { id: 2, name: 'Bob Smith', position: 'Caregiver' },
  { id: 3, name: 'Carol Lee', position: 'Therapist' },
  { id: 4, name: 'David Kim', position: 'Manager' },
  { id: 5, name: 'Eva Brown', position: 'Admin' }
])

const selectedMemberIds = ref<number[]>([])
const selectedTeamLeadId = ref<number | null>(null)

const selectedMembers = computed(() => {
  return allMembers.value.filter(m => selectedMemberIds.value.includes(m.id))
})

// Form validation
const errors = ref<Record<string, string>>({})

// Methods
const resetForm = () => {
  formData.value = {
    name: ''
  }
  selectedMemberIds.value = []
  selectedTeamLeadId.value = null
  errors.value = {}
}

const validateForm = (): boolean => {
  errors.value = {}

  if (!formData.value.name.trim()) {
    errors.value.name = 'Group name is required'
  }
  if (selectedMemberIds.value.length === 0) {
    errors.value.members = 'Select at least one team member'
  }
  if (!selectedTeamLeadId.value) {
    errors.value.teamLead = 'Assign a team lead'
  }
  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  // Here you would send { name, members: selectedMemberIds, teamLead: selectedTeamLeadId } to your API
  // For now, just close the dialog and emit
  dialogVisible.value = false
  if (isEditing.value) {
    emit('team-updated')
  } else {
    emit('team-added')
  }
}

const handleCancel = () => {
  dialogVisible.value = false
}

// Computed
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const isEditing = computed(() => !!props.team)

// Watch for team prop changes
watch(
  () => props.team,
  (newTeam) => {
    if (newTeam) {
      formData.value = {
        name: newTeam.name
      }
      // Optionally set selected members and team lead if editing
    } else {
      resetForm()
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.field {
  margin-bottom: 1rem;
}

:deep(.p-inputtext),
:deep(.p-inputnumber-input),
:deep(.p-textarea) {
  border-radius: 8px;
}

:deep(.p-dialog .p-dialog-header) {
  background: var(--app-surface-muted);
  border-bottom: 1px solid var(--app-border);
}

:deep(.p-dialog .p-dialog-content) {
  padding: 2rem;
  background: var(--app-surface);
}

:deep(.p-dialog .p-dialog-footer) {
  background: var(--app-surface-muted);
  border-top: 1px solid var(--app-border);
  padding: 1rem 2rem;
}

.team-dialog-panel {
  border: 1px solid var(--app-border);
  border-radius: 1rem;
  padding: 1.25rem;
  background: var(--app-surface-muted);
}

.team-dialog-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  display: flex;
  align-items: center;
  justify-content: center;
}

.team-dialog-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  color: var(--app-text-muted);
}

.team-select {
  width: 100%;
  padding: 0.6rem 0.75rem;
  border-radius: 0.75rem;
  border: 1px solid var(--app-input-border);
  background: var(--app-input-bg);
  color: var(--app-text);
}

.team-select:focus {
  outline: none;
  border-color: var(--app-accent);
  box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.35);
}
</style>
