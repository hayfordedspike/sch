# Authentication Protection Implementation

## Overview
All pages in the application are now protected by authentication guards. Users must be logged in with a valid, non-expired token to access any dashboard routes.

## Authentication Guard Features

### 🛡️ **Route Protection**
- **Protected Routes**: All dashboard routes (/, /clients, /roster, /team, /settings, /certificate-management)
- **Public Routes**: /signin, /register, /auth/verify, /404
- **Guest-Only Routes**: /signin, /register (redirect to dashboard if already authenticated)

### 🔄 **Automatic Token Management**
- **Token Validation**: Checks if tokens are present and not expired
- **Automatic Refresh**: Attempts to refresh expired tokens before redirecting
- **Session Persistence**: Maintains authentication state across browser refresh
- **Cleanup**: Automatically clears invalid tokens

### 🎯 **Smart Redirects**
- **Protected Route Access**: Redirects to /signin with return URL
- **Post-Login Redirect**: Returns user to intended page after login
- **Authenticated User Redirect**: Prevents access to login/register when already logged in

## Implementation Details

### Router Guards (`src/router/index.ts`)
```typescript
router.beforeEach(async (to, from, next) => {
  // 1. Check authentication status
  // 2. Validate token expiration  
  // 3. Attempt token refresh if needed
  // 4. Redirect appropriately
})
```

### Route Metadata (`src/router/routes.ts`)
```typescript
{
  path: "/dashboard-route",
  meta: { 
    requiresAuth: true,    // Requires authentication
    guestOnly: false,      // Allows authenticated users
    layout: "dashboard",   // Uses dashboard layout
    title: "Page Title"    // Page title
  }
}
```

### Authentication Composable (`src/composables/useAuth.ts`)
```typescript
export function useAuth() {
  return {
    isAuthenticated,     // Reactive auth status
    user,               // Current user data
    hasExpiredToken,    // Token expiration check
    canRefreshToken,    // Refresh token availability
    logout,             // Logout function
    hasRole             // Role-based permissions
  }
}
```

## Protected Routes

### ✅ **Dashboard Routes (Require Authentication)**
- `/` - Dashboard
- `/clients` - Clients Management
- `/roster` - Roster Management  
- `/team` - Team Management
- `/settings` - Application Settings
- `/certificate-management` - Certificate Management

### 🌐 **Public Routes (No Authentication Required)**
- `/signin` - Sign In Page
- `/register` - Registration Page
- `/auth/verify` - Email Verification
- `/404` - Not Found Page

### 👤 **Guest-Only Routes (Redirect if Authenticated)**
- `/signin` - Redirects to dashboard if logged in
- `/register` - Redirects to dashboard if logged in

## Authentication Flow

### 1. **Initial Page Load**
```
1. User navigates to protected route
2. Router guard checks authentication
3. If not authenticated: redirect to /signin?redirect=/intended-route
4. If authenticated but token expired: attempt refresh
5. If refresh succeeds: continue to route
6. If refresh fails: redirect to /signin
```

### 2. **Login Process**
```
1. User submits login form
2. Store tokens and user data
3. Check for redirect query parameter
4. Navigate to intended route or dashboard
5. Show success notification
```

### 3. **Automatic Token Refresh**
```
1. Router detects expired token
2. Attempts refresh using refresh token
3. Updates stored tokens if successful
4. Continues navigation if refresh succeeds
5. Redirects to login if refresh fails
```

### 4. **Logout Process**
```
1. Clear all tokens from store and localStorage
2. Reset authentication state
3. Redirect to signin page
4. Show logout confirmation
```

## Session Management

### 🔄 **Persistent Authentication**
- Tokens stored in localStorage and Pinia store
- Authentication state restored on browser refresh
- Automatic token validation on app initialization
- Background user profile fetching

### ⏰ **Token Lifecycle**
- **Access Token**: ~2 months validity
- **Refresh Token**: ~7 days validity  
- **Automatic Refresh**: Before token expiration
- **Cleanup**: Invalid tokens removed automatically

### 🔒 **Security Features**
- JWT token validation and decoding
- Automatic logout on token/refresh failure
- Protected route access prevention
- Secure token storage (localStorage)

## User Interface Integration

### **Navbar Authentication Display**
- Shows current user name and role
- Displays user initials/avatar
- Provides logout functionality
- Role-based UI elements

### **Loading States**
- Authentication checking indicator
- Smooth transitions between auth states
- Background token refresh (no UI interruption)

### **Error Handling**
- Toast notifications for auth events
- Graceful handling of expired sessions
- Clear error messages for users

## Testing Authentication

### **Manual Testing Scenarios**

1. **Direct URL Access**: 
   - Try accessing `/clients` without login → Should redirect to `/signin?redirect=/clients`

2. **Login Redirect**:
   - Login after redirect → Should return to `/clients`

3. **Token Expiration**:
   - Let token expire → Should auto-refresh or redirect to login

4. **Browser Refresh**:
   - Refresh page while logged in → Should maintain authentication

5. **Logout**:
   - Click logout → Should clear session and redirect to signin

6. **Double Login Prevention**:
   - Try accessing `/signin` while logged in → Should redirect to dashboard

### **Dashboard Demo Features**
- Real-time token information display
- Manual token refresh testing
- Token expiration status
- User profile data viewing

## Configuration

### **Environment Variables**
```env
VITE_BACKEND_URL=https://av-scheduler-backend-b4bc486519f2.herokuapp.com
```

### **Token Storage Keys**
```javascript
localStorage.getItem('token')        // Access token
localStorage.getItem('refreshToken') // Refresh token  
```

## Error Scenarios Handled

1. **No Token**: Redirect to login
2. **Expired Token + Valid Refresh**: Auto-refresh and continue
3. **Expired Token + Invalid Refresh**: Logout and redirect
4. **Invalid Token Format**: Clear tokens and redirect
5. **Network Errors**: Graceful fallback with user notification
6. **Malformed JWT**: Token validation and cleanup

This authentication system ensures that your application is secure by default, with all routes protected unless explicitly marked as public. Users get a seamless experience with automatic token management and intelligent redirects.