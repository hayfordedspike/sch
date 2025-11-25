<script setup lang="ts">
// Props for filter state
const props = defineProps<{ selectedMember: string; selectedMonth: number; calendarView?: 'day' | 'week' }>();


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
  day?: number; // Add day property for week view
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

    const client = visit ? clientMap.get(visit.client_id) : null
    const house = visit ? houseMap.get(visit.house_id) : null

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
      // Task: show visit name, role, status
      task: `${visitName ? visitName : `Visit #${assignment.visit_id}`} (${assignment.role_on_visit})\nStatus: ${assignment.status}`,
      location: house ? house.name : `House #${visit?.house_id || 'Unknown'}`,
      client: client ? `${client.first_name} ${client.last_name}` : `Client #${visit?.client_id || 'Unknown'}`,
      month: scheduledStart.getMonth(),
      day: scheduledStart.getDate(),
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

// Helper function: generate hourly slots for Day view
function generateHourlySlots(startTime: string, endTime: string): string[] {
  const slots: string[] = [];
  let current = convertTimeToMinutes(startTime);
  const end = convertTimeToMinutes(endTime);
  while (current <= end) {
    const timeString = convertMinutesToTime(current);
    if (convertTimeToMinutes(timeString) <= end) {
      slots.push(timeString);
    }
    current += 60;
  }
  return slots;
}

// Day view: hourly intervals from 6am to 11:59pm
const allTimeSlots = computed(() => {
  return generateHourlySlots('6:00 AM', '11:59 PM');
});

// Month names for week view
const monthNames: string[] = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Week view: days Sun–Sat for the current week
const weekDays = computed(() => {
  if (props.calendarView !== 'week') return [];
  const currentDate = new Date();
  currentDate.setMonth(props.selectedMonth);
  // Set to first day of week (Sunday)
  const dayOfWeek = currentDate.getDay();
  currentDate.setDate(currentDate.getDate() - dayOfWeek);
  const days: { label: string; date: Date }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(currentDate);
    d.setDate(currentDate.getDate() + i);
    days.push({
      label: `${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()]}, ${monthNames[d.getMonth()]} ${d.getDate()}`,
      date: d
    });
  }
  return days;
});

