<template>
  <Dialog
    v-model:visible="dialogVisible"
    header="Edit Team Member"
    modal
    :style="{ width: '500px' }"
    :closable="true"
  >
    <div class="p-fluid">
      <div class="field mb-4">
        <label for="teamSelect" class="block text-sm font-medium text-muted mb-2">Team</label>
        <Dropdown
          id="teamSelect"
          v-model="formData.team_id"
          :options="teamOptions"
          option-label="label"
          option-value="value"
          placeholder="Select a team"
          class="w-full"
          :loading="teamsLoading"
        />
      </div>

      <div class="field mb-4">
        <label for="employeeSelect" class="block text-sm font-medium text-muted mb-2">Employee</label>
        <Dropdown
          id="employeeSelect"
          v-model="formData.employee_id"
          :options="employeeOptions"
          option-label="label"
          option-value="value"
          placeholder="Select an employee"
          class="w-full"
          :loading="employeesLoading"
        />
      </div>

      <div class="field mb-4">
        <label for="roleSelect" class="block text-sm font-medium text-muted mb-2">Role</label>
        <Dropdown
          id="roleSelect"
          v-model="formData.role"
          :options="roleOptions"
          option-label="label"
          option-value="value"
          placeholder="Select a role"
          class="w-full"
        />
      </div>

      <div class="field mb-4">
        <div class="flex items-center">
          <Checkbox
            id="isPrimary"
            v-model="formData.is_primary"
            :binary="true"
          />
          <label for="isPrimary" class="ml-2 text-sm font-medium text-muted">Is Primary Member</label>
        </div>
      </div>
    </div>

    <template #footer>
      <GlobalButton
        label="Cancel"
        icon="pi pi-times"
        class="p-button-text"
        @click="handleCancel"
        type="warning"
      />
      <GlobalButton
        label="Update Member"
        icon="pi pi-check"
        class="p-button-primary"
        :loading="submitting"
        @click="handleSave"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import Checkbox from 'primevue/checkbox'
import GlobalButton from '@/components/shared/GlobalButton.vue'
import { useTeams } from '@/composables/useTeams'
import { useEmployees } from '@/composables/useEmployees'
import { useTeamMembers, type TeamMember, type AddTeamMemberRequest } from '@/composables/useTeamMembers'

interface Props {
  visible: boolean
  member?: TeamMember | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'member-updated': [member: TeamMember]
}>()

const dialogVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value)
})

const formData = ref<AddTeamMemberRequest>({
  team_id: 0,
  employee_id: 0,
  role: 'MEMBER',
  is_primary: false
})

const submitting = ref(false)

// Teams logic
const { teams, loading: teamsLoading, getTeams } = useTeams()

const teamOptions = computed(() => {
  return teams.value.map(team => ({
    label: team.name,
    value: team.id
  }))
})

// Employees logic
const { employees, loading: employeesLoading, getEmployees } = useEmployees()

const employeeOptions = computed(() => {
  return employees.value.map(employee => ({
    label: `${employee.first_name} ${employee.last_name}`,
    value: employee.id
  }))
})

// Role options
const roleOptions = [
  { label: 'Lead', value: 'LEAD' },
  { label: 'Member', value: 'MEMBER' },
  { label: 'Trainee', value: 'TRAINEE' }
]

// Team Members logic
const { updateTeamMember } = useTeamMembers()

// Load data on mount
onMounted(async () => {
  try {
    await Promise.all([
      getTeams(),
      getEmployees()
    ])
  } catch (err) {
    console.error('Failed to load data:', err)
  }
})

// Watch for member changes to populate form
watch(() => props.member, (newMember) => {
  if (newMember) {
    formData.value = {
      team_id: newMember.team_id,
      employee_id: newMember.employee_id,
      role: newMember.role,
      is_primary: newMember.is_primary
    }
  }
}, { immediate: true })

const handleCancel = () => {
  emit('update:visible', false)
  // Reset form
  formData.value = {
    team_id: 0,
    employee_id: 0,
    role: 'MEMBER',
    is_primary: false
  }
}

const handleSave = async () => {
  if (!formData.value.team_id || !formData.value.employee_id || !props.member) {
    return
  }

  submitting.value = true
  try {
    const member = await updateTeamMember(
      formData.value.team_id,
      props.member.employee_id,
      {
        team_id: formData.value.team_id,
        employee_id: formData.value.employee_id,
        role: formData.value.role,
        is_primary: formData.value.is_primary
      }
    )

    if (member) {
      emit('member-updated', member)
      handleCancel()
    }
  } catch (err) {
    console.error('Failed to update team member:', err)
  } finally {
    submitting.value = false
  }
}
</script>