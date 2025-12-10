<template>
<div class="p-6 bg-white min-h-screen">
  <div class=" min-h-screen py-8">
    <!-- Header Section -->
    <div class="w-full mb-12 lg:mb-16">
      <div class="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div class="team-hero-card">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <!-- Title and Stats -->
            <div>
              <h1 class="team-hero-title">
                <i class="pi pi-users mr-3"></i>
                Teams
              </h1>
              <p class="text-muted mt-2">
                Manage your team members, roles and availability
              </p>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3">
              <GlobalButton
                v-if="activeTab === 'my-teams'"
                @click="handleAddMyTeam"
                icon="pi pi-plus"
                label="Add My Team"
                class="team-primary-action"
              />
              <GlobalButton
                v-if="activeTab === 'members'"
                @click="handleAddMember"
                icon="pi pi-user-plus"
                label="Add New Member"
                class="team-primary-action"
              />
              <GlobalButton
                v-if="activeTab === 'teams'"
                @click="handleAddTeam"
                icon="pi pi-plus"
                label="Create Team Group"
                class="team-primary-action"
              />
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs Navigation -->
    <div class="w-full mb-6 mt-4 md:mt-6">
      <div class="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div class="app-tab-card">
          <div class="app-tab-inline">
            <button
              @click="activeTabIndex = 0"
              :class="['app-tab-button', activeTabIndex === 0 ? 'app-tab-button--active' : 'app-tab-button--inactive']"
            >
              My Teams
            </button>
            <button
              @click="activeTabIndex = 1"
              :class="['app-tab-button', activeTabIndex === 1 ? 'app-tab-button--active' : 'app-tab-button--inactive']"
            >
              Members
            </button>
            <button
              @click="activeTabIndex = 2"
              :class="['app-tab-button', activeTabIndex === 2 ? 'app-tab-button--active' : 'app-tab-button--inactive']"
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
        <div class="team-panel">
          <!-- My Teams Content -->

          <div v-if="activeTab === 'my-teams'" class="p-6">
            <div class="flex justify-end mb-4 gap-2">
              <GlobalButton
                :label="'Card View'"
                :severity="!myTeamsTableView ? 'primary' : 'warning'"
                :outlined="myTeamsTableView"
                class="min-w-[120px]"
                @click="myTeamsTableView = false"
              />
              <GlobalButton
                :label="'Table View'"
                :severity="myTeamsTableView ? 'primary' : 'warning'"
                :outlined="!myTeamsTableView"
                class="min-w-[120px]"
                @click="myTeamsTableView = true"
              />
            </div>
            <!-- Loading State -->
            <div v-if="myTeamsLoading && myTeams.length === 0" class="text-center py-12">
              <i class="pi pi-spinner pi-spin text-gray-400" style="font-size: 2rem;"></i>
              <p class="text-muted mt-4">Loading my teams...</p>
            </div>
            <!-- Empty State -->
            <div v-else-if="!myTeamsLoading && myTeams.length === 0" class="text-center py-12">
              <div class="team-empty-card">
                <div class="mb-4">
                  <i class="pi pi-users text-gray-300" style="font-size: 4rem;"></i>
                </div>
                <h3 class="team-empty-title">No My Teams Yet</h3>
                <p class="text-muted mb-6">
                  Get started by adding your first personal team.
                </p>
                <GlobalButton
                  @click="handleAddMyTeam"
                  icon="pi pi-plus"
                  label="Add Your First Team"
                  class="team-primary-action font-semibold py-3 px-6"
                />
              </div>
            </div>
            <!-- My Teams Table -->
            <AppTable
              v-else-if="myTeamsTableView"
              :headers="myTeamsTableHeaders"
              :items="myTeamsTableRows"
              :showMenu="false"
              :title="'My Teams'"
              :showTotal="true"
              :totalItems="myTeams.length"
            >
              <template #menu="{ item }">
                <div class="team-table-actions">
                  <GlobalButton icon="pi pi-pencil" @click.stop="handleEditMyTeam(item)" class="p-button-rounded p-button-outlined p-button-sm" severity="info" outlined />
                  <GlobalButton icon="pi pi-trash" @click.stop="handleDeleteMyTeam(item)" class="p-button-rounded p-button-outlined p-button-sm" severity="danger" outlined />
                </div>
              </template>
            </AppTable>
            <!-- My Teams Card Grid -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <MyTeamCard
                v-for="team in myTeams"
                :key="team.id"
                :team="team"
                @edit="handleEditMyTeam"
                @delete="handleDeleteMyTeam"
              />
            </div>
          </div>


          <!-- Members Content -->
          <div v-if="activeTab === 'members'" class="p-6">
            <div class="flex justify-end mb-4 gap-2">
              <GlobalButton
                :label="'Card View'"
                :severity="!membersTableView ? 'primary' : 'warning'"
                :outlined="membersTableView"
                class="min-w-[120px]"
                @click="membersTableView = false"
              />
              <GlobalButton
                :label="'Table View'"
                :severity="membersTableView ? 'primary' : 'warning'"
                :outlined="!membersTableView"
                class="min-w-[120px]"
                @click="membersTableView = true"
              />
            </div>
            <!-- Loading State -->
            <div v-if="membersLoading && members.length === 0" class="text-center py-12">
              <i class="pi pi-spinner pi-spin text-gray-400" style="font-size: 2rem;"></i>
              <p class="text-muted mt-4">Loading members...</p>
            </div>
            <!-- Empty State -->
            <div v-else-if="!membersLoading && filteredMembers.length === 0" class="text-center py-12">
              <div class="team-empty-card">
                <div class="mb-4">
                  <i class="pi pi-user text-gray-300" style="font-size: 4rem;"></i>
                </div>
                <h3 class="team-empty-title">No Members Yet</h3>
                <p class="text-muted mb-6">
                  Get started by adding your first team member.
                </p>
                <GlobalButton
                  @click="handleAddMember"
                  icon="pi pi-user-plus"
                  label="Add Your First Member"
                  class="team-primary-action font-semibold py-3 px-6"
                />
              </div>
            </div>
            <!-- Members Table -->
            <AppTable
              v-else-if="membersTableView"
              :headers="membersTableHeaders"
              :items="membersTableRows"
              :showMenu="false"
              :title="'Team Members'"
              :showTotal="true"
              :totalItems="filteredMembers.length"
            >
              <template #menu="{ item }">
                <div class="team-table-actions">
                  <GlobalButton icon="pi pi-pencil" @click.stop="handleEditMember(item)" class="p-button-rounded p-button-outlined p-button-sm" severity="info" outlined />
                  <GlobalButton icon="pi pi-trash" @click.stop="handleDeleteMember(item)" class="p-button-rounded p-button-outlined p-button-sm" severity="danger" outlined />
                </div>
              </template>
            </AppTable>
            <!-- Members Card Grid -->
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
            <div class="flex justify-end mb-4 gap-2">
              <GlobalButton
                :label="'Card View'"
                :severity="!teamsTableView ? 'primary' : 'warning'"
                :outlined="teamsTableView"
                class="min-w-[120px]"
                @click="teamsTableView = false"
              />
              <GlobalButton
                :label="'Table View'"
                :severity="teamsTableView ? 'primary' : 'warning'"
                :outlined="!teamsTableView"
                class="min-w-[120px]"
                @click="teamsTableView = true"
              />
            </div>
            <!-- Loading State -->
            <div v-if="loading && teams.length === 0" class="text-center py-12">
              <i class="pi pi-spinner pi-spin text-gray-400" style="font-size: 2rem;"></i>
              <p class="text-muted mt-4">Loading teams...</p>
            </div>
            <!-- Empty State -->
            <div v-else-if="!loading && filteredTeams.length === 0" class="text-center py-12">
              <div class="team-empty-card">
                <div class="mb-4">
                  <i class="pi pi-users text-gray-300" style="font-size: 4rem;"></i>
                </div>
                <h3 class="team-empty-title">No Teams Yet</h3>
                <p class="text-muted mb-6">
                  Get started by creating your first team to organize your workforce.
                </p>
                <GlobalButton
                  @click="handleAddTeam"
                  icon="pi pi-plus"
                  label="Create Your First Team"
                  class="team-primary-action font-semibold py-3 px-6"
                />
              </div>
            </div>
            <!-- Teams Table -->
            <AppTable
              v-else-if="teamsTableView"
              :headers="teamsTableHeaders"
              :items="teamsTableRows"
              :showMenu="false"
              :title="'Grouped Teams'"
              :showTotal="true"
              :totalItems="filteredTeams.length"
            >
              <template #menu="{ item }">
                <div class="team-table-actions">
                  <GlobalButton icon="pi pi-pencil" @click.stop="handleEditTeam(item)" class="p-button-rounded p-button-outlined p-button-sm" severity="info" outlined />
                  <GlobalButton icon="pi pi-trash" @click.stop="handleDeleteTeam(item)" class="p-button-rounded p-button-outlined p-button-sm" severity="danger" outlined />
                  <GlobalButton icon="pi pi-users" @click.stop="handleManageMembers(item)" class="p-button-rounded p-button-outlined p-button-sm" severity="secondary" outlined />
                  <GlobalButton icon="pi pi-eye" @click.stop="handleViewTeamDetails(item)" class="p-button-rounded p-button-outlined p-button-sm" severity="secondary" outlined />
                </div>
              </template>
            </AppTable>
            <!-- Teams Card Grid -->
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

    <!-- Add/Edit My Team Dialog -->
    <AddMyTeamDialog
      v-model:visible="showAddMyTeamDialog"
      :team="editingMyTeam"
      @team-added="handleMyTeamAdded"
      @team-updated="handleMyTeamUpdated"
    />

    <!-- Add Team Member Dialog -->
    <AddTeamMemberDialog
      v-model:visible="showAddTeamMemberDialog"
      @member-added="handleTeamMemberAdded"
    />

    <!-- Edit Team Member Dialog -->
    <EditTeamMemberDialog
      v-model:visible="showEditTeamMemberDialog"
      :member="editingTeamMember"
      @member-updated="handleTeamMemberUpdated"
    />

    <!-- Confirmation Dialog -->
    <ConfirmDialog />
  </div>
