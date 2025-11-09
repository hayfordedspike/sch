export interface AuthVerificationData {
  email: string
  resendAttempts: number
  lastResendTime?: Date
}

export interface ResendResponse {
  success: boolean
  message: string
  nextResendTime?: Date
}