import { ref } from 'vue'
import { useApi } from './useApi'

export interface Team {
  id: number
  name: string
  description: string
  manager_employee_id: number
  created_at: string
}

export interface CreateTeamRequest {
  name: string
  description: string
  manager_employee_id: number
}

export interface UpdateTeamRequest {
  name: string
  description: string
  manager_employee_id: number
}

export interface TeamMember {
  id: number
  team_id: number
  employee_id: number
  role: 'MEMBER' | 'MANAGER' | 'ADMIN'
  is_primary: boolean
  joined_at: string
  left_at: string | null
}

export interface AddTeamMemberRequest {
  team_id: number
  employee_id: number
  role: 'MEMBER' | 'MANAGER' | 'ADMIN'
  is_primary: boolean
}

export const useTeams = () => {
  const { get, post, put, delete: del } = useApi()
  const teams = ref<Team[]>([])
  const teamMembers = ref<TeamMember[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Get all teams
  const getTeams = async (skip = 0, limit = 100) => {
    loading.value = true
    error.value = null

    try {
      const response = await get<Team[]>(`/teams/?skip=${skip}&limit=${limit}`)
      if (response) {
        teams.value = response
        return response
      }
      return []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch teams'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get single team
  const getTeam = async (teamId: number, includeMembers = false) => {
    loading.value = true
    error.value = null

    try {
      const response = await get<Team>(`/teams/${teamId}?include_members=${includeMembers}`)
      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch team'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Create team
  const createTeam = async (teamData: CreateTeamRequest) => {
    loading.value = true
    error.value = null

    try {
      const response = await post<Team>('/teams/', teamData)

      if (response) {
        // Add to local teams array
        teams.value.push(response)
        return response
      }
      return null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create team'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update team
  const updateTeam = async (teamId: number, teamData: UpdateTeamRequest) => {
    loading.value = true
    error.value = null

    try {
      const response = await put<Team>(`/teams/${teamId}`, teamData)

      if (response) {
        // Update local teams array
        const index = teams.value.findIndex(team => team.id === teamId)
        if (index !== -1) {
          teams.value[index] = response
        }
        return response
      }
      return null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update team'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete team
  const deleteTeam = async (teamId: number) => {
    loading.value = true
    error.value = null

    try {
      await del(`/teams/${teamId}`)

      // Remove from local teams array
      teams.value = teams.value.filter(team => team.id !== teamId)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete team'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Add team member
  const addTeamMember = async (teamId: number, memberData: AddTeamMemberRequest) => {
    loading.value = true
    error.value = null

    try {
      const response = await post<TeamMember>(`/teams/${teamId}/members`, memberData)

      if (response) {
        // Add to local team members array
        teamMembers.value.push(response)
        return response
      }
      return null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to add team member'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get team members
  const getTeamMembers = async (teamId: number) => {
    loading.value = true
    error.value = null

    try {
      const response = await get<TeamMember[]>(`/teams/${teamId}/members`)
      if (response) {
        teamMembers.value = response
        return response
      }
      return []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch team members'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Remove team member
  const removeTeamMember = async (teamId: number, employeeId: number) => {
    loading.value = true
    error.value = null

    try {
      await del(`/teams/${teamId}/members/${employeeId}`)

      // Remove from local team members array
      teamMembers.value = teamMembers.value.filter(
        member => !(member.team_id === teamId && member.employee_id === employeeId)
      )
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to remove team member'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    teams,
    teamMembers,
    loading,
    error,
    getTeams,
    getTeam,
    createTeam,
    updateTeam,
    deleteTeam,
    addTeamMember,
    getTeamMembers,
    removeTeamMember
  }
}