</div></template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { useTeams } from '@/composables/useTeams'
import { useTeamMembers } from '@/composables/useTeamMembers'
import type { CreateTeamRequest, UpdateTeamRequest, Team } from '@/composables/useTeams'
import type { TeamMember } from '@/composables/useTeamMembers'
import GlobalButton from '@/components/shared/GlobalButton.vue'
import ConfirmDialog from 'primevue/confirmdialog'
import { TeamCard, MemberCard, MyTeamCard, AddTeamDialog, AddMemberDialog, AddMyTeamDialog, ViewTeamDetailsDialog, ManageTeamMembersDialog, AddTeamMemberDialog, EditTeamMemberDialog } from './components/index'

import AppTable from '@/components/shared/AppTable.vue'

// Table view toggles for each tab
const myTeamsTableView = ref(false)
const membersTableView = ref(false)
const teamsTableView = ref(false)

// Table headers and row mapping for My Teams
const myTeamsTableHeaders = [
  { key: 'name', label: 'Team Name' },
  { key: 'description', label: 'Description' },
  { key: 'manager', label: 'Manager' },
  { key: 'menu', label: 'Actions' },
]
const myTeamsTableRows = computed(() =>
  myTeams.value.map(team => ({
    ...team,
    manager: team.manager_employee_id ? `Employee #${team.manager_employee_id}` : 'Unknown',
  }))
)

