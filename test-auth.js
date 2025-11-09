// Simple test to check if user is authenticated
const token = localStorage.getItem('token')
const refreshToken = localStorage.getItem('refreshToken')

console.log('Token exists:', !!token)
console.log('Refresh token exists:', !!refreshToken)

if (token) {
  try {
    // Basic JWT decode (just for testing)
    const parts = token.split('.')
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
      console.log('Token payload:', payload)
      console.log('Token expires at:', new Date(payload.exp * 1000))
      console.log('Token is expired:', payload.exp < Date.now() / 1000)
    }
  } catch (e) {
    console.log('Error decoding token:', e)
  }
}

// Test API call
if (token) {
  fetch('https://av-scheduler-backend-b4bc486519f2.herokuapp.com/users/me', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'accept': 'application/json'
    }
  })
  .then(response => {
    console.log('API Response status:', response.status)
    return response.json()
  })
  .then(data => {
    console.log('API Response data:', data)
  })
  .catch(error => {
    console.log('API Error:', error)
  })
}