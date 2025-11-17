import { ref } from 'vue'
import { useApi } from './useApi'

export interface TeamMember {
  id: number
  team_id: number
  employee_id: number
  role: 'LEAD' | 'MEMBER' | 'TRAINEE'
  is_primary: boolean
  joined_at: string
  left_at: string | null
}

export interface AddTeamMemberRequest {
  team_id: number
  employee_id: number
  role: 'LEAD' | 'MEMBER' | 'TRAINEE'
  is_primary: boolean
}

export const useTeamMembers = () => {
  const { get, post, put, delete: del } = useApi()
  const teamMembers = ref<TeamMember[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

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

  // Update team member
  const updateTeamMember = async (teamId: number, employeeId: number, memberData: Partial<AddTeamMemberRequest>) => {
    loading.value = true
    error.value = null

    try {
      const response = await put<TeamMember>(`/teams/${teamId}/members/${employeeId}`, memberData)

      if (response) {
        // Update local team members array
        const index = teamMembers.value.findIndex(member => member.employee_id === employeeId && member.team_id === teamId)
        if (index !== -1) {
          teamMembers.value[index] = response
        }
        return response
      }
      return null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update team member'
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
    teamMembers,
    loading,
    error,
    addTeamMember,
    getTeamMembers,
    updateTeamMember,
    removeTeamMember
  }
}