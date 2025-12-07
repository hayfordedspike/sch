import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios, { AxiosError } from 'axios'
import { decodeJWT, getTokenSubject } from '@/lib/jwt'
import type { RegistrationApiPayload, RegistrationResponse } from '@/views/Registration/types'
import type { SignInFormData } from '@/views/SignIn/types'

// Get backend URL from environment variables
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://av-scheduler-backend-b4bc486519f2.herokuapp.com'

export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  is_superuser: boolean
  created_at?: string
  updated_at?: string
  last_login?: string
}

export interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
}

export interface RefreshTokenRequest {
  refresh_token: string
}

// Backend validation error structure
interface ValidationErrorDetail {
  loc: (string | number)[]
  msg: string
  type: string
}

// Backend error response structure
interface BackendError {
  detail: string | ValidationErrorDetail[]
}

const handleApiError = (err: unknown, defaultMessage: string): string => {
  if (err instanceof AxiosError) {
    const data = err.response?.data as BackendError

    // Handle validation errors (422)
    if (Array.isArray(data?.detail)) {
      const validationErrors = data.detail as ValidationErrorDetail[]
      // Extract and format validation error messages
      const errorMessages = validationErrors.map(error => error.msg).join(', ')
      return errorMessages || defaultMessage
    }

    // Handle simple error messages
    if (typeof data?.detail === 'string') {
      return data.detail
    }

    // Handle internal server error (500)
    if (err.response?.status === 500) {
      return 'Server error. Please try again later.'
    }

    // Handle unauthorized (401)
    if (err.response?.status === 401) {
      return 'Invalid credentials. Please check your email and password.'
    }

    return err.response?.data?.message || err.message || defaultMessage
  }
  return defaultMessage
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const isAuthenticated = ref<boolean>(false)
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // Utility to sync Pinia state and localStorage
  const syncSession = (newToken: string | null, newRefreshToken: string | null, newUser?: User | null) => {
    token.value = newToken
    refreshToken.value = newRefreshToken
    if (newUser !== undefined) {
      user.value = newUser
    }
    if (newToken) localStorage.setItem('token', newToken)
    else localStorage.removeItem('token')
    if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken)
    else localStorage.removeItem('refreshToken')
    if (newUser !== undefined) {
      if (newUser) localStorage.setItem('user', JSON.stringify(newUser))
      else localStorage.removeItem('user')
    }
  }

  // Initialize authentication state on store creation
  const initializeAuth = async () => {
    // Get tokens and user from localStorage (fallback if persistence fails)
    const storedToken = localStorage.getItem('token') || token.value
    const storedRefreshToken = localStorage.getItem('refreshToken') || refreshToken.value
    const storedUser = localStorage.getItem('user')
    let parsedUser: User | null = null
    if (storedUser) {
      try { parsedUser = JSON.parse(storedUser) } catch { parsedUser = null }
    }

    if (storedToken && storedRefreshToken) {
      syncSession(storedToken, storedRefreshToken, parsedUser)

      // Check if token is still valid
      try {
        const payload = decodeJWT(storedToken)
        if (payload && payload.exp > Math.floor(Date.now() / 1000)) {
          isAuthenticated.value = true
          // Try to fetch user profile in background
          await fetchUserProfile().catch(() => {
            // If profile fetch fails, token might be invalid
            console.warn('Failed to fetch user profile on initialization')
          })
        } else {
          // Token is expired, try to refresh
          const refreshSuccess = await refreshAccessToken()
          if (!refreshSuccess) {
            // Refresh failed, clear tokens
            await logout()
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        await logout()
      }
    }
  }

  // Actions
  const register = async (userData: RegistrationApiPayload): Promise<RegistrationResponse | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, userData, {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })

      const responseData: RegistrationResponse = response.data

      // Store user data
      user.value = {
        id: responseData.id,
        email: responseData.email,
        first_name: responseData.first_name,
        last_name: responseData.last_name,
        is_active: responseData.is_active,
        is_superuser: responseData.is_superuser,
        created_at: responseData.created_at,
        updated_at: responseData.updated_at,
        last_login: responseData.last_login
      }

      // Don't set authenticated yet - user needs to verify email
      isAuthenticated.value = false
      loading.value = false

      return responseData
    } catch (err: unknown) {
      loading.value = false
      const errorMessage = handleApiError(err, 'Registration failed')
      error.value = errorMessage
      return null
    }
  }

  const fetchUserProfile = async (): Promise<User | null> => {
    if (!token.value) {
      return null
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token.value}`,
          'accept': 'application/json'
        }
      })

      const userData = response.data
      user.value = {
        id: userData.id || 0,
        email: userData.email || '',
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        is_active: userData.is_active || false,
        is_superuser: userData.is_superuser || false,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
        last_login: userData.last_login
      }

      syncSession(token.value, refreshToken.value, user.value)

      return user.value
    } catch (err: unknown) {
      console.error('Failed to fetch user profile:', err)
      return null
    }
  }

  const signIn = async (credentials: SignInFormData): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      // Create form data for OAuth2 login endpoint
      const formData = new URLSearchParams()
      formData.append('grant_type', 'password')
      formData.append('username', credentials.email)
      formData.append('password', credentials.password)
      formData.append('scope', '')
      formData.append('client_id', '')
      formData.append('client_secret', '')

      const response = await axios.post(
        `${API_BASE_URL}/auth/login`,
        formData,
        {
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      )

      // Store token and user data from successful login
      const tokenData = response.data as TokenResponse
      // Extract user email from access token
      const userEmail = getTokenSubject(tokenData.access_token) || credentials.email

      // Store tokens immediately so subsequent profile fetch can use them
      syncSession(tokenData.access_token, tokenData.refresh_token)

      // Try to fetch full user profile, fallback to basic info from token
      let userProfile = await fetchUserProfile()
      if (!userProfile) {
        // Fallback user data if profile fetch fails
        userProfile = {
          id: 0,
          email: userEmail,
          first_name: '',
          last_name: '',
          is_active: true,
          is_superuser: false
        }

        syncSession(tokenData.access_token, tokenData.refresh_token, userProfile)
      }

      isAuthenticated.value = true
      // Debug: log token values after setting
      console.debug('[Auth] Token set after signIn:', localStorage.getItem('token'))
      console.debug('[Auth] RefreshToken set after signIn:', localStorage.getItem('refreshToken'))
    } catch (err: unknown) {
      const errorMessage = handleApiError(err, 'Sign in failed')
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  const logout = async (): Promise<void> => {
    // If we have a refresh token, call the backend logout endpoint
    if (refreshToken.value) {
      try {
        await axios.post(
          `${API_BASE_URL}/auth/logout`,
          { refresh_token: refreshToken.value },
          {
            headers: {
              'accept': '*/*',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token.value}`
            }
          }
        )
      } catch (error) {
        // Even if logout API fails, we should still clear local state
        console.error('Backend logout failed:', error)
      }
    }

    // Clear local state regardless of API call result
    syncSession(null, null, null)
    isAuthenticated.value = false
    error.value = null
    // Clear Pinia persisted state
    try {
      localStorage.removeItem('auth')
    } catch (storageError) {
      console.warn('Failed to clear localStorage:', storageError)
    }
  }

  const refreshAccessToken = async (): Promise<boolean> => {
    if (!refreshToken.value) {
      // No refresh token available, redirect to login
      await logout()
      return false
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        { refresh_token: refreshToken.value } as RefreshTokenRequest,
        {
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      )

      const tokenData = response.data as TokenResponse
      // Try to fetch user profile after refresh
      let userProfile: User | null = null
      try {
        userProfile = await fetchUserProfile()
      } catch (profileError) {
        console.warn('Failed to fetch user profile after token refresh:', profileError)
      }
      syncSession(tokenData.access_token, tokenData.refresh_token, userProfile)
      // Debug: log token values after refresh
      console.debug('[Auth] Token set after refresh:', localStorage.getItem('token'))
      console.debug('[Auth] RefreshToken set after refresh:', localStorage.getItem('refreshToken'))

      // Ensure user profile is up to date after refresh
      try {
        await fetchUserProfile()
      } catch (profileError) {
        console.warn('Failed to fetch user profile after token refresh:', profileError)
      }

      return true
    } catch (err: unknown) {
      console.error('Token refresh failed:', err)
      const errorMessage = handleApiError(err, 'Session expired. Please sign in again.')
      error.value = errorMessage

      // Refresh failed, logout user
      await logout()
      return false
    }
  }

  const clearError = (): void => {
    error.value = null
  }

  const setUser = (userData: Partial<User>): void => {
    if (user.value) {
      user.value = { ...user.value, ...userData }
    }
  }

  const resendVerificationEmail = async (email: string): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      await axios.post(
        `${API_BASE_URL}/auth/resend-verification`,
        { email },
        {
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      )
    } catch (err: unknown) {
      const errorMessage = handleApiError(err, 'Failed to resend verification email')
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  // Getters
  const getUser = () => user.value
  const getToken = () => token.value
  const getRefreshToken = () => refreshToken.value
  const isLoading = () => loading.value
  const getError = () => error.value

  // Check if current token is expired
  const isTokenExpired = (): boolean => {
    if (!token.value) return true

    const payload = decodeJWT(token.value)
    if (!payload) return true

    const currentTime = Math.floor(Date.now() / 1000)
    return payload.exp < currentTime
  }

  return {
    // State
    user,
    token,
    refreshToken,
    isAuthenticated,
    loading,
    error,

    // Actions
    register,
    signIn,
    logout,
    refreshAccessToken,
    fetchUserProfile,
    clearError,
    setUser,
    resendVerificationEmail,
    initializeAuth,

    // Getters
    getUser,
    getToken,
    getRefreshToken,
    isLoading,
    getError,
    isTokenExpired
  }
})
