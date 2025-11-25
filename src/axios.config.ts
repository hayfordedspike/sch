import axios, { AxiosError } from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
})

// Track if we're currently refreshing to avoid multiple refresh attempts
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })
  
  failedQueue = []
}

// Request interceptor
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token')

  // Debug: log the token value
  console.debug('[API] Token from localStorage:', token)

  // List of endpoints that do NOT require Authorization
  const authEndpoints = ['auth/login', 'auth/register', 'auth/refresh']
  // Normalize URL to ignore trailing slashes and query params for matching
  const urlPath = config.url?.split('?')[0]?.replace(/\/$/, '') || ''
  const isAuthEndpoint = authEndpoints.some(endpoint => urlPath.includes(endpoint))

  if (!isAuthEndpoint) {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('[API] Forced Authorization header for:', config.url)
    } else {
      console.warn('[API] No token found for authenticated request to:', config.url)
    }
  }

  // Debug: log the final headers
  console.debug('[API] Request headers:', config.headers)

  return config
})

// Response interceptor for handling token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`
          }
          return api(originalRequest)
        }).catch(err => {
          return Promise.reject(err)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('refreshToken')
      
      if (!refreshToken) {
        // No refresh token, redirect to login
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        window.location.href = '/signin'
        return Promise.reject(error)
      }

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/auth/refresh`,
          { refresh_token: refreshToken },
          {
            headers: {
              'accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        )

        const { access_token, refresh_token } = response.data
        
        // Update stored tokens
        localStorage.setItem('token', access_token)
        localStorage.setItem('refreshToken', refresh_token)
        
        // Update the failed request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`
        }
        
        processQueue(null, access_token)
        
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null)
        
        // Refresh failed, clear tokens and redirect
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        window.location.href = '/signin'
        
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
