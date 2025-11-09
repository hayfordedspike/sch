
<script setup lang="ts">
import { ref } from 'vue'
import RosterCalendar from '@/components/RosterCalendar.vue'
import RosterFilterCard from '@/components/RosterFilterCard.vue'
import ScheduleModal from '@/components/ScheduleModal.vue'

defineOptions({ name: 'RosterView' })

const selectedMember = ref<string>('all')
const selectedMonth = ref<number>(new Date().getMonth())
const calendarView = ref<'day' | 'week'>('day')

const showScheduleModal = ref(false)

// Dummy staff options for modal dropdown
const staffOptions = [
  { name: 'Alice Johnson', email: 'alice.johnson@carecompany.com' },
  { name: 'Bob Smith', email: 'bob.smith@carecompany.com' },
  { name: 'Carol Lee', email: 'carol.lee@carecompany.com' },
  { name: 'David Chen', email: 'david.chen@carecompany.com' },
  { name: 'Emma Wilson', email: 'emma.wilson@carecompany.com' },
  { name: 'Frank Rodriguez', email: 'frank.rodriguez@carecompany.com' }
]

function handleAddNewSchedlue() {
  showScheduleModal.value = true
}

function handleScheduleSubmit() {
  // Here you would add logic to save the new schedule
  // For now, just close the modal
  showScheduleModal.value = false
}
</script>

<template>
   <div class="w-full mb-8">
      <div class="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white rounded-xl  p-6">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <!-- Title and Stats -->
            <div>
              <h1 class="text-3xl font-bold text-gray-900 flex items-center">
                <i class="pi pi-calendar mr-3 text-blue-600"></i>
                Roster Management
              </h1>
              <p class="text-gray-600 mt-2">
               Visual Schedule Planning And Team Roster
              </p>

            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3">
              <Button
                @click="handleAddNewSchedlue"
                icon="pi pi-plus"
                label="Create New Schedule"
                class="bg-blue-600 hover:bg-blue-700 border-0 text-white"
              />
              <ScheduleModal
                :visible="showScheduleModal"
                :staffOptions="staffOptions"
                @update:visible="showScheduleModal = $event"
                @submit="handleScheduleSubmit"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
	<div class="p-4">
		<RosterFilterCard
			class="mb-6"
			v-model:selectedFilter="selectedMember"
			v-model:currentDate="selectedMonth"
			v-model:calendarView="calendarView"
		/>
		<RosterCalendar
			:selectedMember="selectedMember"
			:selectedMonth="selectedMonth"
			:calendarView="calendarView"
		/>
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			<!-- Roster widgets/cards will go here -->
		</div>
	</div>
</template>

<style scoped>

</style>
