<script setup lang="ts">
// Props for filter state
const props = defineProps<{ selectedMember: string; selectedMonth: number }>();


import { onMounted, ref, nextTick, computed, watch } from 'vue'
import { useAssignments } from '@/composables/useAssignments'
import { useEmployees } from '@/composables/useEmployees'
import { useVisits } from '@/composables/useVisits'
import { useClients } from '@/composables/useClients'
import { useHouses } from '@/composables/useHouses'
import type { Assignment } from '@/views/Roster/types'
import type { Employee } from '@/views/Employees/types'
import type { Visit } from '@/views/Roster/types'
import type { Client } from '@/views/Clients/types'
import type { House } from '@/views/Houses/types'

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
  actualStart?: string | null;
  actualEnd?: string | null;
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

// Initialize composables
const { fetchAssignments, assignments, loading: assignmentsLoading } = useAssignments()
const { fetchEmployees, employees, loading: employeesLoading } = useEmployees()
const { fetchVisits, visits, loading: visitsLoading } = useVisits()
const { fetchClients, clients, loading: clientsLoading } = useClients()
const { fetchHouses, houses, loading: housesLoading } = useHouses()

// Sorting state
const sortOrder = ref<'asc' | 'desc'>('asc');

// Fetch data on mount and when props change
const fetchData = async () => {
  // Calculate date range for the selected month
  const currentYear = new Date().getFullYear()
  const startDate = new Date(currentYear, props.selectedMonth, 1).toISOString().split('T')[0]
  const endDate = new Date(currentYear, props.selectedMonth + 1, 0).toISOString().split('T')[0]

  // Fetch assignments for the selected month
  await fetchAssignments({
    start_date: startDate,
    end_date: endDate
  })

  // Fetch all employees
  await fetchEmployees()

  // Fetch all visits to get client/house details
  await fetchVisits()

  // Fetch clients and houses for name resolution
  await fetchClients()
  await fetchHouses()
}

// Watch for prop changes to refetch data
watch(() => [props.selectedMonth, props.selectedMember], fetchData, { immediate: true })

// Transform assignments to schedule format
const transformAssignmentsToSchedules = (assignments: Assignment[], employees: Employee[], visits: Visit[], clients: Client[], houses: House[]): StaffMember[] => {
  const employeeMap = new Map(employees.map(emp => [emp.id, emp]))
  const visitMap = new Map(visits.map(visit => [visit.id, visit]))
  const clientMap = new Map(clients.map(client => [client.id, client]))
  const houseMap = new Map(houses.map(house => [house.id, house]))

  // Group assignments by employee
  const employeeSchedules = new Map<number, Schedule[]>()

  assignments.forEach(assignment => {
    const employee = employeeMap.get(assignment.employee_id)
    const visit = visitMap.get(assignment.visit_id)
    if (!employee) return

    const scheduledStart = new Date(assignment.scheduled_start_at)
    const scheduledEnd = new Date(assignment.scheduled_end_at)
    const checkIn = assignment.check_in_at ? new Date(assignment.check_in_at) : null
    const checkOut = assignment.check_out_at ? new Date(assignment.check_out_at) : null

    const client = visit?.client_id ? clientMap.get(visit.client_id) : null
    const house = visit?.house_id ? houseMap.get(visit.house_id) : null

    // Compose a rich schedule block with all relevant info
    // Always use visit.name if present, otherwise fallback to visit ID
    let visitName = visit && typeof visit.name === 'string' && visit.name.trim() !== '' ? visit.name : null;
    const schedule: Schedule = {
      start: scheduledStart.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      end: scheduledEnd.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      // Task: show visit name if present, otherwise fallback to Visit #ID
      task: `${visitName ? visitName : `Visit #${assignment.visit_id}`} (${assignment.role_on_visit})\nStatus: ${assignment.status}`,
      // Location: house name
      location: house ? house.name : visit?.house_id ? `House #${visit.house_id}` : 'No house assigned',
      // Client name
      client: client ? `${client.first_name} ${client.last_name}` : visit?.client_id ? `Client #${visit.client_id}` : 'No client assigned',
      month: scheduledStart.getMonth(),
      // Add actual times if present
      actualStart: checkIn ? checkIn.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : null,
      actualEnd: checkOut ? checkOut.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : null
    }

    if (!employeeSchedules.has(assignment.employee_id)) {
      employeeSchedules.set(assignment.employee_id, [])
    }
    employeeSchedules.get(assignment.employee_id)!.push(schedule)
  })

  // Convert to StaffMember format
  return Array.from(employeeSchedules.entries()).map(([employeeId, schedules]) => {
    const employee = employeeMap.get(employeeId)!
    return {
      name: `${employee.first_name} ${employee.last_name}`,
      email: `${employee.first_name.toLowerCase()}.${employee.last_name.toLowerCase()}@company.com`, // Generate email
      position: 'Care Staff', // Default position since not in employee data
      img: DEFAULT_USER_IMG,
      schedules
    }
  })
}

