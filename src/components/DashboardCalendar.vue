<script setup lang="ts">
// Props for filter state
const props = defineProps<{ selectedMember: string; selectedMonth: number }>();


import { onMounted, ref, nextTick, computed } from 'vue'

// Reactive data
const employerColWidth = ref(200)

// Types
interface Schedule {
  start: string;
  end: string;
  task: string;
  location: string;
  client: string;
  month?: number;
}

interface StaffMember {
  name: string;
  email: string;
  position: string;
  img: string;
  schedules: Schedule[];
}

// Constants
const DEFAULT_USER_IMG = 'https://png.pngtree.com/png-clipart/20231019/original/pngtree-user-profile-avatar-png-image_13369991.png'

// Color palette for schedule blocks
const STAFF_COLORS = [
  { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', accent: 'bg-blue-500' },
  { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900', accent: 'bg-green-500' },
  { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-900', accent: 'bg-purple-500' },
  { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-900', accent: 'bg-amber-500' },
  { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-900', accent: 'bg-rose-500' },
  { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-900', accent: 'bg-teal-500' },
  { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-900', accent: 'bg-indigo-500' },
  { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-900', accent: 'bg-emerald-500' }
]

// Enhanced dummy data with realistic schedules that fit within time ranges
// Dummy data with month property for each schedule
const originalStaffSchedules: StaffMember[] = [
  {
    name: 'Alice Johnson',
    email: 'alice.johnson@carecompany.com',
    position: 'Senior Caregiver',
    img: DEFAULT_USER_IMG,
    schedules: [
      { start: '8:00 AM', end: '10:30 AM', task: 'Morning Care Routine', location: 'Joyce Residence', client: 'Mrs. Joyce', month: 10 },
      { start: '2:00 PM', end: '4:00 PM', task: 'Physical Therapy Session', location: 'Smith Residence', client: 'Mr. Smith', month: 10 },
      { start: '9:00 AM', end: '11:00 AM', task: 'Special Care', location: 'Joyce Residence', client: 'Mrs. Joyce', month: 9 }
    ]
  },
  {
    name: 'Bob Smith',
    email: 'bob.smith@carecompany.com',
    position: 'Medication Specialist',
    img: DEFAULT_USER_IMG,
    schedules: [
      { start: '9:00 AM', end: '11:00 AM', task: 'Medication Administration', location: 'Brown Residence', client: 'Ms. Brown', month: 10 },
      { start: '3:00 PM', end: '5:00 PM', task: 'Follow-up Assessment', location: 'Wilson Residence', client: 'Mr. Wilson', month: 10 },
      { start: '1:00 PM', end: '2:00 PM', task: 'Consultation', location: 'Brown Residence', client: 'Ms. Brown', month: 9 }
    ]
  },
  {
    name: 'Carol Lee',
    email: 'carol.lee@carecompany.com',
    position: 'Physical Therapist',
    img: DEFAULT_USER_IMG,
    schedules: [
      { start: '10:00 AM', end: '12:00 PM', task: 'Therapy Session', location: 'Davis Center', client: 'Multiple Clients', month: 10 },
      { start: '1:30 PM', end: '3:30 PM', task: 'Mobility Training', location: 'Rehab Center', client: 'Group Session', month: 10 }
    ]
  },
  {
    name: 'David Chen',
    email: 'david.chen@carecompany.com',
    position: 'Home Care Assistant',
    img: DEFAULT_USER_IMG,
    schedules: [
      { start: '7:30 AM', end: '9:30 AM', task: 'Morning Routine Assistance', location: 'Taylor Home', client: 'Mr. Taylor', month: 10 },
      { start: '1:00 PM', end: '3:00 PM', task: 'Meal Preparation', location: 'Anderson Residence', client: 'Anderson Family', month: 10 },
      { start: '4:00 PM', end: '6:00 PM', task: 'Evening Care', location: 'Garcia Residence', client: 'Mrs. Garcia', month: 10 }
    ]
  },
  {
    name: 'Emma Wilson',
    email: 'emma.wilson@carecompany.com',
    position: 'Nursing Assistant',
    img: DEFAULT_USER_IMG,
    schedules: [
      { start: '8:30 AM', end: '11:30 AM', task: 'Patient Monitoring', location: 'General Hospital', client: 'Ward Patients', month: 10 },
      { start: '12:30 PM', end: '2:30 PM', task: 'Lunch Service', location: 'General Hospital', client: 'Ward Patients', month: 10 }
    ]
  },
  {
    name: 'Frank Rodriguez',
    email: 'frank.rodriguez@carecompany.com',
    position: 'Emergency Response',
    img: DEFAULT_USER_IMG,
    schedules: []
  }
];

// Sorting state
const sortOrder = ref<'asc' | 'desc'>('asc');

// Reactive sorted staff list
const staffSchedules = computed(() => {
  let filtered = [...originalStaffSchedules];
  // Filter by member
  if (props.selectedMember !== 'all') {
    filtered = filtered.filter(m => m.name === props.selectedMember);
  }
  // Filter schedules by month
  filtered = filtered.map(m => ({
    ...m,
    schedules: m.schedules.filter(s => typeof s.month === 'number' ? s.month === props.selectedMonth : true)
  }));
  // Sort
  const sorted = filtered.sort((a, b) => {
    if (sortOrder.value === 'asc') {
      return a.name.localeCompare(b.name);
    } else {
      return b.name.localeCompare(a.name);
    }
  });
  return sorted;
});

// Time slots: hourly intervals from 6am to 11:59pm
const allTimeSlots = computed(() => {
  return generateHourlySlots('6:00 AM', '11:59 PM');
});

function generateHourlySlots(startTime: string, endTime: string): string[] {
  const slots: string[] = [];
  let current = convertTimeToMinutes(startTime);
  const end = convertTimeToMinutes(endTime);

  // Ensure we don't exceed the end time
  while (current <= end) {
    const timeString = convertMinutesToTime(current);
    // Only add if it doesn't exceed 11:59 PM
    if (convertTimeToMinutes(timeString) <= end) {
      slots.push(timeString);
    }
    current += 60; // 1-hour intervals
  }
  return slots;
}

// Helper function to convert time string to minutes
function convertTimeToMinutes(timeStr: string): number {
  const [time, modifier] = timeStr.split(' ');
  const [hoursRaw, minutes] = time.split(':').map(Number);

  let hours = hoursRaw;

  if (modifier === 'PM' && hours !== 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

// Helper function to convert minutes to time string
function convertMinutesToTime(minutes: number): string {
  let hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const modifier = hours >= 12 ? 'PM' : 'AM';

  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;

  return `${hours}:${mins.toString().padStart(2, '0')} ${modifier}`;
}

// Auto-adjust column width based on content
onMounted(() => {
  nextTick(() => {
    const cells = document.querySelectorAll('.employer-cell');
    let maxWidth = 200;
    cells.forEach(cell => {
      const width = cell.getBoundingClientRect().width;
      if (width > maxWidth) maxWidth = width;
    });
    employerColWidth.value = Math.ceil(maxWidth) + 20; // Add some padding
  });
})

// Helper functions
function getScheduleBlock(staff: StaffMember, timeSlot: string): Schedule | null {
  const slotMinutes = convertTimeToMinutes(timeSlot);

  for (const schedule of staff.schedules) {
    const startMinutes = convertTimeToMinutes(schedule.start);
    const endMinutes = convertTimeToMinutes(schedule.end);

    // Check if current time slot falls within this schedule
    if (slotMinutes >= startMinutes && slotMinutes < endMinutes) {
      return schedule;
    }
  }
  return null;
}

function shouldRenderScheduleCell(staff: StaffMember, timeSlot: string): boolean {
  const schedule = getScheduleBlock(staff, timeSlot);
  if (!schedule) return true;

  // Only render at the start time of the schedule
  return schedule.start === timeSlot;
}

function getScheduleColspan(staff: StaffMember, timeSlot: string): number {
  const schedule = getScheduleBlock(staff, timeSlot);
  if (!schedule || schedule.start !== timeSlot) return 1;

  const startMinutes = convertTimeToMinutes(schedule.start);
  const endMinutes = convertTimeToMinutes(schedule.end);
  const slotDuration = 60; // 1-hour intervals

  const duration = endMinutes - startMinutes;
  const colspan = Math.ceil(duration / slotDuration);

  // Ensure the colspan doesn't extend beyond the last time slot
  const lastSlotMinutes = convertTimeToMinutes(allTimeSlots.value[allTimeSlots.value.length - 1]);
  const maxPossibleColspan = Math.ceil((lastSlotMinutes - startMinutes) / slotDuration);

  return Math.min(colspan, maxPossibleColspan);
}

function getStaffColorClass(staffIdx: number) {
  const color = STAFF_COLORS[staffIdx % STAFF_COLORS.length];
  return `${color.bg} ${color.border} ${color.text}`;
}



</script>

<template>
  <!-- Filter Controls removed; filtering is now via props -->
<div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-6">


  <!-- Schedule Grid -->
  <div class="overflow-x-auto">
      <div class="relative min-w-max">
        <!-- Current Time Indicator removed as requested -->


        <div
          class="absolute top-0 bottom-0 w-px bg-blue-500"
          :style="{ left: employerColWidth + 'px', zIndex: 1 }"
        ></div>

        <!-- Main Table -->
        <table class="min-w-full border-separate border-spacing-0">
          <thead>
            <tr>
              <th
                class="bg-gray-200 text-left px-6 py-4 font-semibold text-gray-700 border-b border-gray-200 rounded-tl-lg sticky left-0 z-10 cursor-pointer select-none flex items-center gap-2"
                @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'"
              >
                <span>Employee Name</span>
                <span>
                  <svg v-if="sortOrder === 'asc'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </th>
              <th
                v-for="timeSlot in allTimeSlots"
                :key="timeSlot"
                class="bg-gray-200 px-3 py-4 font-semibold text-gray-700 border-b border-gray-200 text-center min-w-[90px]"
                :class="{
                  'bg-blue-50': true,
                  'rounded-tr-lg': timeSlot === allTimeSlots[allTimeSlots.length - 1]
                }"
              >
                <div class="flex flex-col items-center">
                  <span class="text-xs font-bold text-gray-700">
                    {{ timeSlot.split(':')[0] }} {{ timeSlot.split(' ')[1] }}
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(staff, staffIdx) in staffSchedules"
              :key="staff.name"
              :class="staffIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'"
            >
              <!-- Staff Info Column -->
              <td
                class="px-6 py-4 border-b border-gray-100 font-medium text-gray-900 whitespace-nowrap employer-cell sticky left-0 z-10 bg-inherit"
                :style="{ width: employerColWidth + 'px' }"
              >
                <div class="flex items-center">
                  <div class="relative">
                    <img :src="staff.img" alt="Staff photo" class="w-12 h-12 rounded-full mr-4 border-2 border-white shadow-sm" />

                  </div>
                  <div class="flex flex-col">
                    <div class="text-sm font-semibold text-gray-900">{{ staff.name }}</div>
                    <div class="text-xs text-gray-500 mt-0.5">{{ staff.email }}</div>
                    <div
                      class="text-xs mt-2 px-3 py-1 rounded-full font-semibold inline-block max-w-fit"
                      :class="staff.schedules.length > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'"
                    >
                      {{ staff.position }}

                    </div>
                  </div>
                </div>
              </td>

              <!-- Time Slot Columns -->
              <template v-for="timeSlot in allTimeSlots" :key="timeSlot">
                <template v-if="shouldRenderScheduleCell(staff, timeSlot)">
                  <td
                    :colspan="getScheduleColspan(staff, timeSlot)"
                    class="px-2 py-2 border-b border-gray-100 text-center align-top"
                  >
                    <div
                      v-if="getScheduleBlock(staff, timeSlot)"
                      :class="[
                        getStaffColorClass(staffIdx),
                        'rounded-lg px-3 py-3 border text-left h-full flex flex-col justify-between shadow-sm'
                      ]"
                    >
                      <!-- Schedule Header -->
                      <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center gap-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6l4 2"/>
                          </svg>
                          <span class="font-semibold text-xs">
                            {{ getScheduleBlock(staff, timeSlot)?.start }} - {{ getScheduleBlock(staff, timeSlot)?.end }}
                          </span>
                        </div>
                      </div>

                      <!-- Schedule Content -->
                      <div class="space-y-1">
                        <div class="font-bold text-sm leading-tight">
                          {{ getScheduleBlock(staff, timeSlot)?.task }}
                        </div>
                        <div class="text-xs opacity-75 flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                          </svg>
                          {{ getScheduleBlock(staff, timeSlot)?.location }}
                        </div>

                      </div>
                    </div>

                    <!-- Empty State -->
                    <div v-else class="flex items-center justify-center h-full min-h-[80px]">
                      <span class="text-gray-400 text-xs italic">No Schedule</span>
                    </div>
                  </td>
                </template>
              </template>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Legend removed as requested -->
  </div>
</template>

<style scoped>
/* Ensure consistent column widths */
th, td {
  min-width: 90px;
}

/* Smooth transitions for interactive elements */
tr {
  transition: background-color 0.2s ease;
}

/* Improve table border appearance */
.border-separate {
  border-spacing: 0;
}

th, td {
  border-right: 1px solid #f3f4f6; /* Tailwind gray-100 */
}

th:last-child, td:last-child {
  border-right: none;
}

/* Sticky header and first column */
.sticky {
  position: sticky;
  background: inherit;
}

th.sticky {
  z-index: 20;
}

td.sticky {
  z-index: 10;
}
</style>
