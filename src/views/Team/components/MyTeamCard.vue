<template>
  <div class="team-card">
    <div class="flex items-start justify-between mb-4">
      <div class="flex-1">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ team.name }}</h3>
        <p class="text-muted text-sm mb-3">{{ team.description }}</p>
        <div class="text-xs font-semibold text-muted mt-1">

          <span v-if="managerLoading">Loading...</span>
          <span v-else-if="manager" >
            {{ manager.first_name }} {{ manager.last_name }}

          </span>
          <span v-else>Unknown</span>
        </div>
      </div>
      <div class="flex gap-2 ml-4">
        <GlobalButton
          icon="pi pi-pencil"
          rounded
          outlined
          severity="info"
          aria-label="Edit"
          @click="$emit('edit', team)"
          class="p-2"
        />
        <GlobalButton
          icon="pi pi-trash"
          rounded
          outlined
          severity="danger"
          aria-label="Delete"
          @click="$emit('delete', team)"
          class="p-2"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import GlobalButton from '@/components/shared/GlobalButton.vue'
import type { Team } from './types'
import { useEmployees } from '@/composables/useEmployees'
import type { Employee } from '@/views/Employees/types'

interface Props {
  team: Team
}

const props = defineProps<Props>()

defineEmits<{
  edit: [team: Team]
  delete: [team: Team]
}>()

// Manager employee data
const { getEmployee } = useEmployees()
const manager = ref<Employee | null>(null)
const managerLoading = ref(false)

// Fetch manager details
const fetchManager = async (employeeId: number) => {
  if (!employeeId) return

  managerLoading.value = true
  try {
    const employee = await getEmployee(employeeId)
    manager.value = employee || null
  } catch (err) {
    console.error('Failed to fetch manager:', err)
    manager.value = null
  } finally {
    managerLoading.value = false
  }
}

// Watch for team changes and fetch manager
watch(() => props.team?.manager_employee_id, (newId) => {
  if (newId) {
    fetchManager(newId)
  } else {
    manager.value = null
  }
}, { immediate: true })

// Also watch for team prop changes (in case the whole team object changes)
watch(() => props.team, (newTeam) => {
  if (newTeam?.manager_employee_id) {
    fetchManager(newTeam.manager_employee_id)
  } else {
    manager.value = null
  }
}, { immediate: true })
</script>

<style scoped>
.team-card {
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: var(--app-card-shadow);
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.team-card:hover {
  border-color: var(--app-accent);
  transform: translateY(-2px);
}
</style>