// Reactive sorted staff list
const staffSchedules = computed(() => {
  if (assignmentsLoading.value || employeesLoading.value || visitsLoading.value || clientsLoading.value || housesLoading.value) {
    return []
  }

  let staffData = transformAssignmentsToSchedules(assignments.value, employees.value, visits.value, clients.value, houses.value)

  // Filter by member - now using employee ID
  if (props.selectedMember !== 'all') {
    const selectedEmployeeId = parseInt(props.selectedMember)
    staffData = staffData.filter(staff => {
      // Find the employee that matches this staff member's name
      const employee = employees.value.find(emp => `${emp.first_name} ${emp.last_name}` === staff.name)
      return employee && employee.id === selectedEmployeeId
    })
  }

  // Filter schedules by month
  staffData = staffData.map(m => ({
    ...m,
    schedules: m.schedules.filter(s => typeof s.month === 'number' ? s.month === props.selectedMonth : true)
  }))

  // Sort
  const sorted = staffData.sort((a, b) => {
    if (sortOrder.value === 'asc') {
      return a.name.localeCompare(b.name)
    } else {
      return b.name.localeCompare(a.name)
    }
  })

  return sorted
})

const mobileStaffGroups = computed(() => {
  return staffSchedules.value.map((staff, idx) => {
    const color = STAFF_COLORS[idx % STAFF_COLORS.length]

    return {
      id: `${staff.name}-${idx}`,
      name: staff.name,
      position: staff.position,
      img: staff.img || DEFAULT_USER_IMG,
      schedules: staff.schedules,
      color,
    }
  })
})

// Time slots: hourly intervals from 6am to 11:59pm
const allTimeSlots = computed(() => {
  return generateHourlySlots('6:00 AM', '11:59 PM');
});

