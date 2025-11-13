// Utility to get employee_id from auth store or composable
import { useAuth } from '@/composables/useAuth';



import { ref, computed } from 'vue'
import { useApi } from './useApi'
import type {
  Certificate,
  CreateCertificateRequest,
  CertificateListResponse
} from '@/views/CertificateManagement/types'

export function useCertificates() {
  // Debug: Log current user structure from useAuth
  try {
    const { user } = useAuth();
    console.log('Current user from useAuth:', user?.value);
  } catch (e) {
    console.log('Could not log user from useAuth:', e);
  }
  // Utility: Get employee_id from user session (if available)
  const getEmployeeId = () => {
    // Try to get from useAuth composable (user is likely a ComputedRef)
    try {
      const { user } = useAuth();
      // user is a ComputedRef<{ id: number; ... } | null>
      return user?.value?.id || null;
    } catch {
      return null;
    }
  };
  // Create employee certificate (POST)
  // NOTE: After calling initCertificateUpload, use the upload_url from the response as s3_key in the POST body for createEmployeeCertificate.
  // No PATCH is needed after init. If you skip this, s3_key will be empty and the backend will not have the file location.
  // If the backend expects only the S3 key (path), use file_name instead. Adjust as per backend contract.
  interface CreateEmployeeCertificatePayload {
    employee_id: number;
    certificate_id: number;
    certificate_no: string;
    issued_on: string;
    expires_on: string;
    status: string;
    s3_key: string; // Store upload_url if backend expects full URL, or file_name if only key is needed
    content_type: string;
    created_at: string;
    note?: string;
  }
  // Dropdown options for certificate id selection
  // (Removed duplicate declaration of certificateIdOptions)
  const createEmployeeCertificate = async (payload: CreateEmployeeCertificatePayload) => {
    try {
      const response = await post(`/employee-certificate/${payload.employee_id}/certificates`, payload, {
        showSuccessToast: true,
        successMessage: 'Certificate created successfully',
        showErrorToast: true
      })
      return response
    } catch (err) {
      console.error('Error creating employee certificate:', err)
      return null
    }
  }
  // PATCH update employee certificate
  const updateEmployeeCertificate = async (employee_id: number, certificate_id: number, payload: Partial<CreateEmployeeCertificatePayload>, employee_cert_id?: number) => {
    try {
      let url = `/employee-certificate/${employee_id}/certificates/${certificate_id}`
      if (employee_cert_id) {
        url += `?employee_cert_id=${employee_cert_id}`
      }
      const response = await patch(url, payload, {
        showSuccessToast: true,
        successMessage: 'Certificate updated successfully',
        showErrorToast: true
      })
      return response
    } catch (err) {
      console.error('Error updating employee certificate:', err)
      return null
    }
  }
  // Backend certificate upload flow
  const initCertificateUpload = async (employee_id: number, certificate_id: number, content_type: string) => {
    try {
      const response = await post(`/employee-certificate/${certificate_id}/init-upload`, {
        employee_id,
        certificate_id,
        content_type
      })
      return response
    } catch (err) {
      console.error('Error initializing certificate upload:', err)
      return null
    }
  }

  const uploadCertificateFile = async (upload_url: string, file: File, content_type: string) => {
    try {
      // Use PUT for S3 upload, skip auth headers
      const response = await put(upload_url, file, {
        customHeaders: { 'Content-Type': content_type },
        customMethod: 'PUT',
        skipAuth: true
      })
      return response
    } catch (err) {
      console.error('Error uploading certificate file to S3:', err)
      return null
    }
  }
  const { get, post, put, patch, delete: del, loading, error } = useApi()

  const certificates = ref<Certificate[]>([])
  const currentCertificate = ref<Certificate | null>(null)

  // Computed properties
  const activeCertificates = computed(() =>
    certificates.value.filter(cert => cert.status === 'active')
  )

  const expiredCertificates = computed(() =>
    certificates.value.filter(cert => cert.status === 'expired')
  )

  const revokedCertificates = computed(() =>
    certificates.value.filter(cert => cert.status === 'revoked')
  )

  // API Methods
  const fetchCertificates = async (page = 1, limit = 10) => {
    try {
      const response = await get<CertificateListResponse>(`/certificates/?page=${page}&limit=${limit}`, {
        showErrorToast: true
      })

      if (response) {
        // Handle both array response and paginated response
        if (Array.isArray(response)) {
          certificates.value = response
        } else {
          certificates.value = response.certificates || []
        }
      }

      return response
    } catch (err) {
      console.error('Error fetching certificates:', err)
      return null
    }
  }

  const getCertificate = async (id: number) => {
    try {
      const response = await get<Certificate>(`/certificates/${id}`, {
        showErrorToast: true
      })

      if (response) {
        currentCertificate.value = response
      }

      return response
    } catch (err) {
      console.error('Error fetching certificate:', err)
      return null
    }
  }

  const createCertificate = async (certificateData: CreateCertificateRequest) => {
    try {
      const response = await post<Certificate>('/certificates/', certificateData, {
        showSuccessToast: true,
        successMessage: 'Certificate created successfully',
        showErrorToast: true
      })

      if (response) {
        certificates.value.push(response)
      }

      return response
    } catch (err) {
      console.error('Error creating certificate:', err)
      return null
    }
  }

  const updateCertificate = async (id: number, certificateData: Partial<CreateCertificateRequest>) => {
    try {
      const response = await patch<Certificate>(`/certificates/${id}`, certificateData, {
        showSuccessToast: true,
        successMessage: 'Certificate updated successfully',
        showErrorToast: true
      })

      // For updates, success is indicated by no error being thrown, not by response content
      // The response might be null but operation was successful (200 status)
      if (response) {
        const index = certificates.value.findIndex(cert => cert.id === id)
        if (index !== -1) {
          certificates.value[index] = response
        }
        currentCertificate.value = response
      }

      // Return a success indicator - if we reach here without error, operation succeeded
      return { success: true, data: response }
    } catch (err) {
      console.error('Error updating certificate:', err)
      return { success: false, data: null }
    }
  }

  const fetchActiveCertificates = async () => {
    try {
      const response = await get<Certificate[]>('/certificates/active', {
        showErrorToast: true
      })

      if (response) {
        // Update the certificates list with active ones or store separately
        certificates.value = response
      }

      return response
    } catch (err) {
      console.error('Error fetching active certificates:', err)
      return null
    }
  }

  const activateCertificate = async (id: number) => {
    try {
      const response = await get<Certificate>(`/certificates/${id}/activate`, {
        showSuccessToast: true,
        successMessage: 'Certificate activated successfully',
        showErrorToast: true
      })

      if (response) {
        const index = certificates.value.findIndex(cert => cert.id === id)
        if (index !== -1) {
          certificates.value[index] = response
        }
        if (currentCertificate.value?.id === id) {
          currentCertificate.value = response
        }
      }

      return response
    } catch (err) {
      console.error('Error activating certificate:', err)
      return null
    }
  }

  const deleteCertificate = async (id: number) => {
    try {
      const response = await del(`/certificates/${id}`, {
        showSuccessToast: true,
        successMessage: 'Certificate deleted successfully',
        showErrorToast: true
      })

      // For deletes, success is indicated by no error being thrown
      // Remove from local state regardless of response content
      certificates.value = certificates.value.filter(cert => cert.id !== id)
      if (currentCertificate.value?.id === id) {
        currentCertificate.value = null
      }

      // Return success indicator - if we reach here without error, operation succeeded
      return { success: true, data: response }
    } catch (err) {
      console.error('Error deleting certificate:', err)
      return { success: false, data: null }
    }
  }

  // Utility methods
  const getCertificateStatusSeverity = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'expired':
        return 'warning';
      case 'revoked':
        return 'danger';
      case 'pending':
        return 'info';
      default:
        return 'info';
    }
  }

  // Dropdown options for certificate id selection
  const certificateIdOptions = computed(() =>
    certificates.value.map((cert: Certificate) => ({ label: cert.name, value: cert.id }))
  );

  const getExpiryDate = (certificate: Certificate) => {
    if (!certificate.validity_months) return null

    const createdDate = new Date(certificate.created_at)
    const expiryDate = new Date(createdDate)
    expiryDate.setMonth(createdDate.getMonth() + certificate.validity_months)

    return expiryDate
  }

  return {
    // State
    certificates,
    currentCertificate,
    loading,
    error,

    // Computed
    activeCertificates,
    expiredCertificates,
    revokedCertificates,
    certificateIdOptions,

    // Methods
    fetchCertificates,
    fetchActiveCertificates,
    getCertificate,
    createCertificate,
    updateCertificate,
    activateCertificate,
    deleteCertificate,
    initCertificateUpload,
    uploadCertificateFile,
    updateEmployeeCertificate,
    createEmployeeCertificate,

  // Utilities
  getCertificateStatusSeverity,
  getExpiryDate
  ,getEmployeeId
  }
}