// Table headers and row mapping for Members
const membersTableHeaders = [
  { key: 'name', label: 'Name' },
  { key: 'role', label: 'Role' },
  { key: 'team', label: 'Team' },
  { key: 'phone', label: 'Phone' },
  { key: 'status', label: 'Status' },
  { key: 'joined_at', label: 'Member Since' },
  { key: 'menu', label: 'Actions' },
]
const membersTableRows = computed(() =>
  filteredMembers.value.map(member => ({
    ...member,
    name: member.employee_id ? `Employee #${member.employee_id}` : 'Unknown',
    role: member.role || 'Member',
    team: member.team_id ? `Team #${member.team_id}` : 'Unknown',
    phone: member.phone || 'No phone',
    status: member.status === 'ACTIVE' ? 'Active' : 'Inactive',
    joined_at: member.joined_at ? new Date(member.joined_at).toLocaleDateString() : '-',
  }))
)

// Table headers and row mapping for Grouped Teams
const teamsTableHeaders = [
  { key: 'name', label: 'Team Name' },
  { key: 'totalMembers', label: 'Members' },
  { key: 'teamLead', label: 'Team Lead' },
  { key: 'menu', label: 'Actions' },
]
const teamsTableRows = computed(() =>
  filteredTeams.value.map(team => {
    // Defensive: fallback for missing members
    const members = team.members || []
    const totalMembers = Array.isArray(members) ? members.length : 0
    const teamLead = members.find(m => m.role === 'MANAGER' || m.role === 'ADMIN')
    return {
      ...team,
      totalMembers,
      teamLead: teamLead ? `Employee #${teamLead.employee_id}` : 'Unassigned',
    }
  })
)

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
} = useTeams()