function generateHourlySlots(startTime: string, endTime: string): string[] {
  const slots: string[] = [];
  let current = convertTimeToMinutes(startTime);
  const end = convertTimeToMinutes(endTime);

  while (current <= end) {
    const timeString = convertMinutesToTime(current);
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
  const slotEndMinutes = slotMinutes + 60; // 1-hour slot

  for (const schedule of staff.schedules) {
    const startMinutes = convertTimeToMinutes(schedule.start);
    const endMinutes = convertTimeToMinutes(schedule.end);

    // Check if this schedule overlaps with the current slot
    if (endMinutes > slotMinutes && startMinutes < slotEndMinutes) {
      return schedule;
    }
  }
  return null;
}

function shouldRenderScheduleCell(staff: StaffMember, timeSlot: string): boolean {
  const schedule = getScheduleBlock(staff, timeSlot);
  if (!schedule) return true;

  // Only render at the first slot that overlaps with the schedule
  const slotMinutes = convertTimeToMinutes(timeSlot);
  const startMinutes = convertTimeToMinutes(schedule.start);
  const slotEndMinutes = slotMinutes + 60;
  // Render only if this slot contains the start of the schedule, or if the schedule starts within this slot
  return (startMinutes >= slotMinutes && startMinutes < slotEndMinutes) || (slotMinutes === Math.floor(startMinutes / 60) * 60);
}

function getScheduleColspan(staff: StaffMember, timeSlot: string): number {
  const schedule = getScheduleBlock(staff, timeSlot);
  if (!schedule) return 1;

  const slotMinutes = convertTimeToMinutes(timeSlot);
  const slotEndMinutes = slotMinutes + 60;
  const startMinutes = convertTimeToMinutes(schedule.start);
  const endMinutes = convertTimeToMinutes(schedule.end);

  // Calculate how many slots (hours) this schedule spans, starting from this slot
  let colspan = 0;
  let current = slotMinutes;
  while (current < endMinutes && current < slotEndMinutes * allTimeSlots.value.length) {
    // If the schedule overlaps with this slot
    if (endMinutes > current && startMinutes < current + 60) {
      colspan++;
    }
    current += 60;
  }
  // But only allow colspan to extend to the end of the schedule or the end of the table
  const maxColspan = Math.ceil((endMinutes - slotMinutes) / 60);
  return Math.max(1, Math.min(colspan, maxColspan));
}

function getStaffColorClass(staffIdx: number) {
  const color = STAFF_COLORS[staffIdx % STAFF_COLORS.length];
  return `${color.bg} ${color.border} ${color.text}`;
}



</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-6">
    <!-- Mobile Schedule Cards -->
    <div class="md:hidden flex flex-col gap-6">
      <template v-if="mobileStaffGroups.length">
        <div
          v-for="group in mobileStaffGroups"
          :key="group.id"
          class="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 flex flex-col gap-4"
        >
          <div class="flex items-center gap-3">
            <img :src="group.img" alt="Staff photo" class="w-12 h-12 rounded-full border border-white shadow-sm object-cover" />
            <div>
              <div class="text-base font-semibold text-gray-900 leading-tight">
                {{ group.name }}
              </div>
              <div class="text-xs text-gray-500 mt-1">
                {{ group.position }}
              </div>
            </div>
          </div>

          <div v-if="group.schedules.length" class="flex flex-col gap-3">
            <div
              v-for="(schedule, scheduleIdx) in group.schedules"
              :key="`${group.id}-${scheduleIdx}`"
              class="rounded-xl border px-4 py-3 shadow-sm"
              :class="[group.color.bg, group.color.border]"
            >
              <div class="flex items-center justify-between gap-3">
                <div class="text-sm font-semibold text-gray-900">
                  {{ group.name }}
                </div>
                <div class="flex items-center gap-1 text-xs text-gray-700 max-w-[55%] justify-end">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <span class="font-medium leading-tight text-right truncate">{{ schedule.location }}</span>
                </div>
              </div>

              <div class="flex items-center justify-between gap-3 text-xs text-gray-600 mt-1">
                <div class="flex items-center gap-1 max-w-[60%]">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6l4 2"/>
                  </svg>
                  <span class="font-medium leading-tight truncate">{{ schedule.client }}</span>
                </div>
                <span class="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  {{ group.position }}
                </span>
              </div>

              <div class="text-sm text-gray-800 whitespace-pre-line mt-3">
                {{ schedule.task }}
              </div>

              <div class="text-sm font-semibold text-gray-900 mt-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6l3 2"/>
                </svg>
                <span>{{ schedule.start }} - {{ schedule.end }}</span>
              </div>
            </div>
          </div>

          <div v-else class="text-sm text-gray-500 text-center py-4 border border-dashed rounded-xl">
            No schedules for this member.
          </div>
        </div>
      </template>
      <div v-else class="text-center text-gray-500 text-sm py-6 border border-dashed rounded-2xl">
        No schedules available for this period.
      </div>
    </div>

    <!-- Desktop Schedule Grid -->
    <div class="hidden md:block">
      <div class="overflow-x-auto">
        <div class="relative min-w-max">
          <div
            class="absolute top-0 bottom-0 w-px bg-blue-500"
            :style="{ left: employerColWidth + 'px', zIndex: 1 }"
          ></div>

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
                <td
                  class="px-6 py-4 border-b border-gray-100 font-medium text-gray-900 whitespace-nowrap employer-cell sticky left-0 z-10 bg-inherit"
                  :style="{ width: employerColWidth + 'px' }"
                >
                  <div class="flex items-center">
                    <div class="relative">
                      <img :src="staff.img" alt="Staff photo" class="roster-avatar w-12 h-12 rounded-full mr-4 border-2 border-white shadow-sm" />
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

                        <div class="space-y-1">
                          <div class="font-bold text-sm leading-tight whitespace-pre-line">
                            {{ getScheduleBlock(staff, timeSlot)?.task }}
                          </div>
                          <div class="text-xs opacity-75 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                            {{ getScheduleBlock(staff, timeSlot)?.location }}
                          </div>
                          <div class="text-xs opacity-75 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6l4 2"/>
                            </svg>
                            <span>Client: {{ getScheduleBlock(staff, timeSlot)?.client }}</span>
                          </div>
                          <div
                            v-if="getScheduleBlock(staff, timeSlot)?.actualStart || getScheduleBlock(staff, timeSlot)?.actualEnd"
                            class="text-xs opacity-75 flex items-center gap-1"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <rect x="6" y="6" width="12" height="12" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>
                            </svg>
                            <span>
                              Actual:
                              <span v-if="getScheduleBlock(staff, timeSlot)?.actualStart">Check-in: {{ getScheduleBlock(staff, timeSlot)?.actualStart }}</span>
                              <span v-if="getScheduleBlock(staff, timeSlot)?.actualEnd"> | Check-out: {{ getScheduleBlock(staff, timeSlot)?.actualEnd }}</span>
                            </span>
                          </div>
                        </div>
                      </div>

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
    </div>
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

/* Avatar aspect ratio fix for staff images */
.roster-avatar {
  object-fit: cover;
  aspect-ratio: 1/1;
  width: 3rem;
  height: 3rem;
  min-width: 3rem;
  min-height: 3rem;
  max-width: 3rem;
  max-height: 3rem;
  display: inline-block;
}
</style>
