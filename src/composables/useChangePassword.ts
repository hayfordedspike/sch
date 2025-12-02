import { useApi } from './useApi'

export interface ChangePasswordPayload {
  current_password: string
  new_password: string
}

export function useChangePassword() {
  const { post, loading: apiLoading, error: apiError } = useApi()

  const changePassword = async (payload: ChangePasswordPayload) => {
    const result = await post('/auth/change-password', payload, {
      showSuccessToast: true,
      successMessage: 'Password updated successfully',
      showErrorToast: true
    })

    return Boolean(result)
  }

  return {
    changePassword,
    loading: apiLoading,
    error: apiError
  }
}
