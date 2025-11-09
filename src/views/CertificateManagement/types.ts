export interface Certificate {
  id: number;
  code: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  validity_months: number;
  renewal_window_days: number;
  grace_period_days: number;
  status: string;
}

export interface CreateCertificateRequest {
  code: string;
  name: string;
  description: string;
  validity_months: number;
  renewal_window_days: number;
  grace_period_days: number;
}

export interface UpdateCertificateRequest extends Partial<CreateCertificateRequest> {
  id: number;
}

export interface CertificateState {
  certificates: Certificate[];
  loading: boolean;
  error: string | null;
}

export interface CertificateListResponse {
  certificates: Certificate[];
  total: number;
  page: number;
  limit: number;
}