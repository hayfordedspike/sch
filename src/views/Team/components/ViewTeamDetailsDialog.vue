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
      <div class="team-details__header">
        <div class="flex items-start justify-between">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">{{ team.name }}</h2>
            <p class="text-muted mt-2">{{ team.description }}</p>
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
        
        <div v-if="membersList.length === 0" class="team-details__empty">
          <i class="pi pi-users text-gray-300 text-4xl mb-3"></i>
          <p class="text-muted">No members assigned to this team yet.</p>
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
            class="team-details__member-row"
          >
            <div class="flex items-center space-x-3">
              <div class="team-details__avatar">
                <i class="pi pi-user text-white text-sm"></i>
              </div>
              <div>
                <div class="font-medium text-gray-900">Employee #{{ member.employee_id }}</div>
                <div class="text-sm text-muted flex items-center space-x-2">
                  <Tag
                    :value="member.role"
                    :severity="member.role === 'MANAGER' ? 'info' : 'secondary'"
                    class="text-xs"
                  />
                  <span v-if="member.is_primary" class="text-xs text-green-600">Primary</span>
                </div>
              </div>
            </div>
            <div class="text-sm text-muted">
              Joined {{ formatDate(member.joined_at) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="field-column">
        <h3 class="field-header">Recent Activity</h3>
        <div class="space-y-3">
          <div class="team-details__activity-card team-details__activity-card--info">
            <i class="pi pi-plus-circle"></i>
            <div>
              <div class="text-sm font-medium">Team created</div>
              <div class="text-xs text-muted">{{ formatDate(team.created_at) }}</div>
            </div>
          </div>
          <div class="team-details__activity-card team-details__activity-card--success">
            <i class="pi pi-users"></i>
            <div>
              <div class="text-sm font-medium">{{ activeMembers }} members active</div>
              <div class="text-xs text-muted">Current team size</div>
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
.team-details__header {
  border-bottom: 1px solid var(--app-border);
  padding-bottom: 1rem;
}

.field-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field-header {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--app-text);
  border-bottom: 1px solid var(--app-border);
  padding-bottom: 0.5rem;
}

.field-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--app-text-muted);
}

.field-content {
  font-size: 0.875rem;
  color: var(--app-text);
}

.team-details__empty {
  text-align: center;
  padding: 2rem 0;
}

.team-details__member-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.9rem 1rem;
  border-radius: 1rem;
  background: var(--app-surface-muted);
  border: 1px solid var(--app-border);
}

.team-details__avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, #a855f7, #6366f1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.team-details__activity-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-radius: 1rem;
  border: 1px solid var(--app-border);
  background: var(--app-surface-muted);
}

.team-details__activity-card--info i {
  color: #38bdf8;
}

.team-details__activity-card--success i {
  color: #34d399;
}

.team-details__member-row i,
.team-details__activity-card i {
  font-size: 1rem;
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

/* Scrollbar styling */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: var(--app-surface-muted);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: var(--app-border);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: var(--app-accent);
}
</style>