<template>
  <Dialog 
    v-model:visible="dialogVisible" 
    :modal="true" 
    header="Manage Team Members"
    :style="{ width: '700px' }"
    :breakpoints="{ '960px': '90vw', '641px': '95vw' }"
    :closable="true"
  >
    <div v-if="team" class="space-y-6">
      <!-- Team Header -->
      <div class="border-b border-gray-200 pb-4">
        <h3 class="text-lg font-semibold text-gray-900">{{ team.name }}</h3>
        <p class="text-sm text-gray-600">Add or remove team members</p>
      </div>

      <!-- Add New Member -->
      <div class="bg-gray-50 p-4 rounded-lg">
        <h4 class="text-md font-medium text-gray-900 mb-3">Add New Member</h4>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <InputNumber
            v-model="newMember.employee_id"
            placeholder="Employee ID"
            :min="1"
            :useGrouping="false"
            class="col-span-1"
          />
          <Dropdown
            v-model="newMember.role"
            :options="roleOptions"
            placeholder="Select Role"
            class="col-span-1"
          />
          <div class="flex items-center col-span-1">
            <Checkbox
              v-model="newMember.is_primary"
              inputId="primary"
              :binary="true"
            />
            <label for="primary" class="ml-2 text-sm">Primary</label>
          </div>
          <Button
            label="Add"
            icon="pi pi-plus"
            @click="handleAddMember"
            :disabled="!canAddMember"
            size="small"
            class="col-span-1"
          />
        </div>
        <small v-if="addMemberError" class="text-red-500 mt-2 block">{{ addMemberError }}</small>
      </div>

      <!-- Current Members -->
      <div>
        <h4 class="text-md font-medium text-gray-900 mb-3">Current Members ({{ currentMembers.length }})</h4>
        
        <div v-if="currentMembers.length === 0" class="text-center py-8">
          <i class="pi pi-users text-gray-300 text-4xl mb-3"></i>
          <p class="text-gray-600">No members in this team yet.</p>
        </div>

        <div v-else class="space-y-3 max-h-64 overflow-y-auto">
          <div
            v-for="member in currentMembers"
            :key="member.id"
            class="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
          >
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <i class="pi pi-user text-purple-600 text-sm"></i>
              </div>
              <div>
                <div class="font-medium text-gray-900">Employee #{{ member.employee_id }}</div>
                <div class="text-sm text-gray-600 flex items-center space-x-2">
                  <Tag
                    :value="member.role"
                    :severity="member.role === 'MANAGER' ? 'info' : 'secondary'"
                    class="text-xs"
                  />
                  <span v-if="member.is_primary" class="text-xs text-green-600">Primary</span>
                  <span class="text-xs text-gray-500">
                    Joined {{ formatDate(member.joined_at) }}
                  </span>
                </div>
              </div>
            </div>
            <div class="flex space-x-2">
              <Button
                icon="pi pi-trash"
                @click="handleRemoveMember(member)"
                severity="danger"
                size="small"
                outlined
                v-tooltip="'Remove Member'"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end space-x-3">
        <Button
          label="Done"
          icon="pi pi-check"
          @click="handleDone"
          class="bg-purple-600 hover:bg-purple-700 border-0 text-white"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTeamsDummy } from '@/composables/useTeamsDummy'
import { useConfirm } from 'primevue/useconfirm'
import Dialog from 'primevue/dialog'
import InputNumber from 'primevue/inputnumber'
import Dropdown from 'primevue/dropdown'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import type { Team, AddTeamMemberRequest, TeamMember } from '@/composables/useTeams'

interface Props {
  visible: boolean
  team?: Team | null
}

interface Emits {
  (e: 'update:visible', visible: boolean): void
  (e: 'members-updated'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const confirm = useConfirm()

const { 
  teamMembers, 
  addTeamMember, 
  removeTeamMember, 
  getTeamMembers
} = useTeamsDummy()

// Form data for new member
const newMember = ref<AddTeamMemberRequest>({
  team_id: 0,
  employee_id: 0,
  role: 'MEMBER',
  is_primary: false
})

const addMemberError = ref('')

const roleOptions = [
  { label: 'Member', value: 'MEMBER' },
  { label: 'Manager', value: 'MANAGER' },
  { label: 'Admin', value: 'ADMIN' }
]

// Computed
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const currentMembers = computed(() => {
  if (!props.team) return []
  return teamMembers.value.filter(member => 
    member.team_id === props.team!.id && member.left_at === null
  )
})

const canAddMember = computed(() => {
  return newMember.value.employee_id > 0 && newMember.value.role
})

// Watch for team changes
watch(
  () => props.team,
  (team) => {
    if (team) {
      newMember.value.team_id = team.id
      // Load team members when dialog opens
      getTeamMembers(team.id)
    }
  },
  { immediate: true }
)

// Helper functions
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const resetNewMemberForm = () => {
  newMember.value = {
    team_id: props.team?.id || 0,
    employee_id: 0,
    role: 'MEMBER',
    is_primary: false
  }
  addMemberError.value = ''
}

// Methods
const handleAddMember = async () => {
  if (!props.team || !canAddMember.value) return

  addMemberError.value = ''

  // Check if member already exists
  const memberExists = currentMembers.value.some(
    member => member.employee_id === newMember.value.employee_id
  )

  if (memberExists) {
    addMemberError.value = 'This employee is already a member of this team'
    return
  }

  try {
    await addTeamMember(props.team.id, newMember.value)
    resetNewMemberForm()
  } catch (error) {
    console.error('Failed to add team member:', error)
    addMemberError.value = 'Failed to add team member. Please try again.'
  }
}

const handleRemoveMember = (member: TeamMember) => {
  if (!props.team) return

  confirm.require({
    message: `Are you sure you want to remove Employee #${member.employee_id} from this team?`,
    header: 'Remove Team Member',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Cancel',
    acceptLabel: 'Remove',
    rejectClass: 'p-button-secondary p-button-outlined',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await removeTeamMember(props.team!.id, member.employee_id)
      } catch (err) {
        console.error('Failed to remove team member:', err)
      }
    }
  })
}

const handleDone = () => {
  emit('members-updated')
  dialogVisible.value = false
}
</script>

<style scoped>
:deep(.p-dialog .p-dialog-header) {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

:deep(.p-dialog .p-dialog-content) {
  padding: 2rem;
}

:deep(.p-dialog .p-dialog-footer) {
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  padding: 1rem 2rem;
}

/* Scrollbar styling */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>