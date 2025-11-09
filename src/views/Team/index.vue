<template>
  <div class="min-h-screen bg-white py-8">
    <!-- Header Section -->
    <div class="w-full mb-8">
      <div class="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white rounded-xl p-6">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <!-- Title and Stats -->
            <div>
              <h1 class="text-3xl font-bold text-gray-900 flex items-center">
                <i class="pi pi-users mr-3 text-purple-600"></i>
                Team Management
              </h1>
              <p class="text-gray-600 mt-2">
                Manage your team members, roles and availability
              </p>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3">
              <Button
                v-if="activeTab === 'members'"
                @click="handleAddMember"
                icon="pi pi-user-plus"
                label="Add New Member"
                class="bg-purple-600 hover:bg-purple-700 border-0 text-white"
              />
              <Button
                v-if="activeTab === 'teams'"
                @click="handleAddTeam"
                icon="pi pi-plus"
                label="Create Team Group"
                class="bg-purple-600 hover:bg-purple-700 border-0 text-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs Navigation -->
    <div class="w-full mb-6">
      <div class="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white p-4">
          <!-- Custom Tab Navigation -->
          <div class="inline-flex border-b-2 border-blue-300 relative">
            <button
              @click="activeTabIndex = 0"
              :class="[
                'px-5 py-3 font-medium transition-all duration-200 relative whitespace-nowrap',
                activeTabIndex === 0
                  ? 'text-black font-bold bg-white border-t-2 border-l-2 border-r-2 border-t-blue-300 border-l-blue-300 border-r-blue-300 border-b-2 border-b-white -mb-0.5 z-10'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              ]"
            >
              Members
            </button>
            <button
              @click="activeTabIndex = 1"
              :class="[
                'px-5 py-3 font-medium transition-all duration-200 relative whitespace-nowrap',
                activeTabIndex === 1
                  ? 'text-black font-bold bg-white border-t-2 border-l-2 border-r-2 border-t-blue-300 border-l-blue-300 border-r-blue-300 border-b-2 border-b-white -mb-0.5 z-10'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              ]"
            >
              Grouped Teams
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Section -->
    <div class="w-full">
      <div class="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200">
          <!-- Members Content -->
          <div v-if="activeTab === 'members'" class="p-6">
            <!-- Loading State -->
            <div v-if="loading && members.length === 0" class="text-center py-12">
              <i class="pi pi-spinner pi-spin text-gray-400" style="font-size: 2rem;"></i>
              <p class="text-gray-600 mt-4">Loading members...</p>
            </div>

            <!-- Empty State -->
            <div v-else-if="!loading && filteredMembers.length === 0" class="text-center py-12">
              <div class="bg-gray-50 rounded-xl p-12">
                <div class="mb-4">
                  <i class="pi pi-user text-gray-300" style="font-size: 4rem;"></i>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">No Members Yet</h3>
                <p class="text-gray-600 mb-6">
                  Get started by adding your first team member.
                </p>
                <Button
                  @click="handleAddMember"
                  icon="pi pi-user-plus"
                  label="Add Your First Member"
                  class="bg-purple-600 hover:bg-purple-700 border-0 text-white font-semibold py-3 px-6"
                />
              </div>
            </div>

            <!-- Members Grid -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <MemberCard
                v-for="member in filteredMembers"
                :key="member.id"
                :member="member"
                @edit="handleEditMember"
                @delete="handleDeleteMember"
                @view-details="handleViewMemberDetails"
              />
            </div>
          </div>

          <!-- Teams Content -->
          <div v-if="activeTab === 'teams'" class="p-6">
            <!-- Loading State -->
            <div v-if="loading && teams.length === 0" class="text-center py-12">
              <i class="pi pi-spinner pi-spin text-gray-400" style="font-size: 2rem;"></i>
              <p class="text-gray-600 mt-4">Loading teams...</p>
            </div>

            <!-- Empty State -->
            <div v-else-if="!loading && filteredTeams.length === 0" class="text-center py-12">
              <div class="bg-gray-50 rounded-xl p-12">
                <div class="mb-4">
                  <i class="pi pi-users text-gray-300" style="font-size: 4rem;"></i>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">No Teams Yet</h3>
                <p class="text-gray-600 mb-6">
                  Get started by creating your first team to organize your workforce.
                </p>
                <Button
                  @click="handleAddTeam"
                  icon="pi pi-plus"
                  label="Create Your First Team"
                  class="bg-purple-600 hover:bg-purple-700 border-0 text-white font-semibold py-3 px-6"
                />
              </div>
            </div>

            <!-- Teams Grid -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <TeamCard
                v-for="team in filteredTeams"
                :key="team.id"
                :team="team"
                @edit="handleEditTeam"
                @delete="handleDeleteTeam"
                @view-details="handleViewTeamDetails"
                @manage-members="handleManageMembers"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Team Dialog -->
    <AddTeamDialog
      v-model:visible="showAddTeamDialog"
      :team="editingTeam"
      @team-added="handleTeamAdded"
      @team-updated="handleTeamUpdated"
    />

    <!-- Add/Edit Member Dialog -->
    <AddMemberDialog
      v-model:visible="showAddMemberDialog"
      :member="editingMember"
      @member-added="handleMemberAdded"
      @member-updated="handleMemberUpdated"
    />

    <!-- Team Details Dialog -->
    <ViewTeamDetailsDialog
      v-model:visible="showTeamDetailsDialog"
      :team="selectedTeam"
      @edit="handleEditTeam"
      @manage-members="handleManageMembers"
    />

    <!-- Manage Members Dialog -->
    <ManageTeamMembersDialog
      v-model:visible="showManageMembersDialog"
      :team="selectedTeam"
      @members-updated="handleMembersUpdated"
    />

    <!-- Confirmation Dialog -->
    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { useTeamsDummy } from '@/composables/useTeamsDummy'
