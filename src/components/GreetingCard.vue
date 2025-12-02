<template>
  <Card class="greeting-card mb-6">
    <template #content>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <!-- Time-based image -->
          <div class="greeting-icon">
            <img :src="greetingImage" :alt="greetingAlt" class="w-full h-full object-cover rounded-full" />
          </div>
          
          <!-- Greeting content -->
          <div>
            <h1 class="text-2xl font-bold text-black mb-1">
              {{ greetingMessage }}
            </h1>
            <p class="text-black">
              Here is your overview for <br class="md:hidden">{{ formattedDate }}
            </p>
          </div>
        </div>
        
        <!-- Additional info or actions -->
        <div class="text-right flex-shrink-0">
          <div class="text-sm text-black mb-1">{{ currentTimeString }}</div>
          <div class="text-xs text-black">{{ dayOfWeek }}</div>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import Card from 'primevue/card'
import { capitalizeFirstLetter } from '@/lib/utils'

// Import time-based images
import amImage from '@/assets/am.png'
import afImage from '@/assets/af.png'
import pmImage from '@/assets/pm.png'

const authStore = useAuthStore()
const currentTime = ref(new Date())
let timeInterval: number | null = null

// Update time every second for live clock
onMounted(() => {
  timeInterval = window.setInterval(() => {
    currentTime.value = new Date()
  }, 1000) // Update every second
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})

// Get user's first name or fallback to "User"
const userName = computed(() => {
  const user = authStore.user
  if (user?.first_name) {
    return capitalizeFirstLetter(user.first_name) // Use first_name from backend with capitalization
  }
  if (user?.email) {
    return capitalizeFirstLetter(user.email.split('@')[0]) // Use email username as fallback with capitalization
  }
  return 'User'
})

// Generate greeting based on current time
const greetingMessage = computed(() => {
  const hour = currentTime.value.getHours()
  const name = userName.value
  
  if (hour >= 5 && hour < 12) {
    return `Good Morning, ${name}!`
  } else if (hour >= 12 && hour < 17) {
    return `Good Afternoon, ${name}!`
  } else if (hour >= 17 && hour < 21) {
    return `Good Evening, ${name}!`
  } else {
    return `Good Night, ${name}!`
  }
})

// Get appropriate image based on time
const greetingImage = computed(() => {
  const hour = currentTime.value.getHours()
  
  if (hour >= 5 && hour < 12) {
    return amImage // Morning (AM)
  } else if (hour >= 12 && hour < 17) {
    return afImage // Afternoon (AF)
  } else {
    return pmImage // Evening/Night (PM)
  }
})

// Get appropriate alt text for accessibility
const greetingAlt = computed(() => {
  const hour = currentTime.value.getHours()
  
  if (hour >= 5 && hour < 12) {
    return 'Morning greeting image'
  } else if (hour >= 12 && hour < 17) {
    return 'Afternoon greeting image'
  } else {
    return 'Evening/Night greeting image'
  }
})

// Format current date
const formattedDate = computed(() => {
  return currentTime.value.toLocaleDateString('en-CA') // YYYY-MM-DD format
})

// Current time string with seconds
const currentTimeString = computed(() => {
  return currentTime.value.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  })
})

// Day of week
const dayOfWeek = computed(() => {
  return currentTime.value.toLocaleDateString('en-US', {
    weekday: 'long'
  })
})
</script>

<style scoped>
.greeting-card {
  background: transparent;
  border: none;
  box-shadow: none;
}

:deep(.greeting-card .p-card-content) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  border-radius: 0.75rem;
  margin: 0.25rem;
  color: black;
}

.greeting-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  background: transparent;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: none;
  padding: 0;
}

.greeting-icon img {
  border-radius: 50%;
  background: transparent;
}

:deep(.greeting-card .p-card-content h1) {
  color: black;
  text-shadow: none;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  :deep(.greeting-card .p-card-content) {
    padding: 1.5rem;
  }
  
  .greeting-icon {
    width: 3rem;
    height: 3rem;
  }
  
  .greeting-icon img {
    border-radius: 50%;
    background: transparent;
  }
}

/* Animation for icon */
.greeting-icon {
  transition: transform 0.3s ease;
}

.greeting-icon:hover {
  transform: scale(1.05);
}

/* Pulse animation for time-sensitive greetings */
@keyframes gentle-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.greeting-icon img {
  animation: gentle-pulse 3s ease-in-out infinite;
}
</style>