// Week view: get schedules for a staff member on a specific day
function getWeekScheduleBlocks(staff: StaffMember, date: Date): Schedule[] {
  // Match by month and day
  return staff.schedules.filter(s => {
    return typeof s.month === 'number' && s.month === date.getMonth() && typeof s.day === 'number' && s.day === date.getDate();
  });
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
    <div class="overflow-x-auto">
      <div class="relative min-w-max">
        <div class="absolute top-0 bottom-0 w-px bg-blue-500" :style="{ left: employerColWidth + 'px', zIndex: 1 }"></div>
        <!-- Main Table -->
        <table class="min-w-full border-separate border-spacing-0">
          <thead>
            <tr>
              <th class="bg-gray-200 text-left px-6 py-4 font-semibold text-gray-700 border-b border-gray-200 rounded-tl-lg sticky left-0 z-10 cursor-pointer select-none flex items-center gap-2"
                @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'">
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
              <template v-if="props.calendarView === 'day'">
                <th v-for="timeSlot in allTimeSlots" :key="timeSlot"
                  class="bg-gray-200 px-3 py-4 font-semibold text-gray-700 border-b border-gray-200 text-center min-w-[90px]"
                  :class="{ 'bg-blue-50': true, 'rounded-tr-lg': timeSlot === allTimeSlots[allTimeSlots.length - 1] }">
                  <div class="flex flex-col items-center">
                    <span class="text-xs font-bold text-gray-700">
                      {{ timeSlot.split(':')[0] }} {{ timeSlot.split(' ')[1] }}
                    </span>
                  </div>
                </th>
              </template>
              <template v-else>
                <th v-for="day in weekDays" :key="day.label"
                  class="bg-gray-200 px-3 py-4 font-semibold text-gray-700 border-b border-gray-200 text-center min-w-[120px]"
                  :class="{ 'bg-blue-50': true, 'rounded-tr-lg': day === weekDays[weekDays.length - 1] }">
                  <div class="flex flex-col items-center">
                    <span class="text-xs font-bold text-gray-700">{{ day.label }}</span>
                  </div>
                </th>
              </template>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(staff, staffIdx) in staffSchedules" :key="staff.name" :class="staffIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'">
              <!-- Staff Info Column -->
              <td class="px-6 py-4 border-b border-gray-100 font-medium text-gray-900 whitespace-nowrap employer-cell sticky left-0 z-10 bg-inherit"
                :style="{ width: employerColWidth + 'px' }">
                <div class="flex items-center">
                  <div class="relative">
                    <img :src="staff.img" alt="Staff photo" class="roster-avatar" />
                  </div>
                  <div class="flex flex-col">
                    <div class="text-sm font-semibold text-gray-900">{{ staff.name }}</div>
                    <div class="text-xs text-gray-500 mt-0.5">{{ staff.email }}</div>
                    <div class="text-xs mt-2 px-3 py-1 rounded-full font-semibold inline-block max-w-fit"
                      :class="staff.schedules.length > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'">
                      {{ staff.position }}
                    </div>
                  </div>
                </div>
              </td>
              <!-- Day View: Time Slot Columns -->
              <template v-if="props.calendarView === 'day'">
                <template v-for="timeSlot in allTimeSlots" :key="timeSlot">
                  <template v-if="shouldRenderScheduleCell(staff, timeSlot)">
                    <td :colspan="getScheduleColspan(staff, timeSlot)" class="px-2 py-2 border-b border-gray-100 text-center align-top">
                      <div v-if="getScheduleBlock(staff, timeSlot)"
                        :class="[getStaffColorClass(staffIdx), 'rounded-lg px-3 py-3 border text-left h-full flex flex-col justify-between shadow-sm']">
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
                          <div v-if="getScheduleBlock(staff, timeSlot)?.actualStart || getScheduleBlock(staff, timeSlot)?.actualEnd" class="text-xs opacity-75 flex items-center gap-1">
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
                      <!-- Empty State -->
                      <div v-else class="flex items-center justify-center h-full min-h-[80px]">
                        <span class="text-gray-400 text-xs italic">No Schedule</span>
                      </div>
                    </td>
                  </template>
                </template>
              </template>
              <!-- Week View: Day Columns -->
              <template v-else>
                <template v-for="(day, dayIdx) in weekDays" :key="day.label">
                  <td class="px-2 py-2 border-b border-gray-100 text-center align-top">
                    <template v-if="getWeekScheduleBlocks(staff, day.date).length">
                      <div v-for="(schedule, schedIdx) in getWeekScheduleBlocks(staff, day.date)" :key="schedIdx"
                        :class="[getStaffColorClass(dayIdx + schedIdx), 'rounded-lg px-3 py-3 border text-left h-full flex flex-col justify-between shadow-sm mb-2']">
                        <div class="flex items-center justify-between mb-2">
                          <div class="flex items-center gap-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6l4 2"/>
                            </svg>
                            <span class="font-semibold text-xs">
                              {{ schedule.start }} - {{ schedule.end }}
                            </span>
                          </div>
                        </div>
                        <div class="space-y-1">
                          <div class="font-bold text-sm leading-tight">
                            {{ schedule.task }}
                          </div>
                          <div class="text-xs opacity-75 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                            {{ schedule.location }}
                          </div>
                        </div>
                      </div>
                    </template>
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
</template>

<style scoped>
.roster-avatar {
  width: 3rem !important;
  height: 3rem !important;
  min-width: 3rem !important;
  min-height: 3rem !important;
  max-width: 3rem !important;
  max-height: 3rem !important;
  object-fit: cover !important;
  border-radius: 9999px !important;
  border: 2px solid #fff !important;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  margin-right: 1rem;
}
</style>
