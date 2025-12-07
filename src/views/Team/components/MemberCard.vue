<template>
  <Card class="member-card">
    <template #content>
      <div class="p-4">
        <!-- Member Header -->
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <i class="pi pi-user text-blue-600 text-lg"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">{{ memberName }}</h3>
              <p class="text-sm text-gray-600">{{ member.role }}</p>
            </div>
          </div>
          <div class="flex space-x-1">
            <Button
              icon="pi pi-pencil"
              severity="secondary"
              size="small"
              outlined
              rounded
              @click="$emit('edit', member)"
              v-tooltip.top="'Edit Member'"
            />
            <Button
              icon="pi pi-trash"
              severity="danger"
              size="small"
              outlined
              rounded
              @click="$emit('delete', member)"
              v-tooltip.top="'Delete Member'"
            />
          </div>
        </div>

        <!-- Contact Information -->
        <div class="space-y-2 mb-4">
          <div class="flex items-center text-sm text-gray-600">
            <i class="pi pi-users mr-2 text-gray-400"></i>
            <span>{{ teamName }}</span>
          </div>
          <div class="flex items-center text-sm text-gray-600">
            <i class="pi pi-phone mr-2 text-gray-400"></i>
            <span>{{ formattedPhone }}</span>
          </div>
          <div class="flex items-center text-sm text-gray-600">
            <i class="pi pi-circle-fill mr-2 text-xs" :class="memberStatus === 'active' ? 'text-green-500' : 'text-red-500'"></i>
            <span>{{ memberStatus === 'active' ? 'Active' : 'Inactive' }}</span>
          </div>
        </div>

        <!-- Membership Information -->
        <div class="mb-4">
          <div class="flex items-center mb-2">
            <i class="pi pi-calendar mr-2 text-gray-400"></i>
            <span class="text-sm font-medium text-gray-700">Member since</span>
          </div>
          <div class="text-left">
            <div class="text-sm text-gray-600">
              {{ new Date(member.joined_at).toLocaleDateString() }}
            </div>
          </div>
        </div>

        <!-- Role and Primary Status -->
        <div class="pt-3 border-t border-gray-200">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">Role</span>
            <span v-if="member.is_primary" class="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-md font-medium">
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
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  transition-property: box-shadow;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

.member-card:hover {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  border-color: rgb(191 219 254);
}
</style>