import Button from 'primevue/button'
import ConfirmDialog from 'primevue/confirmdialog'
import { TeamCard, MemberCard, AddTeamDialog, AddMemberDialog, ViewTeamDetailsDialog, ManageTeamMembersDialog } from './components/index'
import type { Team } from '@/composables/useTeams'

// Simplified member interface for UI display
interface MemberDisplay {
  id: number
  name: string
  email: string
  phone?: string
  address?: string
  role: string
  status: 'active' | 'inactive'
  schedule?: string[]
  hourlyRate?: number
  teams?: Array<{ id: number; name: string }>
}

// Interface for member form data (matching AddMemberDialog)
interface MemberFormData {
  name: string
  email: string
  phone: string
  address: string
  availability: string[]
  notes: string
}

defineOptions({ name: 'TeamView' })

const confirm = useConfirm()
const toast = useToast()

const {
  teams,
  loading,
  getTeams,
  deleteTeam
} = useTeamsDummy()

// Dummy member data for display (transformed from team member data)
const dummyMembers = ref<MemberDisplay[]>([
  {
    id: 1,
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@healthcenter.com',
    phone: '+1 (555) 123-4567',
    address: '123 Medical Plaza, Suite 200, City, State 12345',
    role: 'Primary Care Physician',
    status: 'active',
    schedule: ['Mon', 'Tue', 'Wed', 'Thu'],
    hourlyRate: 85,
    teams: [{ id: 1, name: 'Care Team Alpha' }, { id: 2, name: 'Medical Support' }]
  },
  {
    id: 2,
    name: 'Nurse Emily Rodriguez',
    email: 'emily.rodriguez@healthcenter.com',
    phone: '+1 (555) 234-5678',
    address: '456 Healthcare Ave, Unit 15, City, State 12345',
    role: 'Registered Nurse',
    status: 'active',
    schedule: ['Mon', 'Tue', 'Wed', 'Fri'],
    hourlyRate: 45,
    teams: [{ id: 1, name: 'Care Team Alpha' }]
  },
  {
    id: 3,
    name: 'Mike Chen',
    email: 'mike.chen@healthcenter.com',
    phone: '+1 (555) 345-6789',
    address: '789 Wellness Blvd, Apt 3B, City, State 12345',
    role: 'Medical Assistant',
    status: 'active',
    schedule: ['Tue', 'Wed', 'Thu', 'Fri'],
    hourlyRate: 22,
    teams: [{ id: 2, name: 'Medical Support' }]
  },
  {
    id: 4,
    name: 'Dr. Lisa Parker',
    email: 'lisa.parker@healthcenter.com',
    phone: '+1 (555) 456-7890',
    address: '321 Health Center Dr, Floor 3, City, State 12345',
    role: 'Cardiologist',
    status: 'active',
    schedule: ['Mon', 'Wed', 'Fri'],
    hourlyRate: 120,
    teams: [{ id: 3, name: 'Cardiac Care' }]
  },
  {
    id: 5,
    name: 'James Wilson',
    email: 'james.wilson@healthcenter.com',
    phone: '+1 (555) 567-8901',
    address: '654 Medical Center Way, Building A, City, State 12345',
    role: 'Physical Therapist',
    status: 'inactive',
    schedule: ['Thu', 'Fri'],
    hourlyRate: 38,
    teams: [{ id: 4, name: 'Rehabilitation' }]
  },
  {
    id: 6,
    name: 'Anna Thompson',
    email: 'anna.thompson@healthcenter.com',
    phone: '+1 (555) 678-9012',
    address: '987 Care Center St, Suite 101, City, State 12345',
    role: 'Home Health Aide',
    status: 'active',
    schedule: ['Mon', 'Tue', 'Thu', 'Fri', 'Sat'],
    hourlyRate: 15,
    teams: [{ id: 5, name: 'Home Care' }]
  },
  {
    id: 7,
    name: 'Robert Davis',
    email: 'robert.davis@healthcenter.com',
    phone: '+1 (555) 789-0123',
    address: '147 Treatment Plaza, Room 205, City, State 12345',
    role: 'Certified Nursing Assistant',
    status: 'active',
    schedule: ['Wed', 'Thu', 'Fri', 'Sat'],
    hourlyRate: 18,
    teams: [{ id: 1, name: 'Care Team Alpha' }, { id: 5, name: 'Home Care' }]
  },
  {
    id: 8,
    name: 'Maria Garcia',
    email: 'maria.garcia@healthcenter.com',
    phone: '+1 (555) 890-1234',
    address: '258 Healthcare Complex, Wing B, City, State 12345',
    role: 'Social Worker',
    status: 'active',
    schedule: ['Mon', 'Tue', 'Wed'],
    hourlyRate: 32,
    teams: [{ id: 2, name: 'Medical Support' }, { id: 4, name: 'Rehabilitation' }]
  }
])

