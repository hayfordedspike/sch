<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl w-full text-center">
      <!-- Logo -->
      <div class="mb-8 animate-bounce">
        <div class="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg logo-glow interactive-pulse cursor-pointer"
             @click="goHome">
          <span class="text-3xl font-bold text-white">SC</span>
        </div>
      </div>

      <!-- Animated 404 Text -->
      <div class="relative mb-8">
        <!-- Background decorative elements -->
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="w-64 h-64 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full opacity-20 animate-pulse"></div>
        </div>
        
        <!-- Main 404 text -->
        <div class="relative">
          <h1 class="text-8xl sm:text-9xl lg:text-[12rem] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient leading-none">
            404
          </h1>
          
          <!-- Floating particles -->
          <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div class="particle particle-1 w-3 h-3 bg-blue-400 rounded-full opacity-60"></div>
            <div class="particle particle-2 w-2 h-2 bg-purple-400 rounded-full opacity-60"></div>
            <div class="particle particle-3 w-4 h-4 bg-pink-400 rounded-full opacity-60"></div>
            <div class="particle particle-4 w-2 h-2 bg-indigo-400 rounded-full opacity-60"></div>
            <div class="particle particle-5 w-3 h-3 bg-violet-400 rounded-full opacity-60"></div>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div class="mb-8 space-y-4">
        <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 animate-fade-in-up">
          Oops! Page Not Found
        </h2>
        <p class="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
          The page you're looking for seems to have vanished into the digital void. 
          Don't worry, even the best explorers sometimes take a wrong turn!
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-400">
        <Button
          @click="goHome"
          class="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-0"
          label="Take Me Home"
          icon="pi pi-home"
        >
          <div class="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        </Button>
        
        <Button
          @click="goBack"
          outlined
          class="group relative overflow-hidden border-2 border-gray-300 text-gray-700 font-semibold py-3 px-8 rounded-full transition-all duration-300 hover:border-purple-500 hover:text-purple-600 hover:bg-purple-50 hover:scale-105"
          label="Go Back"
          icon="pi pi-arrow-left"
          severity="secondary"
        >
          <div class="absolute inset-0 bg-purple-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
        </Button>
      </div>

      <!-- Additional Help -->
      <div class="mt-12 animate-fade-in-up animation-delay-600">
        <p class="text-sm text-gray-500 mb-4">Need help? Try these popular sections:</p>
        <div class="flex flex-wrap justify-center gap-3">
          <span 
            v-for="link in quickLinks" 
            :key="link.name"
            @click="navigateTo(link.path)"
            class="group inline-flex items-center px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200 text-sm text-gray-600 hover:text-purple-600 hover:border-purple-300 hover:shadow-md transition-all duration-300 cursor-pointer hover:-translate-y-0.5 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50"
          >
            <i :class="link.icon" class="mr-2 transition-transform duration-300 group-hover:scale-110"></i>
            {{ link.name }}
          </span>
        </div>
      </div>

      <!-- Fun Animation Element -->
      <div class="mt-16 animate-fade-in-up animation-delay-800">
        <div class="flex justify-center">
          <div class="relative">
            <div class="w-32 h-32 border-4 border-purple-200 rounded-full animate-spin-slow"></div>
            <div class="absolute inset-4 border-4 border-blue-200 rounded-full animate-reverse-spin"></div>
            <div class="absolute inset-8 w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'

defineOptions({ name: 'NotFoundView' })

const router = useRouter()

const quickLinks = [
  { name: 'Dashboard', path: '/', icon: 'pi pi-home' },
  { name: 'Clients', path: '/clients', icon: 'pi pi-users' },
  { name: 'Team', path: '/team', icon: 'pi pi-users' },
  { name: 'Settings', path: '/settings', icon: 'pi pi-cog' }
]

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  if (window.history.length > 2) {
    router.go(-1)
  } else {
    router.push('/')
  }
}

const navigateTo = (path: string) => {
  router.push(path)
}

// Ensure smooth page entry
onMounted(() => {
  document.body.classList.add('page-loaded')
})
</script>

<style scoped>
/* Gradient animation */
@keyframes gradient {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.animate-gradient {
  background-size: 200% 200%;
  animation: gradient 3s ease-in-out infinite;
}

/* Fade in up animation */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
}

.animation-delay-200 {
  animation-delay: 0.2s;
  opacity: 0;
}

.animation-delay-400 {
  animation-delay: 0.4s;
  opacity: 0;
}

.animation-delay-600 {
  animation-delay: 0.6s;
  opacity: 0;
}

.animation-delay-800 {
  animation-delay: 0.8s;
  opacity: 0;
}

/* Floating particles animation */
@keyframes float {
  0%, 100% {
    transform: translateY(0px) translateX(0px) rotate(0deg);
  }
  25% {
    transform: translateY(-20px) translateX(10px) rotate(90deg);
  }
  50% {
    transform: translateY(-40px) translateX(-10px) rotate(180deg);
  }
  75% {
    transform: translateY(-20px) translateX(15px) rotate(270deg);
  }
}

.particle {
  position: absolute;
  animation: float 6s ease-in-out infinite;
}

.particle-1 {
  top: 20%;
  left: 10%;
  animation-delay: -0.5s;
  animation-duration: 7s;
}

.particle-2 {
  top: 40%;
  right: 15%;
  animation-delay: -2s;
  animation-duration: 5s;
}

.particle-3 {
  bottom: 30%;
  left: 20%;
  animation-delay: -1s;
  animation-duration: 6s;
}

.particle-4 {
  top: 60%;
  right: 25%;
  animation-delay: -3s;
  animation-duration: 8s;
}

.particle-5 {
  bottom: 20%;
  right: 10%;
  animation-delay: -1.5s;
  animation-duration: 4s;
}

/* Slow spin animation */
@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin-slow {
  animation: spin-slow 8s linear infinite;
}

/* Reverse spin animation */
@keyframes reverse-spin {
  from {
    transform: rotate(360deg);
  }
  to {
    transform: rotate(0deg);
  }
}

.animate-reverse-spin {
  animation: reverse-spin 6s linear infinite;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .particle {
    display: none; /* Hide particles on small screens for better performance */
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .animate-bounce,
  .animate-pulse,
  .animate-spin-slow,
  .animate-reverse-spin,
  .animate-gradient,
  .particle {
    animation: none;
  }
  
  .animate-fade-in-up {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .bg-gradient-to-br {
    background: linear-gradient(to bottom right, rgb(15, 23, 42), rgb(30, 41, 59), rgb(15, 23, 42));
  }
}

/* Smooth loading animation */
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.shimmer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  animation: shimmer 2s infinite;
}

/* Improved hover effects */
.hover-lift {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Glow effect for logo */
@keyframes glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
  }
  50% {
    box-shadow: 0 0 30px rgba(147, 51, 234, 0.7), 0 0 40px rgba(59, 130, 246, 0.3);
  }
}

.logo-glow {
  animation: glow 3s ease-in-out infinite;
}

/* Interactive pulse */
@keyframes interactive-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
}

.interactive-pulse:hover {
  animation: interactive-pulse 0.6s ease-in-out;
}
</style>
