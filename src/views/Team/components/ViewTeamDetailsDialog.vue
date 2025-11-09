<template>
  <Dialog 
    v-model:visible="dialogVisible" 
    :modal="true" 
    header="Team Details"
    :style="{ width: '800px' }"
    :breakpoints="{ '960px': '90vw', '641px': '95vw' }"
    :closable="true"
  >
    <div v-if="team" class="space-y-6">
      <!-- Team Header -->
      <div class="border-b border-gray-200 pb-4">
        <div class="flex items-start justify-between">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">{{ team.name }}</h2>
            <p class="text-gray-600 mt-2">{{ team.description }}</p>
          </div>
          <Tag
            :value="'Active'"
            severity="success"
            class="text-sm"
          />
        </div>
      </div>

      <!-- Team Information -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Basic Information -->
        <div class="field-column">
          <h3 class="field-header">Basic Information</h3>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="field-label">Team ID:</span>
              <span class="field-content">#{{ team.id }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="field-label">Manager ID:</span>
              <span class="field-content">#{{ team.manager_employee_id }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="field-label">Created:</span>
              <span class="field-content">{{ formatDate(team.created_at) }}</span>
            </div>
          </div>
        </div>

        <!-- Team Statistics -->
        <div class="field-column">
          <h3 class="field-header">Team Statistics</h3>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="field-label">Total Members:</span>
              <span class="field-content font-semibold">{{ totalMembers }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="field-label">Active Members:</span>
              <span class="field-content font-semibold text-green-600">{{ activeMembers }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="field-label">Managers:</span>
              <span class="field-content font-semibold text-blue-600">{{ managerCount }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Team Members -->
      <div class="field-column">
        <div class="flex items-center justify-between mb-4">
          <h3 class="field-header">Team Members</h3>
          <Button
            label="Manage Members"
            icon="pi pi-users"
            @click="handleManageMembers"
            size="small"
            outlined
          />
        </div>
        
        <div v-if="membersList.length === 0" class="text-center py-8">
          <i class="pi pi-users text-gray-300 text-4xl mb-3"></i>
          <p class="text-gray-600">No members assigned to this team yet.</p>
          <Button
            label="Add First Member"
            icon="pi pi-plus"
            @click="handleManageMembers"
            class="mt-3"
            size="small"
          />
        </div>

        <div v-else class="space-y-3 max-h-64 overflow-y-auto">
          <div
            v-for="member in membersList"
            :key="member.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
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
                </div>
              </div>
            </div>
            <div class="text-sm text-gray-500">
              Joined {{ formatDate(member.joined_at) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="field-column">
        <h3 class="field-header">Recent Activity</h3>
        <div class="space-y-3">
          <div class="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <i class="pi pi-plus-circle text-blue-600"></i>
            <div>
              <div class="text-sm font-medium">Team created</div>
              <div class="text-xs text-gray-600">{{ formatDate(team.created_at) }}</div>
            </div>
          </div>
          <div class="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <i class="pi pi-users text-green-600"></i>
            <div>
              <div class="text-sm font-medium">{{ activeMembers }} members active</div>
              <div class="text-xs text-gray-600">Current team size</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-between">
        <div>
          <Button
            label="Manage Members"
            icon="pi pi-users"
            @click="handleManageMembers"
            outlined
          />
        </div>
        <div class="flex space-x-3">
          <Button
            label="Edit Team"
            icon="pi pi-pencil"
            @click="handleEdit"
            class="bg-blue-500 hover:bg-blue-600 border-0 text-white"
          />
          <Button
            label="Close"
            icon="pi pi-times"
            @click="handleClose"
            class="p-button-text"
          />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTeamsDummy } from '@/composables/useTeamsDummy'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import type { Team } from '@/composables/useTeams'

interface Props {
  visible: boolean
  team?: Team | null
}

interface Emits {
  (e: 'update:visible', visible: boolean): void
  (e: 'edit', team: Team): void
  (e: 'manage-members', team: Team): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { teamMembers } = useTeamsDummy()

// Computed
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const membersList = computed(() => {
  if (!props.team) return []
  return teamMembers.value.filter(member => 
    member.team_id === props.team!.id && member.left_at === null
  )
})

const totalMembers = computed(() => membersList.value.length)

const activeMembers = computed(() => {
  return membersList.value.filter(member => member.left_at === null).length
})

const managerCount = computed(() => {
  return membersList.value.filter(member => member.role === 'MANAGER').length
})

// Helper functions
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Methods
const handleEdit = () => {
  if (props.team) {
    emit('edit', props.team)
    dialogVisible.value = false
  }
}

const handleManageMembers = () => {
  if (props.team) {
    emit('manage-members', props.team)
    dialogVisible.value = false
  }
}

const handleClose = () => {
  dialogVisible.value = false
}
</script>

<style scoped>
.field-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field-header {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.5rem;
}

.field-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
}

.field-content {
  font-size: 0.875rem;
  color: #111827;
}

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