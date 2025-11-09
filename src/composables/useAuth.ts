import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { isTokenExpired } from '@/lib/jwt'

/**
 * Authentication composable for checking auth status throughout the app
 */
export function useAuth() {
  const authStore = useAuthStore()

  // Check if user has a valid, non-expired token
  const isAuthenticated = computed(() => {
    const token = authStore.getToken()
    const storeAuth = authStore.isAuthenticated
    
    if (!token || !storeAuth) {
      return false
    }

    try {
      return !isTokenExpired(token)
    } catch (error) {
      console.error('Error checking token expiration:', error)
      return false
    }
  })

  // Check if token exists but is expired
  const hasExpiredToken = computed(() => {
    const token = authStore.getToken()
    if (!token) return false
    
    try {
      return isTokenExpired(token)
    } catch {
      return false
    }
  })

  // Check if refresh token is available
  const canRefreshToken = computed(() => {
    return !!authStore.getRefreshToken()
  })

  // Get current user info
  const user = computed(() => authStore.getUser())

  // Get authentication loading state
  const isLoading = computed(() => authStore.isLoading())

  // Get authentication error
  const error = computed(() => authStore.getError())

  // Logout function
  const logout = async () => {
    await authStore.logout()
  }

  // Refresh token function
  const refreshToken = async () => {
    return await authStore.refreshAccessToken()
  }

  // Check if user has specific role/permission
  const hasRole = (role: 'admin' | 'user' | 'superuser') => {
    const currentUser = authStore.getUser()
    if (!currentUser) return false

    switch (role) {
      case 'superuser':
      case 'admin':
        return currentUser.is_superuser
      case 'user':
        return currentUser.is_active
      default:
        return false
    }
  }

  return {
    // State
    isAuthenticated,
    hasExpiredToken,
    canRefreshToken,
    user,
    isLoading,
    error,
    
    // Actions
    logout,
    refreshToken,
    
    // Utilities
    hasRole
  }
}