import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { isTokenExpired } from '@/lib/jwt'
import routes from "@/router/routes.ts";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
})

// Authentication guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Check if user has valid token
  const hasValidToken = () => {
    const token = authStore.getToken()
    if (!token) return false
    
    // Check if token is expired
    try {
      return !isTokenExpired(token)
    } catch {
      return false
    }
  }

  const isAuthenticated = authStore.isAuthenticated && hasValidToken()
  const requiresAuth = to.meta?.requiresAuth !== false // Default to true for dashboard routes
  const isGuestOnly = to.meta?.guestOnly === true

  // If user is authenticated and trying to access guest-only routes (login, register)
  if (isAuthenticated && isGuestOnly) {
    next({ name: 'Dashboard' })
    return
  }

  // If user is not authenticated and trying to access protected routes
  if (!isAuthenticated && requiresAuth) {
    // Clear any invalid tokens
    if (authStore.getToken() && !hasValidToken()) {
      authStore.logout()
    }
    
    next({ 
      name: 'SignIn',
      query: { redirect: to.fullPath } // Save intended destination
    })
    return
  }

  // If user is authenticated but token is expired, try to refresh
  if (isAuthenticated && authStore.getToken() && isTokenExpired(authStore.getToken()!)) {
    const refreshToken = authStore.getRefreshToken()
    
    if (refreshToken) {
      try {
        const refreshed = await authStore.refreshAccessToken()
        if (!refreshed) {
          // Refresh failed, redirect to login
          next({ 
            name: 'SignIn',
            query: { redirect: to.fullPath }
          })
          return
        }
      } catch (error) {
        console.error('Token refresh failed:', error)
        authStore.logout()
        next({ 
          name: 'SignIn',
          query: { redirect: to.fullPath }
        })
        return
      }
    } else {
      // No refresh token, logout and redirect
      authStore.logout()
      next({ 
        name: 'SignIn',
        query: { redirect: to.fullPath }
      })
      return
    }
  }

  // All checks passed, proceed to route
  next()
})

export default router