// Team members and employees hooks
const { getTeamMembers } = useTeamMembers()

// My Teams API hooks
const {
  teams: myTeams,
  loading: myTeamsLoading,
  getTeams: getMyTeams,
  createTeam,
  updateTeam,
  deleteTeam: deleteMyTeam
} = useTeams()

// Real member data from API
const allTeamMembers = ref<TeamMember[]>([])
const membersLoading = ref(false)

// Tab state
const activeTabIndex = ref(0)

// Search and filter state
const currentLimit = ref(20)
const currentSkip = ref(0)

// Dialog state
const showAddTeamDialog = ref(false)
const showAddMemberDialog = ref(false)
const showTeamDetailsDialog = ref(false)
const showManageMembersDialog = ref(false)
const editingTeam = ref<Team | null>(null)
const editingMember = ref<MemberFormData | null>(null)
const selectedTeam = ref<Team | null>(null)

// My Teams dialog state
const showAddMyTeamDialog = ref(false)
const editingMyTeam = ref<Team | null>(null)

// Add Team Member dialog state
const showAddTeamMemberDialog = ref(false)

// Edit Team Member dialog state
const showEditTeamMemberDialog = ref(false)
const editingTeamMember = ref<TeamMember | null>(null)

// Computed
const activeTab = computed(() => {
  if (activeTabIndex.value === 0) return 'my-teams'
  if (activeTabIndex.value === 1) return 'members'
  return 'teams'
})

const filteredTeams = computed(() => {
  // No filtering for now - return all teams
  return [...teams.value]
})

const filteredMembers = computed(() => {
  // Return transformed team members for display
  return allTeamMembers.value.slice(0, currentLimit.value)
})

const members = computed(() => allTeamMembers.value)

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
  await loadTeamMembers() // Also refresh members
}

// Load team members from all teams
const loadTeamMembers = async () => {
  membersLoading.value = true
  try {
    allTeamMembers.value = []

    // Get members from all teams
    for (const team of teams.value) {
      try {
        const teamMembers = await getTeamMembers(team.id)
        allTeamMembers.value.push(...teamMembers)
      } catch (err) {
        console.error(`Failed to load members for team ${team.id}:`, err)
        // Continue with other teams even if one fails
      }
    }
  } catch (err) {
    console.error('Failed to load team members:', err)
  } finally {
    membersLoading.value = false
  }
}

const handleAddTeam = () => {
  editingTeam.value = null
  showAddTeamDialog.value = true
}

const handleAddMember = () => {
  showAddTeamMemberDialog.value = true
}

const handleEditTeam = (team: Team) => {
  editingTeam.value = team
  showAddTeamDialog.value = true
}

const handleEditMember = (member: TeamMember) => {
  editingTeamMember.value = member
  showEditTeamMemberDialog.value = true
}

const handleViewTeamDetails = (team: Team) => {
  selectedTeam.value = team
  showTeamDetailsDialog.value = true
}