// Tab state
const activeTabIndex = ref(0)

// Search and filter state
const currentLimit = ref(20)
const currentSkip = ref(0)
const loadingMore = ref(false)

// Dialog state
const showAddTeamDialog = ref(false)
const showAddMemberDialog = ref(false)
const showTeamDetailsDialog = ref(false)
const showManageMembersDialog = ref(false)
const editingTeam = ref<Team | null>(null)
const editingMember = ref<MemberFormData | null>(null)
const selectedTeam = ref<Team | null>(null)

// Computed
const activeTab = computed(() => {
  return activeTabIndex.value === 0 ? 'members' : 'teams'
})

const filteredTeams = computed(() => {
  // No filtering for now - return all teams
  return [...teams.value]
})

const filteredMembers = computed(() => {
  // Return dummy members for display
  return dummyMembers.value.slice(0, currentLimit.value)
})

const members = computed(() => dummyMembers.value)

// Methods
const loadTeams = async (reset = false) => {
  if (reset) {
    currentSkip.value = 0
  }

  await getTeams(currentSkip.value, currentLimit.value)

  if (!reset) {
    currentSkip.value += currentLimit.value
  }
}

const handleRefresh = async () => {
  teams.value = []
  await loadTeams(true)
}

// Load more teams (for pagination)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const loadMoreTeams = async () => {
  loadingMore.value = true
  await loadTeams(false)
  loadingMore.value = false
}

const handleAddTeam = () => {
  editingTeam.value = null
  showAddTeamDialog.value = true
}

const handleAddMember = () => {
  editingMember.value = null
  showAddMemberDialog.value = true
}

const handleEditTeam = (team: Team) => {
  editingTeam.value = team
  showAddTeamDialog.value = true
}

