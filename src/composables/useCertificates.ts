



// Utility to get employee_id from auth store or composable
import { useAuth } from '@/composables/useAuth';
import { useToast } from 'primevue/usetoast';

import { ref, computed } from 'vue'
import { useApi } from './useApi'
import type {
  Certificate,
  CreateCertificateRequest,
  CertificateListResponse
} from '@/views/CertificateManagement/types'

export function useCertificates() {
  const toast = useToast();
  // --- Types ---
  interface CreateEmployeeCertificatePayload {
    employee_id: number;
    certificate_id: number;
    certificate_no: string;
    issued_on: string;
    expires_on: string;
    status: string;
    s3_key: string; // Store file_name from init-upload response
    content_type: string;
    created_at: string;
    note?: string;
  }

  // Response type for initCertificateUpload
  interface InitCertificateUploadResponse {
    upload_url: string;
    file_name: string;
    [key: string]: string | number | boolean | undefined;
  }

  // --- State ---
  const certificates = ref<Certificate[]>([])
  const currentCertificate = ref<Certificate | null>(null)

  // --- API Methods ---
  const { get, post, put, patch, delete: del, loading, error } = useApi()

  // --- Employee Certificate Methods ---
  const createEmployeeCertificate = async (payload: CreateEmployeeCertificatePayload) => {
    try {
      const payloadWithHardcodedId = { ...payload, employee_id: 34 };
      const response = await post(`/employee-certificate/34/certificates`, payloadWithHardcodedId, {
        showSuccessToast: true,
        successMessage: 'Certificate created successfully',
        showErrorToast: true
      })
      return response;
    } catch (err) {
      // Check for specific backend error detail
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      if (detail === 'Employee already has an active certificate of this type') {
        if (toast) {
          toast.add({ severity: 'error', summary: 'Error', detail, life: 4000 });
        } else {
          console.error(detail);
        }
      } else {
        if (toast) {
          toast.add({ severity: 'error', summary: 'Error', detail: 'Error creating employee certificate', life: 4000 });
        } else {
          console.error('Error creating employee certificate:', err);
        }
      }
      return null;
    }
  }

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

  // --- Upload/Init Methods ---
  const initCertificateUpload = async (
    employee_id: number,
    certificate_id: number,
    content_type: string
  ): Promise<InitCertificateUploadResponse | null> => {
    try {
      const response = await post(`/employee-certificate/init-upload`, {
        employee_id: 34,
        certificate_id,
        content_type
      })
      return response as InitCertificateUploadResponse;
    } catch (err) {
      console.error('Error initializing certificate upload:', err)
      return null;
    }
  };

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

  // --- Employee Certificate Download/Fetch ---
  const fetchEmployeeCertificateDownloadUrl = async (employee_certificate_id: number) => {
    try {
      const response = await get(`/employee-certificate/${employee_certificate_id}/init-download?employee_certificate_id=${employee_certificate_id}`, {
        showErrorToast: true
      });
      return response;
    } catch (err) {
      console.error('Error fetching employee certificate download URL:', err);
      return null;
    }
  };

  const fetchEmployeeCertificates = async (employee_id: number, include_expired = false) => {
    try {
      const response = await get(`/employee-certificate/${employee_id}/certificates?include_expired=${include_expired}`, {
        showErrorToast: true
      });
      return response;
    } catch (err) {
      console.error('Error fetching employee certificates:', err);
      return null;
    }
  };

  // --- Main Certificate API Methods ---
  const fetchCertificates = async (page = 1, limit = 10) => {
    try {
      const response = await get<CertificateListResponse>(`/certificates/?page=${page}&limit=${limit}`, {
        showErrorToast: true
      })
      if (response) {
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

  const createCertificate = async (
    certificateData: CreateCertificateRequest,
    upload_url: string,
    file: File,
    content_type: string
  ) => {
    try {
      // Always upload the file first and wait for 200 response
      const putRes = await uploadCertificateFile(upload_url, file, content_type)
      if (!putRes) {
        throw new Error('File upload failed')
      }
      // Then create the certificate record
      const response = await post<Certificate>('/certificates/', certificateData, {
        showSuccessToast: true,
        successMessage: 'Certificate created successfully',
        showErrorToast: true
      })
      // Check for 200 status (success) rather than response data, since response may be empty
      // Assuming post returns data on success, but if empty, don't push to array
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
      if (response) {
        const index = certificates.value.findIndex(cert => cert.id === id)
        if (index !== -1) {
          certificates.value[index] = response
        }
        currentCertificate.value = response
      }
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
      certificates.value = certificates.value.filter(cert => cert.id !== id)
      if (currentCertificate.value?.id === id) {
        currentCertificate.value = null
      }
      return { success: true, data: response }
    } catch (err) {
      console.error('Error deleting certificate:', err)
      return { success: false, data: null }
    }
  }

  // --- Computed Properties ---
  const activeCertificates = computed(() =>
    certificates.value.filter(cert => cert.status === 'active')
  )
  const expiredCertificates = computed(() =>
    certificates.value.filter(cert => cert.status === 'expired')
  )
  const revokedCertificates = computed(() =>
    certificates.value.filter(cert => cert.status === 'revoked')
  )
  const certificateIdOptions = computed(() =>
    certificates.value.map((cert: Certificate) => ({ label: cert.name, value: cert.id }))
  );

  // --- Utility Methods ---
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
  const getExpiryDate = (certificate: Certificate) => {
    if (!certificate.validity_months) return null
    const createdDate = new Date(certificate.created_at)
    const expiryDate = new Date(createdDate)
    expiryDate.setMonth(createdDate.getMonth() + certificate.validity_months)
    return expiryDate
  }

  // --- Helper: Complete employee certificate upload and record update flow ---
  async function uploadAndPatchEmployeeCertificate(
    employee_cert_id: number,
    certificate_id: number,
    file: File,
    content_type: string,
    patchPayload: Partial<CreateEmployeeCertificatePayload>
  ) {
    const initRes = await initCertificateUpload(34, certificate_id, content_type);
    if (!initRes || typeof initRes.upload_url !== 'string' || typeof initRes.file_name !== 'string') {
      throw new Error('Failed to initialize certificate upload');
    }
    const putRes = await uploadCertificateFile(initRes.upload_url, file, content_type);
    if (!putRes) {
      throw new Error('File upload failed');
    }
    const patchRes = await updateEmployeeCertificate(34, certificate_id, {
      ...patchPayload,
      s3_key: initRes.file_name
    }, employee_cert_id);
    if (!patchRes) {
      throw new Error('Failed to patch employee certificate record');
    }
    return patchRes;
  }

  // --- Utility: Get employee_id from user session ---
  const getEmployeeId = () => {
    try {
      const { user } = useAuth();
      return user?.value?.id || null;
    } catch {
      return null;
    }
  };

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
    fetchEmployeeCertificates,
    fetchEmployeeCertificateDownloadUrl,
    uploadAndPatchEmployeeCertificate,

    // Utilities
    getCertificateStatusSeverity,
    getExpiryDate,
    getEmployeeId
  }
}