const handleViewMemberDetails = (member: TeamMember) => {
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

const handleDeleteMember = (member: TeamMember) => {
  confirm.require({
    message: `Are you sure you want to remove this member from the team?`,
    header: 'Remove Team Member',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Cancel',
    acceptLabel: 'Remove',
    rejectClass: 'p-button-secondary p-button-outlined',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        const { removeTeamMember } = useTeamMembers()
        await removeTeamMember(member.team_id, member.employee_id)
        toast.add({
          severity: 'success',
          summary: 'Member Removed',
          detail: `Member has been removed from the team.`,
          life: 3000
        })
        await loadTeamMembers() // Refresh the list
      } catch (err) {
        console.error('Remove member error:', err)
        toast.add({
          severity: 'error',
          summary: 'Remove Failed',
          detail: 'Failed to remove team member. Please try again.',
          life: 3000
        })
      }
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

// My Teams handlers
const handleAddMyTeam = () => {
  editingMyTeam.value = null
  showAddMyTeamDialog.value = true
}

const handleEditMyTeam = (team: Team) => {
  editingMyTeam.value = team
  showAddMyTeamDialog.value = true
}

const handleDeleteMyTeam = (team: Team) => {
  confirm.require({
    message: `Are you sure you want to delete "${team.name}"?`,
    header: 'Delete My Team',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Cancel',
    acceptLabel: 'Delete',
    rejectClass: 'p-button-secondary p-button-outlined',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await deleteMyTeam(team.id)
        toast.add({
          severity: 'success',
          summary: 'My Team Deleted',
          detail: `${team.name} has been deleted successfully.`,
          life: 3000
        })
        await getMyTeams() // Refresh the list
      } catch (err) {
        console.error('Delete my team error:', err)
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

const handleMyTeamAdded = async (teamData: CreateTeamRequest) => {
  try {
    await createTeam(teamData)
    toast.add({
      severity: 'success',
      summary: 'My Team Added',
      detail: 'Team has been added successfully.',
      life: 3000
    })
    showAddMyTeamDialog.value = false
    editingMyTeam.value = null
    await getMyTeams() // Refresh the list
  } catch (err) {
    console.error('Add my team error:', err)
    toast.add({
      severity: 'error',
      summary: 'Add Failed',
      detail: 'Failed to add team. Please try again.',
      life: 3000
    })
  }
}

const handleMyTeamUpdated = async (teamData: UpdateTeamRequest) => {
  if (editingMyTeam.value) {
    try {
      await updateTeam(editingMyTeam.value.id, teamData)
      toast.add({
        severity: 'success',
        summary: 'My Team Updated',
        detail: 'Team has been updated successfully.',
        life: 3000
      })
      showAddMyTeamDialog.value = false
      editingMyTeam.value = null
      await getMyTeams() // Refresh the list
    } catch (err) {
      console.error('Update my team error:', err)
      toast.add({
        severity: 'error',
        summary: 'Update Failed',
        detail: 'Failed to update team. Please try again.',
        life: 3000
      })
    }
  }
}

const handleTeamMemberAdded = async () => {
  toast.add({
    severity: 'success',
    summary: 'Team Member Added',
    detail: 'Team member has been added successfully.',
    life: 3000
  })

  // Refresh the teams list to show updated member counts
  await handleRefresh()

  // Reset dialog state
  showAddTeamMemberDialog.value = false
}

const handleTeamMemberUpdated = async () => {
  toast.add({
    severity: 'success',
    summary: 'Team Member Updated',
    detail: 'Team member has been updated successfully.',
    life: 3000
  })

  // Refresh the teams list to show updated member counts
  await handleRefresh()

  // Reset dialog state
  showEditTeamMemberDialog.value = false
  editingTeamMember.value = null
}

// Lifecycle
onMounted(async () => {
  await loadTeams(true)
  await getMyTeams() // Load My Teams data
  await loadTeamMembers() // Load team members data
})
</script>

<style scoped>
.team-page {
  --team-bg-start: var(--app-background);
  --team-bg-end: var(--app-surface-muted);
  background: linear-gradient(160deg, var(--team-bg-start), var(--team-bg-end));
  transition: background 0.3s ease, color 0.3s ease;
  color: var(--app-text);
}

:global(html.theme-dark) .team-page,
:global(.theme-dark) .team-page {
  --team-bg-start: #040b18;
  --team-bg-end: #0f203f;
}

.team-hero-card {
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 1.5rem;
  box-shadow: var(--app-card-shadow);
  padding: 1.5rem;
}

.team-hero-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--app-text);
  display: flex;
  align-items: center;
}

.team-hero-title i {
  color: var(--app-accent);
}

.team-panel {
  background: var(--app-surface);
  border-radius: 1rem;
  border: 1px solid var(--app-border);
  box-shadow: var(--app-card-shadow);
}

.team-empty-card {
  background: var(--app-surface-muted);
  border-radius: 1rem;
  padding: 3rem;
  border: 1px dashed var(--app-border);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.team-empty-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--app-text);
}

:deep(.p-inputtext) {
  border-radius: 8px;
}

:deep(.p-dropdown) {
  border-radius: 8px;
}

:deep(.p-button) {
  border-radius: 8px;
}

.team-table-actions {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: center;
}

/* Grid responsive adjustments are handled via Tailwind classes */
</style>
