<template>
  <div class="team-card team-card--stacked">

    <!-- Header Section: Team Name, Members, Actions -->
    <div class="team-section team-section--header">
      <div class="flex flex-col gap-2">
        <h3 class="text-xl font-bold text-gray-900">
          {{ team.name }}
        </h3>
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <div class="text-2xl font-bold text-purple-600">{{ totalMembers }}</div>
            <div class="text-sm text-muted">{{ totalMembers === 1 ? 'Member' : 'Members' }}</div>
          </div>
          <div class="flex space-x-2">
            <Button
              icon="pi pi-pencil"
              class="p-button-sm p-button-outlined"
              @click.stop="handleEdit"
              v-tooltip="'Edit Team'"
              severity="info"
            />
            <Button
              icon="pi pi-trash"
              class="p-button-sm p-button-outlined"
              @click.stop="handleDelete"
              v-tooltip="'Delete Team'"
              severity="danger"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Team Leader Section (Carded) -->
    <div class="team-section team-section--header">
      <div class="team-lead-banner">
        <div class="flex items-center space-x-3">
          <!-- User Icon -->
          <div class="team-lead-avatar">
            <i class="pi pi-user text-white text-sm"></i>
          </div>
          <div>
            <div class="font-semibold text-gray-900">{{ teamLeader.name }}</div>
            <div class="team-lead-role">{{ teamLeader.position }}</div>
          </div>
        </div>
        <!-- Certificate Badge (Image) -->
        <div class="flex items-center">
          <div class="w-8 h-8 rounded-full overflow-hidden">
            <img 
              src="@/assets/cert.jpg" 
              alt="Certified" 
              class="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Team Members Section -->
    <div class="team-section">
      <h4 class="font-semibold text-gray-900 mb-4">Team Members</h4>
      <div class="space-y-3">
        <!-- Display up to 4 members -->
        <div
          v-for="member in displayMembers"
          :key="member.id"
          class="flex items-center justify-between"
        >
          <div class="flex items-center space-x-3">
            <!-- User Icon -->
            <div class="team-avatar">
              <i class="pi pi-user text-muted text-sm"></i>
            </div>
            <!-- Full Name -->
            <div class="font-medium text-gray-900">Employee #{{ member.employee_id }}</div>
          </div>
          <!-- Role -->
          <div class="text-sm text-muted">{{ member.role || 'Member' }}</div>
        </div>

        <!-- View More Link -->
        <div v-if="totalMembers > 4" class="pt-2">
          <button 
            @click.stop="handleViewDetails"
            class="team-link"
          >
            View more ({{ totalMembers - 4 }} more)
          </button>
        </div>

        <!-- Empty State -->
        <div v-if="totalMembers === 0" class="text-center py-4">
          <i class="pi pi-users text-gray-300 text-2xl mb-2"></i>
          <p class="text-sm text-muted">No members assigned</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTeamsDummy } from '@/composables/useTeamsDummy'
import Button from 'primevue/button'
import type { Team } from '@/composables/useTeams'

interface Props {
  team: Team
}

interface Emits {
  (e: 'edit', team: Team): void
  (e: 'delete', team: Team): void
  (e: 'view-details', team: Team): void
  (e: 'manage-members', team: Team): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { teamMembers } = useTeamsDummy()

// Computed properties for the new design
const activeTeamMembers = computed(() => {
  return teamMembers.value.filter(member => 
    member.team_id === props.team.id && member.left_at === null
  )
})

const totalMembers = computed(() => activeTeamMembers.value.length)

const teamLeader = computed(() => {
  // Find the team leader/manager from the members
  const leader = activeTeamMembers.value.find(member => 
    member.role === 'MANAGER' || member.role === 'ADMIN'
  )
  
  return leader ? {
    name: `Employee #${leader.employee_id}`,
    position: leader.role === 'MANAGER' ? 'Team Manager' : 'Team Admin'
  } : {
    name: 'No Team Lead',
    position: 'Unassigned'
  }
})

const displayMembers = computed(() => {
  return activeTeamMembers.value.slice(0, 4)
})

// Methods
const handleEdit = () => {
  emit('edit', props.team)
}

const handleDelete = () => {
  emit('delete', props.team)
}

const handleViewDetails = () => {
  emit('view-details', props.team)
}

</script>

<style scoped>
.team-card {
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 1.5rem;
  box-shadow: var(--app-card-shadow);
  overflow: hidden;
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.team-card:hover {
  border-color: var(--app-accent);
  transform: translateY(-2px);
}

.team-section {
  padding: 1.5rem;
}

.team-section--header {
  border-bottom: 1px solid var(--app-border);
}

.team-lead-banner {
  background: var(--app-surface-muted);
  border-radius: 1rem;
  padding: 1rem 1.25rem;
  border: 1px solid var(--app-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.team-lead-avatar {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  display: flex;
  align-items: center;
  justify-content: center;
}

.team-lead-role {
  display: inline-block;
  padding: 0.25rem 0.9rem;
  border-radius: 9999px;
  background: rgba(34, 197, 94, 0.12);
  color: #22c55e;
  font-size: 0.75rem;
  font-weight: 600;
}

.team-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  background: var(--app-surface-muted);
  border: 1px solid var(--app-border);
  display: flex;
  align-items: center;
  justify-content: center;
}

.team-link {
  color: var(--app-accent);
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: underline;
  transition: color 0.2s ease;
}

.team-link:hover {
  color: var(--app-text);
}
</style>