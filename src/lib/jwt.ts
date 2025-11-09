/**
 * JWT Utility functions for decoding tokens (client-side only, for display purposes)
 * Note: This is not for verification, only for extracting payload data
 */

export interface JWTPayload {
  sub: string // subject (user ID or email)
  type: string // token type (access or refresh)
  iat: number // issued at
  exp: number // expires at
  jti?: string // JWT ID (for refresh tokens)
}

/**
 * Decode a JWT token and return the payload
 * @param token JWT token string
 * @returns Decoded payload or null if invalid
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    const payload = parts[1]
    // Add padding if needed
    const paddedPayload = payload.padEnd(payload.length + (4 - payload.length % 4) % 4, '=')
    
    const decoded = atob(paddedPayload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded) as JWTPayload
  } catch (error) {
    console.error('Error decoding JWT:', error)
    return null
  }
}

/**
 * Check if a JWT token is expired
 * @param token JWT token string
 * @returns true if expired, false if valid, null if can't decode
 */
export function isTokenExpired(token: string): boolean | null {
  const payload = decodeJWT(token)
  if (!payload) {
    return null
  }

  const currentTime = Math.floor(Date.now() / 1000)
  return payload.exp < currentTime
}

/**
 * Get the expiration time of a JWT token
 * @param token JWT token string
 * @returns Date object or null if can't decode
 */
export function getTokenExpiration(token: string): Date | null {
  const payload = decodeJWT(token)
  if (!payload) {
    return null
  }

  return new Date(payload.exp * 1000)
}

/**
 * Get the subject (user identifier) from a JWT token
 * @param token JWT token string
 * @returns subject string or null if can't decode
 */
export function getTokenSubject(token: string): string | null {
  const payload = decodeJWT(token)
  return payload?.sub || null
}