<script setup lang="ts">
import { ref } from 'vue'

type Schedule = {
  id: number
  title: string
  time: string
  note?: string
}

const todays = ref<Schedule[]>([
  { id: 1, title: 'Medication — John Doe', time: '10:00 AM', note: 'AM dose' },
  { id: 2, title: 'Check-in — Mary Smith', time: '11:30 AM' }
])

const upcoming = ref<Schedule[]>([
  { id: 3, title: 'Therapy — Alan Brown', time: 'Tomorrow 9:00 AM' },
  { id: 4, title: 'Follow-up — Carla Lee', time: 'Tomorrow 1:00 PM' }
])

const inProgress = ref<Schedule[]>([
  { id: 6, title: 'Medication — Sarah Wilson', time: 'Started 2:30 PM' }
])

const completed = ref<Schedule[]>([
  { id: 5, title: 'Bathing — Jane Williams', time: 'Yesterday 2:00 PM' }
])
</script>

<template>
  <div class="schedule-cards">
    <!-- Today's Schedule Card -->
    <div class="schedule-card bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col gap-4">
      <div class="flex items-center mb-4 pl-2">
        <div class="bg-blue-50 border border-blue-200 rounded-none p-2 mr-6 mt-1 w-10 h-10 flex items-center justify-center">
          <i class="pi pi-calendar text-blue-600 text-xl"></i>
        </div>
        <h3 class="text-sm font-medium text-gray-700">Today's Schedule</h3>
      </div>
      <div class="text-4xl font-bold text-gray-900 pl-2">{{ todays.length }}</div>
    </div>

    <!-- Upcoming Card -->
    <div class="schedule-card bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col gap-4">
      <div class="flex items-center mb-4 pl-2">
        <div class="bg-orange-50 border border-orange-200 rounded-none p-2 mr-6 mt-1 w-10 h-10 flex items-center justify-center">
          <i class="pi pi-clock text-orange-600 text-xl"></i>
        </div>
        <h3 class="text-sm font-medium text-gray-700">Upcoming</h3>
      </div>
      <div class="text-4xl font-bold text-gray-900 pl-2">{{ upcoming.length }}</div>
    </div>

    <!-- In Progress Card -->
    <div class="schedule-card bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col gap-4">
      <div class="flex items-center mb-4 pl-2">
        <div class="bg-purple-50 border border-purple-200 rounded-none p-2 mr-6 mt-1 w-10 h-10 flex items-center justify-center">
          <i class="pi pi-play-circle text-purple-600 text-xl"></i>
        </div>
        <h3 class="text-sm font-medium text-gray-700">In Progress</h3>
      </div>
      <div class="text-4xl font-bold text-gray-900 pl-2">{{ inProgress.length }}</div>
    </div>

    <!-- Completed Card -->
    <div class="schedule-card bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col gap-4">
      <div class="flex items-center mb-4 pl-2">
        <div class="bg-green-50 border border-green-200 rounded-none p-2 mr-6 mt-1 w-10 h-10 flex items-center justify-center">
          <i class="pi pi-check-circle text-green-600 text-xl"></i>
        </div>
        <h3 class="text-sm font-medium text-gray-700">Completed</h3>
      </div>
      <div class="text-4xl font-bold text-gray-900 pl-2">{{ completed.length }}</div>
    </div>
  </div>
</template>

<style scoped>
.schedule-cards {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  scroll-snap-type: x proximity;
  -ms-overflow-style: none; /* IE/Edge */
  scrollbar-width: none; /* Firefox */
}

.schedule-cards::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}

.schedule-card {
  min-width: 16rem;
  scroll-snap-align: start;
  flex-shrink: 0;
}

@media (min-width: 768px) {
  .schedule-cards {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .schedule-card {
    min-width: auto;
  }
}

@media (min-width: 1024px) {
  .schedule-cards {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>