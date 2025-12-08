<template>
  <Card class="member-card">
    <template #content>
      <div class="p-4">
        <!-- Member Header -->
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center space-x-3">
            <div class="member-card__avatar">
              <i class="pi pi-user text-white text-lg"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">{{ memberName }}</h3>
              <p class="text-sm text-muted">{{ member.role }}</p>
            </div>
          </div>
          <div class="flex space-x-1">
            <GlobalButton
              icon="pi pi-pencil"
              severity="secondary"
              size="sm"
              outlined
              rounded
              @click="$emit('edit', member)"
              v-tooltip.top="'Edit Member'"
            />
            <GlobalButton
              icon="pi pi-trash"
              severity="danger"
              size="sm"
              outlined
              rounded
              @click="$emit('delete', member)"
              v-tooltip.top="'Delete Member'"
            />
          </div>
        </div>

        <!-- Contact Information -->
        <div class="space-y-2 mb-4">
          <div class="flex items-center text-sm text-muted">
            <i class="pi pi-users mr-2 text-gray-400"></i>
            <span>{{ teamName }}</span>
          </div>
          <div class="flex items-center text-sm text-muted">
            <i class="pi pi-phone mr-2 text-gray-400"></i>
            <span>{{ formattedPhone }}</span>
          </div>
          <div class="flex items-center text-sm text-muted">
            <i class="pi pi-circle-fill mr-2 text-xs" :class="memberStatus === 'active' ? 'text-green-500' : 'text-red-500'"></i>
            <span>{{ memberStatus === 'active' ? 'Active' : 'Inactive' }}</span>
          </div>
        </div>

        <!-- Membership Information -->
        <div class="mb-4">
          <div class="flex items-center mb-2">
            <i class="pi pi-calendar mr-2 text-gray-400"></i>
            <span class="text-sm font-medium text-muted">Member since</span>
          </div>
          <div class="text-left">
            <div class="text-sm text-muted">
              {{ new Date(member.joined_at).toLocaleDateString() }}
            </div>
          </div>
        </div>

        <!-- Role and Primary Status -->
        <div class="member-card__section">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-muted">Role</span>
            <span v-if="member.is_primary" class="member-card__primary">
              Primary
            </span>
          </div>
          <div class="text-left">
            <div class="text-sm font-semibold text-gray-900 capitalize">
              {{ member.role.toLowerCase() }}
            </div>
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { formatInternationalPhone } from '@/lib/phone'
import { useTeams } from '@/composables/useTeams'
import { useEmployees } from '@/composables/useEmployees'
import type { TeamMember } from '@/composables/useTeamMembers'
import type { Team } from '@/composables/useTeams'
import type { Employee } from '@/views/Employees/types'
import GlobalButton from '@/components/shared/GlobalButton.vue'

interface Props {
  member: TeamMember
}

const props = defineProps<Props>()

defineEmits<{
  edit: [member: TeamMember]
  delete: [member: TeamMember]
}>()

// Reactive data for fetched details
const team = ref<Team | null>(null)
const employee = ref<Employee | null>(null)
const loading = ref(true)

// Hooks
const { getTeam } = useTeams()
const { getEmployee: fetchEmployee } = useEmployees()

// Computed properties for display
const memberName = computed(() => {
  if (employee.value) {
    return `${employee.value.first_name} ${employee.value.last_name}`
  }
  return `Employee #${props.member.employee_id}`
})

const teamName = computed(() => {
  return team.value?.name || `Team #${props.member.team_id}`
})

const memberStatus = computed(() => {
  return employee.value?.status === 'ACTIVE' ? 'active' : 'inactive'
})

const formattedPhone = computed(() => {
  if (!employee.value?.phone) {
    return 'No phone number'
  }
  return formatInternationalPhone(employee.value.phone) || 'No phone number'
})

// Load team and employee details
const loadDetails = async () => {
  loading.value = true
  try {
    // Fetch team details
    const teamData = await getTeam(props.member.team_id)
    if (teamData) {
      team.value = teamData
    }

    // Fetch employee details
    const employeeData = await fetchEmployee(props.member.employee_id)
    if (employeeData) {
      employee.value = employeeData
    }
  } catch (err) {
    console.error('Failed to load member details:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDetails()
})
</script>

<style scoped>
.member-card {
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  box-shadow: var(--app-card-shadow);
  border-radius: 1rem;
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.member-card:hover {
  border-color: var(--app-accent);
  transform: translateY(-2px);
}

.member-card__avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 20px rgba(99, 102, 241, 0.35);
}

.member-card__primary {
  padding: 0.15rem 0.6rem;
  border-radius: 0.5rem;
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  font-size: 0.75rem;
  font-weight: 600;
}

.member-card__section {
  border-top: 1px solid var(--app-border);
  padding-top: 0.75rem;
  margin-top: 0.5rem;
}
</style>
