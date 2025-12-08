<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden">
    <!-- House Header -->
    <div class="p-4 border-b border-gray-100">
      <div class="flex items-start justify-between">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
            <span class="text-white font-bold text-lg">
              {{ getHouseInitials(house) }}
            </span>
          </div>
          <div>
            <h3 class="font-semibold text-lg text-gray-900 mb-1">{{ house.name }}</h3>
            <div class="flex items-center text-gray-600 text-sm">
              <i class="pi pi-map-marker mr-1 text-red-400"></i>
              <span>{{ house.city }}, {{ house.region }}</span>
            </div>
          </div>
        </div>
        
        <!-- Actions Dropdown -->
        <div class="relative">
          <GlobalButton
            icon="pi pi-ellipsis-v"
            text
            rounded
            size="sm"
            @click="toggleDropdown"
            aria-label="House actions"
          />
          <div
            v-if="showDropdown"
            class="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[150px]"
            @click.stop
          >
            <div class="py-1">
              <button
                @click="handleEdit"
                class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
              >
                <i class="pi pi-pencil mr-2 text-blue-500"></i>
                Edit House
              </button>
              <button
                @click="handleViewTeams"
                class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
              >
                <i class="pi pi-users mr-2 text-green-500"></i>
                View Teams
              </button>
              <hr class="my-1">
              <button
                @click="handleDelete"
                class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
              >
                <i class="pi pi-trash mr-2"></i>
                Delete House
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- House Details -->
    <div class="p-4 space-y-3">
      <!-- Address -->
      <div class="flex items-start">
        <i class="pi pi-home mr-2 text-blue-500 mt-0.5 flex-shrink-0"></i>
        <div class="text-sm text-gray-700">
          <div>{{ house.address_line1 }}</div>
        </div>
      </div>

      <!-- Postal Code -->
      <div v-if="house.postal_code" class="flex items-center">
        <i class="pi pi-envelope mr-2 text-gray-400"></i>
        <span class="text-sm text-gray-700">{{ house.postal_code }}</span>
      </div>

      <!-- Note -->
      <div v-if="house.note" class="border-t border-gray-100 pt-3 mt-3">
        <div class="flex items-start">
          <i class="pi pi-comment mr-2 text-purple-500 mt-0.5 flex-shrink-0"></i>
          <p class="text-sm text-gray-600 italic">"{{ house.note }}"</p>
        </div>
      </div>
    </div>

    <!-- Team Count Badge -->
    <div class="px-4 pb-4">
      <div class="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
        <i class="pi pi-users mr-1"></i>
        <span>0 Teams</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import GlobalButton from '@/components/shared/GlobalButton.vue'
import type { House } from '../types'

interface Props {
  house: House
}

interface Emits {
  (e: 'edit', house: House): void
  (e: 'delete', house: House): void
  (e: 'view-teams', house: House): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const showDropdown = ref(false)

const getHouseInitials = (house: House): string => {
  return house.name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const handleEdit = () => {
  showDropdown.value = false
  emit('edit', props.house)
}

const handleDelete = () => {
  showDropdown.value = false
  emit('delete', props.house)
}

const handleViewTeams = () => {
  showDropdown.value = false
  emit('view-teams', props.house)
}

// Close dropdown when clicking outside
const handleClickOutside = () => {
  showDropdown.value = false
}

// Add event listener when component mounts
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Custom card styles */
</style>