const handleEditMember = (member: MemberDisplay) => {
  // Transform MemberDisplay to MemberFormData format for editing
  editingMember.value = {
    name: member.name,
    email: member.email,
    phone: member.phone || '',
    address: member.address || '',
    availability: member.schedule || [],
    notes: '' // MemberDisplay doesn't have notes field, so start with empty
  }
  showAddMemberDialog.value = true
}

const handleViewTeamDetails = (team: Team) => {
  selectedTeam.value = team
  showTeamDetailsDialog.value = true
}

const handleViewMemberDetails = (member: MemberDisplay) => {
  // TODO: Implement view member details functionality
  toast.add({
    severity: 'info',
    summary: 'Member Details',
    detail: `View details for member #${member.id} coming soon`,
    life: 3000
  })
}

const handleManageMembers = (team: Team) => {
  selectedTeam.value = team
  showManageMembersDialog.value = true
}

const handleDeleteMember = (member: MemberDisplay) => {
  confirm.require({
    message: `Are you sure you want to delete ${member.name}?`,
    header: 'Delete Member',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Cancel',
    acceptLabel: 'Delete',
    rejectClass: 'p-button-secondary p-button-outlined',
    acceptClass: 'p-button-danger',
    accept: async () => {
      // TODO: Implement delete member functionality
      toast.add({
        severity: 'success',
        summary: 'Member Deleted',
        detail: `Member #${member.id} has been deleted successfully.`,
        life: 3000
      })
    }
  })
}

const handleTeamAdded = async () => {
  toast.add({
    severity: 'success',
    summary: 'Team Created',
    detail: 'Team has been successfully created.',
    life: 3000
  })

  // Refresh the teams list
  await handleRefresh()

  // Reset dialog state
  showAddTeamDialog.value = false
  editingTeam.value = null
}

const handleTeamUpdated = async () => {
  toast.add({
    severity: 'success',
    summary: 'Team Updated',
    detail: 'Team has been successfully updated.',
    life: 3000
  })

  // Refresh the teams list
  await handleRefresh()

  // Reset dialog state
  showAddTeamDialog.value = false
  editingTeam.value = null
}

const handleMembersUpdated = async () => {
  toast.add({
    severity: 'success',
    summary: 'Members Updated',
    detail: 'Team members have been successfully updated.',
    life: 3000
  })

  // Refresh the teams list
  await handleRefresh()

  // Reset dialog state
  showManageMembersDialog.value = false
}

const handleMemberAdded = async () => {
  toast.add({
    severity: 'success',
    summary: 'Member Added',
    detail: 'Member has been successfully added.',
    life: 3000
  })

  // Reset dialog state
  showAddMemberDialog.value = false
  editingMember.value = null

  // TODO: Refresh members list when backend is implemented
}

const handleMemberUpdated = async () => {
  toast.add({
    severity: 'success',
    summary: 'Member Updated',
    detail: 'Member has been successfully updated.',
    life: 3000
  })

  // Reset dialog state
  showAddMemberDialog.value = false
  editingMember.value = null

  // TODO: Refresh members list when backend is implemented
}

const handleDeleteTeam = (team: Team) => {
  confirm.require({
    message: `Are you sure you want to delete "${team.name}"? This action cannot be undone and will remove all team members.`,
    header: 'Delete Team',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Cancel',
    acceptLabel: 'Delete',
    rejectClass: 'p-button-secondary p-button-outlined',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await deleteTeam(team.id)
        toast.add({
          severity: 'success',
          summary: 'Team Deleted',
          detail: `${team.name} has been deleted successfully.`,
          life: 3000
        })
        await handleRefresh()
      } catch (err) {
        console.error('Delete team error:', err)
        toast.add({
          severity: 'error',
          summary: 'Delete Failed',
          detail: 'Failed to delete team. Please try again.',
          life: 3000
        })
      }
    }
  })
}

// Lifecycle
onMounted(() => {
  loadTeams(true)
})
</script>

<style scoped>
/* Custom styles for the teams page */
:deep(.p-inputtext) {
  border-radius: 8px;
}

:deep(.p-dropdown) {
  border-radius: 8px;
}

:deep(.p-button) {
  border-radius: 8px;
}

/* Grid responsive adjustments */
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1025px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
