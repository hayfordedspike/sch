import { ref, computed } from 'vue'
import { useApi } from './useApi'
import type {
  Employee,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  EmployeeSearchParams,
  EmployeeDisplayInfo,
  EmployeeStatus
} from '@/views/Employees/types'

export function useEmployees() {
  const { get, post, put, delete: del, loading, error } = useApi()

  const employees = ref<Employee[]>([])
  const currentEmployee = ref<Employee | null>(null)
  const totalEmployees = ref(0)
  const currentPage = ref(1)
  const totalPages = ref(1)

  // Stats state with caching
  const employeeStats = ref({
    total: 0,
    active: 0,
    inactive: 0,
    probation: 0,
    onLeave: 0,
    retired: 0,
    terminated: 0,
    lastUpdated: null as Date | null
  })
  const statsLoading = ref(false)

  // Computed properties
  const activeEmployees = computed(() =>
    employees.value.filter(employee => employee.status === 'ACTIVE')
  )

  const inactiveEmployees = computed(() =>
    employees.value.filter(employee => employee.status !== 'ACTIVE')
  )

  // Utility functions
  const getEmployeeDisplayInfo = (employee: Employee): EmployeeDisplayInfo => {
    const fullName = `${employee.first_name} ${employee.last_name}`.trim()

    const hireDate = new Date(employee.hire_date)
    const today = new Date()
    const daysEmployed = Math.floor((today.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24))

    const statusColors = {
      ACTIVE: 'success',
      INACTIVE: 'danger',
      PROBATION: 'warning',
      ON_LEAVE: 'info',
      RETIRED: 'secondary',
      TERMINATED: 'danger'
    }

    const statusLabels = {
      ACTIVE: 'Active',
      INACTIVE: 'Inactive',
      PROBATION: 'Probation',
      ON_LEAVE: 'On Leave',
      RETIRED: 'Retired',
      TERMINATED: 'Terminated'
    }

    return {
      fullName,
      status: employee.status,
      hireDate: hireDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      daysEmployed,
      statusColor: statusColors[employee.status],
      statusLabel: statusLabels[employee.status]
    }
  }

  // Stats methods with caching
  const fetchEmployeeStats = async (forceRefresh = false) => {
    // Return cached stats if available and not forcing refresh
    if (!forceRefresh && employeeStats.value.lastUpdated) {
      const cacheAge = Date.now() - employeeStats.value.lastUpdated.getTime()
      const cacheMaxAge = 5 * 60 * 1000 // 5 minutes
      if (cacheAge < cacheMaxAge) {
        return employeeStats.value
      }
    }

    try {
      statsLoading.value = true

      // Fetch all status counts in parallel
      const statusCounts = await Promise.all([
        countEmployees(), // total
        countEmployees('ACTIVE'),
        countEmployees('INACTIVE'),
        countEmployees('PROBATION'),
        countEmployees('ON_LEAVE'),
        countEmployees('RETIRED'),
        countEmployees('TERMINATED')
      ])

      employeeStats.value = {
        total: statusCounts[0] || 0,
        active: statusCounts[1] || 0,
        inactive: statusCounts[2] || 0,
        probation: statusCounts[3] || 0,
        onLeave: statusCounts[4] || 0,
        retired: statusCounts[5] || 0,
        terminated: statusCounts[6] || 0,
        lastUpdated: new Date()
      }

      return employeeStats.value
    } catch (err) {
      console.error('Error fetching employee stats:', err)
      return employeeStats.value
    } finally {
      statsLoading.value = false
    }
  }

  const refreshEmployeeStats = async () => {
    return await fetchEmployeeStats(true)
  }

  // API Methods
  const fetchEmployees = async (params: EmployeeSearchParams = {}) => {
    try {
      const queryParams = new URLSearchParams()

      if (params.status) queryParams.append('status', params.status)
      if (params.skip !== undefined) queryParams.append('skip', params.skip.toString())
      if (params.limit !== undefined) queryParams.append('limit', params.limit.toString())

      const url = `/employees/${queryParams.toString() ? '?' + queryParams.toString() : ''}`

      const response = await get<Employee[]>(url, {
        showErrorToast: true
      })

      if (response) {
        employees.value = response
        totalEmployees.value = response.length
        console.log('Fetched employees:', response.length)
      }

      return response
    } catch (err) {
      console.error('Error fetching employees:', err)
      return null
    }
  }

  const getEmployee = async (id: number) => {
    try {
      const response = await get<Employee>(`/employees/${id}`, {
        showErrorToast: true
      })

      if (response) {
        currentEmployee.value = response
      }

      return response
    } catch (err) {
      console.error('Error fetching employee:', err)
      return null
    }
  }

  const createEmployee = async (employeeData: CreateEmployeeRequest) => {
    try {
      const response = await post<Employee>('/employees', employeeData, {
        showSuccessToast: true,
        successMessage: 'Employee created successfully',
        showErrorToast: true
      })

      if (response) {
        employees.value.push(response)
        totalEmployees.value += 1
        // Refresh stats after creating employee
        await refreshEmployeeStats()
      }

      return { success: true, data: response }
    } catch (err) {
      console.error('Error creating employee:', err)
      return { success: false, data: null }
    }
  }

  const updateEmployee = async (id: number, employeeData: UpdateEmployeeRequest) => {
    try {
      const response = await put<Employee>(`/employees/${id}`, employeeData, {
        showSuccessToast: true,
        successMessage: 'Employee updated successfully',
        showErrorToast: true
      })

      if (response) {
        const index = employees.value.findIndex(employee => employee.id === id)
        if (index !== -1) {
          employees.value[index] = response
        }
        currentEmployee.value = response
      }

      return { success: true, data: response }
    } catch (err) {
      console.error('Error updating employee:', err)
      return { success: false, data: null }
    }
  }

  const deleteEmployee = async (id: number) => {
    try {
      const response = await del(`/employees/${id}`, {
        showSuccessToast: true,
        successMessage: 'Employee deleted successfully',
        showErrorToast: true
      })

      // Remove from local state
      employees.value = employees.value.filter(employee => employee.id !== id)
      if (currentEmployee.value?.id === id) {
        currentEmployee.value = null
      }
      totalEmployees.value = Math.max(0, totalEmployees.value - 1)

      // Refresh stats after deleting employee
      await refreshEmployeeStats()

      return { success: true, data: response }
    } catch (err) {
      console.error('Error deleting employee:', err)
      return { success: false, data: null }
    }
  }

  const changeEmployeeStatus = async (id: number, status: EmployeeStatus) => {
    try {
      const response = await post<Employee>(`/employees/${id}/status?status=${status}`, {}, {
        showSuccessToast: true,
        successMessage: `Employee status changed to ${status}`,
        showErrorToast: true
      })

      if (response) {
        const index = employees.value.findIndex(employee => employee.id === id)
        if (index !== -1) {
          employees.value[index] = response
        }
        if (currentEmployee.value?.id === id) {
          currentEmployee.value = response
        }
        // Refresh stats after status change
        await refreshEmployeeStats()
      }

      return { success: true, data: response }
    } catch (err) {
      console.error('Error changing employee status:', err)
      return { success: false, data: null }
    }
  }

  const searchEmployees = async (query: string, params: EmployeeSearchParams = {}) => {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('query', query)

      if (params.skip !== undefined) queryParams.append('skip', params.skip.toString())
      if (params.limit !== undefined) queryParams.append('limit', params.limit.toString())

      const url = `/employees/search?${queryParams.toString()}`

      const response = await get<Employee[]>(url, {
        showErrorToast: true
      })

      if (response) {
        employees.value = response
        totalEmployees.value = response.length
      }

      return response
    } catch (err) {
      console.error('Error searching employees:', err)
      return null
    }
  }

  const countEmployees = async (status?: EmployeeStatus) => {
    try {
      const queryParams = new URLSearchParams()
      if (status) queryParams.append('status', status)

      const url = `/employees/count${queryParams.toString() ? '?' + queryParams.toString() : ''}`

      const response = await get<number>(url, {
        showErrorToast: true
      })

      return response
    } catch (err) {
      console.error('Error counting employees:', err)
      return null
    }
  }

  // Utility methods
  const formatEmployeeDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatEmployeePhone = (phone: string) => {
    // Basic phone formatting - can be enhanced based on requirements
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  const getEmployeeStatusSeverity = (status: EmployeeStatus) => {
    const severities = {
      ACTIVE: 'success',
      INACTIVE: 'danger',
      PROBATION: 'warning',
      ON_LEAVE: 'info',
      RETIRED: 'secondary',
      TERMINATED: 'danger'
    }
    return severities[status]
  }

  const getEmployeeStatusLabel = (status: EmployeeStatus) => {
    const labels = {
      ACTIVE: 'Active',
      INACTIVE: 'Inactive',
      PROBATION: 'Probation',
      ON_LEAVE: 'On Leave',
      RETIRED: 'Retired',
      TERMINATED: 'Terminated'
    }
    return labels[status]
  }

  return {
    // State
    employees,
    currentEmployee,
    totalEmployees,
    currentPage,
    totalPages,
    loading,
    error,

    // Stats state
    employeeStats,
    statsLoading,

    // Computed
    activeEmployees,
    inactiveEmployees,

    // Methods
    fetchEmployees,
    getEmployees: fetchEmployees,
    getEmployee,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    changeEmployeeStatus,
    searchEmployees,
    countEmployees,
    fetchEmployeeStats,
    refreshEmployeeStats,

    // Utilities
    getEmployeeDisplayInfo,
    formatEmployeeDate,
    formatEmployeePhone,
    getEmployeeStatusSeverity,
    getEmployeeStatusLabel
  }
}
