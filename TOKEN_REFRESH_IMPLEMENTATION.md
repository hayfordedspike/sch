# Token Refresh Implementation Summary

## Overview
This implementation provides automatic token refresh functionality to handle token expiration seamlessly in the Vue.js application.

## Key Features

### 1. Auth Store Enhancements (`src/stores/auth.ts`)
- Added `refreshToken` state management
- Enhanced token storage to include both access and refresh tokens
- Implemented `refreshAccessToken()` method for manual token refresh
- Updated login flow to store both tokens
- Updated logout to clear both tokens

### 2. Axios Interceptor (`src/axios.config.ts`)
- **Request Interceptor**: Automatically attaches Bearer token to requests (except auth endpoints)
- **Response Interceptor**: Handles 401 errors by:
  - Automatically refreshing expired tokens
  - Queuing failed requests during refresh
  - Retrying queued requests with new token
  - Redirecting to login if refresh fails

### 3. API Composable (`src/composables/useApi.ts`)
- Provides convenient wrapper for API calls
- Integrates with toast notifications
- Automatic error handling
- Support for custom success/error handlers

### 4. Error Handling
The system handles various error scenarios:

#### Registration Errors:
- **422 Validation Error**: Extracts and displays field-specific errors
- **500 Internal Server Error**: Shows user-friendly server error message
- **Success**: Shows success toast and redirects to verification

#### Login Errors:
- **401 Unauthorized**: "Invalid credentials" message
- **422 Validation Error**: Field validation errors
- **Success**: Shows success toast and redirects to dashboard

#### Token Refresh Errors:
- **400 Bad Request**: "Error decoding token" - redirects to login
- **Success**: Updates tokens and retries original request

## Implementation Details

### Automatic Token Refresh Flow:
1. User makes API request
2. If token is expired (401 response), interceptor catches it
3. System checks for refresh token
4. If refresh token exists:
   - Calls `/auth/refresh` endpoint
   - Updates stored tokens
   - Retries original request with new token
5. If refresh fails or no refresh token:
   - Clears all tokens
   - Redirects to login page

### Manual Token Refresh:
- Available via `authStore.refreshAccessToken()`
- Can be called manually for testing
- Returns boolean indicating success/failure

### Token Storage:
- Access token: localStorage key `token`
- Refresh token: localStorage key `refreshToken`
- Persisted via Pinia plugin for state restoration

## Usage Examples

### 1. Making API Calls (Automatic Refresh)
```typescript
import { useApi } from '@/composables/useApi'

const api = useApi()

// This will automatically refresh token if needed
const data = await api.get('/protected-endpoint')
```

### 2. Manual Token Refresh
```typescript
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const success = await authStore.refreshAccessToken()
if (success) {
  console.log('Token refreshed successfully')
} else {
  console.log('Refresh failed, user needs to login')
}
```

### 3. Checking Token Status
```typescript
const authStore = useAuthStore()

console.log('Has access token:', !!authStore.getToken())
console.log('Has refresh token:', !!authStore.getRefreshToken())
console.log('Is authenticated:', authStore.isAuthenticated)
```

## Testing

### Dashboard Demo Section
The dashboard includes a demo section showing:
- Current token status
- Manual refresh token testing
- Simulated API call testing
- Real-time authentication state

### Test Scenarios:
1. **Valid Token**: API calls work normally
2. **Expired Token**: Automatic refresh and retry
3. **Invalid Refresh Token**: Automatic logout and redirect
4. **Network Errors**: Proper error handling and user feedback

## Security Considerations

1. **Token Storage**: Tokens stored in localStorage (consider httpOnly cookies for production)
2. **Automatic Cleanup**: Failed refresh attempts clear all tokens
3. **Redirect Protection**: Automatic redirect to login prevents unauthorized access
4. **Queue Management**: Prevents multiple simultaneous refresh attempts

## Configuration

### Environment Variables:
- `VITE_BACKEND_URL`: Backend API base URL

### API Endpoints:
- Login: `POST /auth/login` (form-data)
- Register: `POST /auth/register` (JSON)
- Refresh: `POST /auth/refresh` (JSON)

## Error Response Formats

### Validation Error (422):
```json
{
  "detail": [
    {
      "loc": ["field_name", 0],
      "msg": "Error message",
      "type": "validation_type"
    }
  ]
}
```

### Simple Error:
```json
{
  "detail": "Error message"
}
```

### Success Response:
```json
{
  "access_token": "new_access_token",
  "refresh_token": "new_refresh_token"
}
```

This implementation ensures a seamless user experience with automatic token management and proper error handling throughout the application.