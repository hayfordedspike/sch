import { ref } from 'vue'
import type { Team, TeamMember, CreateTeamRequest, UpdateTeamRequest, AddTeamMemberRequest } from './useTeams'

export const useTeamsDummy = () => {
  const teams = ref<Team[]>([
    {
      id: 1,
      name: "Care Team Alpha",
      description: "Primary care team for residential clients in North Wing",
      manager_employee_id: 101,
      created_at: "2025-01-15T08:00:00.000Z"
    },
    {
      id: 2,
      name: "Medical Support",
      description: "Specialized medical support team for complex care needs",
      manager_employee_id: 102,
      created_at: "2025-02-01T09:30:00.000Z"
    },
    {
      id: 3,
      name: "Therapy Team",
      description: "Physical, occupational, and speech therapy specialists",
      manager_employee_id: 103,
      created_at: "2025-02-15T10:15:00.000Z"
    },
    {
      id: 4,
      name: "Night Shift",
      description: "Overnight care and monitoring team",
      manager_employee_id: 104,
      created_at: "2025-03-01T16:00:00.000Z"
    },
    {
      id: 5,
      name: "Emergency Response",
      description: "Rapid response team for urgent care situations",
      manager_employee_id: 105,
      created_at: "2025-03-10T12:00:00.000Z"
    }
  ])

  const teamMembers = ref<TeamMember[]>([
    // Care Team Alpha members
    {
      id: 1,
      team_id: 1,
      employee_id: 101,
      role: 'MANAGER',
      is_primary: true,
      joined_at: "2025-01-15T08:00:00.000Z",
      left_at: null
    },
    {
      id: 2,
      team_id: 1,
      employee_id: 201,
      role: 'MEMBER',
      is_primary: true,
      joined_at: "2025-01-16T08:00:00.000Z",
      left_at: null
    },
    {
      id: 3,
      team_id: 1,
      employee_id: 202,
      role: 'MEMBER',
      is_primary: false,
      joined_at: "2025-01-20T08:00:00.000Z",
      left_at: null
    },
    // Medical Support members
    {
      id: 4,
      team_id: 2,
      employee_id: 102,
      role: 'MANAGER',
      is_primary: true,
      joined_at: "2025-02-01T09:30:00.000Z",
      left_at: null
    },
    {
      id: 5,
      team_id: 2,
      employee_id: 203,
      role: 'MEMBER',
      is_primary: true,
      joined_at: "2025-02-02T09:00:00.000Z",
      left_at: null
    },
    // Therapy Team members
    {
      id: 6,
      team_id: 3,
      employee_id: 103,
      role: 'MANAGER',
      is_primary: true,
      joined_at: "2025-02-15T10:15:00.000Z",
      left_at: null
    },
    {
      id: 7,
      team_id: 3,
      employee_id: 204,
      role: 'MEMBER',
      is_primary: true,
      joined_at: "2025-02-16T10:00:00.000Z",
      left_at: null
    },
    {
      id: 8,
      team_id: 3,
      employee_id: 205,
      role: 'MEMBER',
      is_primary: false,
      joined_at: "2025-02-20T10:00:00.000Z",
      left_at: null
    }
  ])

  const loading = ref(false)
  const error = ref<string | null>(null)

  // Simulate API delay
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  // Get all teams
  const getTeams = async (skip = 0, limit = 100) => {
    loading.value = true
    error.value = null
    
    try {
      await delay(500) // Simulate API delay
      const paginatedTeams = teams.value.slice(skip, skip + limit)
      return paginatedTeams
    } catch (err) {
      error.value = 'Failed to fetch teams'
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
      await delay(300)
      const team = teams.value.find(t => t.id === teamId)
      if (!team) {
        throw new Error('Team not found')
      }
      
      if (includeMembers) {
        // In a real implementation, this would include members in the response
        const members = teamMembers.value.filter(m => m.team_id === teamId)
        return { ...team, members }
      }
      
      return team
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
      await delay(600)
      const newTeam: Team = {
        id: Math.max(...teams.value.map(t => t.id)) + 1,
        ...teamData,
        created_at: new Date().toISOString()
      }
      
      teams.value.push(newTeam)
      return newTeam
    } catch (err) {
      error.value = 'Failed to create team'
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
      await delay(500)
      const index = teams.value.findIndex(team => team.id === teamId)
      if (index === -1) {
        throw new Error('Team not found')
      }
      
      const updatedTeam = {
        ...teams.value[index],
        ...teamData
      }
      
      teams.value[index] = updatedTeam
      return updatedTeam
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
      await delay(400)
      const index = teams.value.findIndex(team => team.id === teamId)
      if (index === -1) {
        throw new Error('Team not found')
      }
      
      teams.value.splice(index, 1)
      // Also remove team members
      teamMembers.value = teamMembers.value.filter(member => member.team_id !== teamId)
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
      await delay(500)
      
      // Check if team exists
      const teamExists = teams.value.some(t => t.id === teamId)
      if (!teamExists) {
        throw new Error('Team not found')
      }
      
      // Check if member already exists
      const memberExists = teamMembers.value.some(
        m => m.team_id === teamId && m.employee_id === memberData.employee_id
      )
      if (memberExists) {
        throw new Error('Employee is already a member of this team')
      }
      
      const newMember: TeamMember = {
        id: Math.max(...teamMembers.value.map(m => m.id)) + 1,
        ...memberData,
        joined_at: new Date().toISOString(),
        left_at: null
      }
      
      teamMembers.value.push(newMember)
      return newMember
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
      await delay(300)
      const members = teamMembers.value.filter(member => member.team_id === teamId)
      return members
    } catch (err) {
      error.value = 'Failed to fetch team members'
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
      await delay(400)
      const index = teamMembers.value.findIndex(
        member => member.team_id === teamId && member.employee_id === employeeId
      )
      
      if (index === -1) {
        throw new Error('Team member not found')
      }
      
      teamMembers.value.splice(index, 1)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to remove team member'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Helper functions for getting specific data
  const getTeamByName = (name: string) => {
    return teams.value.find(team => team.name.toLowerCase().includes(name.toLowerCase()))
  }

  const getManagerTeams = (managerId: number) => {
    return teams.value.filter(team => team.manager_employee_id === managerId)
  }

  const getEmployeeTeams = (employeeId: number) => {
    const memberships = teamMembers.value.filter(member => member.employee_id === employeeId)
    return teams.value.filter(team => memberships.some(member => member.team_id === team.id))
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
    removeTeamMember,
    getTeamByName,
    getManagerTeams,
    getEmployeeTeams
  }
}