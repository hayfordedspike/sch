<template>
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">

    <!-- Header Section: Team Name, Members, Actions -->
    <div class="p-6 border-b border-gray-100">
      <div class="flex flex-col gap-2">
        <h3 class="text-xl font-bold text-gray-900">
          {{ team.name }}
        </h3>
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <div class="text-2xl font-bold text-purple-600">{{ totalMembers }}</div>
            <div class="text-sm text-gray-500">{{ totalMembers === 1 ? 'Member' : 'Members' }}</div>
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
    <div class="p-6 border-b border-gray-100">
      <div class="bg-blue-50 rounded-lg px-4 py-3 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <!-- User Icon -->
          <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <i class="pi pi-user text-white text-sm"></i>
          </div>
          <div>
            <div class="font-semibold text-gray-900">{{ teamLeader.name }}</div>
            <div class="inline-block text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold mt-1">{{ teamLeader.position }}</div>
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
    <div class="p-6">
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
            <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <i class="pi pi-user text-gray-500 text-sm"></i>
            </div>
            <!-- Full Name -->
            <div class="font-medium text-gray-900">Employee #{{ member.employee_id }}</div>
          </div>
          <!-- Role -->
          <div class="text-sm text-gray-500">{{ member.role || 'Member' }}</div>
        </div>

        <!-- View More Link -->
        <div v-if="totalMembers > 4" class="pt-2">
          <button 
            @click.stop="handleViewDetails"
            class="text-blue-600 text-sm font-medium underline hover:text-blue-700 transition-colors"
          >
            View more ({{ totalMembers - 4 }} more)
          </button>
        </div>

        <!-- Empty State -->
        <div v-if="totalMembers === 0" class="text-center py-4">
          <i class="pi pi-users text-gray-300 text-2xl mb-2"></i>
          <p class="text-sm text-gray-500">No members assigned</p>
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
/* Custom styles for the redesigned team card */
</style>