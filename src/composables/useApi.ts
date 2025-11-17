import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import api from '../axios.config'
import type { AxiosResponse, AxiosError } from 'axios'

export interface ApiState {
  loading: boolean
  error: string | null
}

export function useApi() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const toast = useToast()

  // Helper function to decode JWT token
  const decodeJWT = (token: string) => {
    try {
      const parts = token.split('.')
      if (parts.length === 3) {
        return JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
      }
    } catch (e) {
      console.error('Error decoding token:', e)
    }
    return null
  }

  // Helper function to check if token is expired
  const isTokenExpired = (token: string): boolean => {
    const payload = decodeJWT(token)
    if (!payload || !payload.exp) return true
    return payload.exp < Math.floor(Date.now() / 1000)
  }

  // Ensure we have a valid token before making requests
  const ensureValidToken = async (): Promise<void> => {
    const token = localStorage.getItem('token')
    const refreshToken = localStorage.getItem('refreshToken')

    // If no token, redirect to login
    if (!token) {
      window.location.href = '/signin'
      throw new Error('No authentication token found')
    }

    // If token is expired, try to refresh
    if (isTokenExpired(token)) {
      if (!refreshToken) {
        localStorage.removeItem('token')
        window.location.href = '/signin'
        throw new Error('Token expired and no refresh token available')
      }

      try {
        const response = await api.post('/auth/refresh', { refresh_token: refreshToken })
        const { access_token, refresh_token: newRefreshToken } = response.data

        localStorage.setItem('token', access_token)
        localStorage.setItem('refreshToken', newRefreshToken)
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError)
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        window.location.href = '/signin'
        throw new Error('Failed to refresh token')
      }
    }
  }

  const handleApiError = (err: unknown): string => {
    if (err instanceof Error) {
      return err.message
    }
    return 'An unexpected error occurred'
  }

  const makeRequest = async <T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    options: {
      showSuccessToast?: boolean
      successMessage?: string
      showErrorToast?: boolean
      customErrorHandler?: (error: AxiosError) => void
      skipAuth?: boolean
    } = {}
  ): Promise<T | null> => {
    const {
      showSuccessToast = false,
      successMessage = 'Operation completed successfully',
      showErrorToast = true,
      customErrorHandler,
      skipAuth = false
    } = options

    loading.value = true
    error.value = null

    try {
      // Ensure we have a valid token before making the request
      if (!skipAuth) {
        await ensureValidToken()
      }

      const response = await requestFn()
      
      if (showSuccessToast) {
        toast.add({
          severity: 'success',
          summary: 'Success',
          detail: successMessage,
          life: 3000
        })
      }

      return response.data
    } catch (err: unknown) {
      const axiosError = err as AxiosError
      
      if (customErrorHandler) {
        customErrorHandler(axiosError)
      } else {
        const errorMessage = handleApiError(err)
        error.value = errorMessage

        if (showErrorToast) {
          toast.add({
            severity: 'error',
            summary: 'Error',
            detail: errorMessage,
            life: 5000
          })
        }
      }

      return null
    } finally {
      loading.value = false
    }
  }

  const get = <T>(url: string, options = {}) => {
    return makeRequest<T>(() => api.get(url), options)
  }

  const post = <T>(url: string, data?: unknown, options = {}) => {
    return makeRequest<T>(() => api.post(url, data), options)
  }

  const put = <T>(url: string, data?: unknown, options = {}) => {
    return makeRequest<T>(() => api.put(url, data), options)
  }

  const del = <T>(url: string, options = {}) => {
    return makeRequest<T>(() => api.delete(url), options)
  }

  const patch = <T>(url: string, data?: unknown, options = {}) => {
    return makeRequest<T>(() => api.patch(url, data), options)
  }

  return {
    loading,
    error,
    makeRequest,
    get,
    post,
    put,
    delete: del,
    patch
  }
}