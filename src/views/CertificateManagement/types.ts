export interface Certificate {
  id: number;
  code: string;
  name: string;
  certificate_id: string;
  issuing_organisation: string;
  issue_date: string;

  expiry_date: string;
  certificate_type: string;
  certificate_items: File[];
  validity_months: number;
  renewal_window_days: number;
  grace_period_days: number;
  status: string;
  created_at: string;
  updated_at: string;
  description: string;
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
