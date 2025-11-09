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
    } = {}
  ): Promise<T | null> => {
    const {
      showSuccessToast = false,
      successMessage = 'Operation completed successfully',
      showErrorToast = true,
      customErrorHandler
    } = options

    loading.value = true
    error.value = null

    try {
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