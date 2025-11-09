import { ref, computed } from 'vue'
import { useApi } from './useApi'
import type { 
  Certificate, 
  CreateCertificateRequest, 
  CertificateListResponse 
} from '@/views/CertificateManagement/types'

export function useCertificates() {
  const { get, post, put, delete: del, loading, error } = useApi()
  
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
      const response = await put<Certificate>(`/certificates/${id}`, certificateData, {
        showSuccessToast: true,
        successMessage: 'Certificate updated successfully',
        showErrorToast: true
      })
      
      if (response) {
        const index = certificates.value.findIndex(cert => cert.id === id)
        if (index !== -1) {
          certificates.value[index] = response
        }
        currentCertificate.value = response
      }
      
      return response
    } catch (err) {
      console.error('Error updating certificate:', err)
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
      
      if (response !== null) {
        certificates.value = certificates.value.filter(cert => cert.id !== id)
        if (currentCertificate.value?.id === id) {
          currentCertificate.value = null
        }
      }
      
      return response
    } catch (err) {
      console.error('Error deleting certificate:', err)
      return null
    }
  }

  // Utility methods
  const getCertificateStatusSeverity = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success'
      case 'expired':
        return 'warning'
      case 'revoked':
        return 'danger'
      case 'pending':
        return 'info'
      default:
        return 'secondary'
    }
  }

  const formatCertificateDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const isExpiringSoon = (certificate: Certificate, daysThreshold = 30) => {
    if (!certificate.validity_months) return false
    
    const createdDate = new Date(certificate.created_at)
    const expiryDate = new Date(createdDate)
    expiryDate.setMonth(createdDate.getMonth() + certificate.validity_months)
    
    const today = new Date()
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    return daysUntilExpiry <= daysThreshold && daysUntilExpiry > 0
  }

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
    
    // Methods
    fetchCertificates,
    getCertificate,
    createCertificate,
    updateCertificate,
    deleteCertificate,
    
    // Utilities
    getCertificateStatusSeverity,
    formatCertificateDate,
    isExpiringSoon,
    getExpiryDate
  }
}